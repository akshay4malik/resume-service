import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { downloadFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';

/**
 * GET /api/resumes/[id]/download
 * Authenticates the user, verifies ownership of the resume, and streams
 * the PDF directly from private Cloudflare R2 storage without exposing
 * any public R2 bucket URL.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify resume ownership
    const { data: resume, error: resumeError } = await supabase
      .from('rb_resumes')
      .select('id, title')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const r2Key = `generated_resumes/${user.id}/${resume.id}.pdf`;
    const pdfBuffer = await downloadFromR2(r2Key);

    const safeFileName = (resume.title || 'Resume')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err: any) {
    console.error('[resumes/download] Error:', err);
    return NextResponse.json(
      { error: 'Failed to download resume PDF' },
      { status: 500 }
    );
  }
}

