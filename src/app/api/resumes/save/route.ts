import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';

/**
 * POST /api/resumes/save
 * Accepts multipart/form-data with:
 * - pdf: PDF blob rendered client-side
 * - resume_data: JSON string of resume data
 * - template_id: template ID string
 * - title: resume title
 * - job_description: optional target JD
 *
 * Uploads the rendered PDF to Cloudflare R2:
 *   generated_resumes/{userId}/{resumeId}.pdf
 * And saves a record in Supabase rb_resumes + rb_user_history.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File | null;
    const resumeDataRaw = formData.get('resume_data') as string | null;
    const templateId = (formData.get('template_id') as string) || 'template1';
    const jobDescription = (formData.get('job_description') as string) || null;
    const customTitle = formData.get('title') as string | null;

    if (!resumeDataRaw) {
      return NextResponse.json({ error: 'resume_data is required' }, { status: 400 });
    }

    const resumeData = JSON.parse(resumeDataRaw);
    const requestedResumeId = formData.get('resume_id') as string | null;
    const resumeId = requestedResumeId || crypto.randomUUID();
    let pdfStorageKey: string | null = null;

    // Upload rendered PDF to Cloudflare R2 if provided
    if (pdfFile) {
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      pdfStorageKey = `generated_resumes/${user.id}/${resumeId}.pdf`;
      await uploadToR2(pdfStorageKey, buffer, 'application/pdf');
    }

    const title =
      customTitle ||
      [resumeData.personal_info?.first_name, resumeData.personal_info?.last_name]
        .filter(Boolean)
        .join(' ') ||
      'Generated Resume';

    // Upsert into rb_resumes (matches on id primary key)
    const { data: savedResume, error: upsertError } = await supabase
      .from('rb_resumes')
      .upsert(
        {
          id: resumeId,
          user_id: user.id,
          title,
          template_id: templateId,
          job_description: jobDescription,
          parsed_data: resumeData,
          optimized_data: resumeData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (upsertError) {
      console.error('[resumes/save] Supabase upsert error:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Update existing rb_user_history record details to attach pdf_storage_key without creating a duplicate row
    if (resumeId && pdfStorageKey) {
      const { data: existingHistories } = await supabase
        .from('rb_user_history')
        .select('id, details')
        .eq('user_id', user.id)
        .eq('service_type', 'RESUME_BUILD')
        .order('created_at', { ascending: false })
        .limit(10);

      const matchingHistory = existingHistories?.find(
        (h) => (h.details as any)?.resume_id === resumeId
      );

      if (matchingHistory) {
        await supabase
          .from('rb_user_history')
          .update({
            details: {
              ...(typeof matchingHistory.details === 'object' && matchingHistory.details !== null
                ? matchingHistory.details
                : {}),
              pdf_storage_key: pdfStorageKey,
            },
          })
          .eq('id', matchingHistory.id);
      }
    }

    return NextResponse.json({
      success: true,
      resume: savedResume,
      pdf_url: pdfStorageKey ? `/api/resumes/${resumeId}/download` : null,
    });
  } catch (err: any) {
    console.error('[resumes/save] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

