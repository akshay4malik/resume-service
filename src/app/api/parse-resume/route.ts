/**
 * @file src/app/api/parse-resume/route.ts
 * @description POST /api/parse-resume
 *
 * Ports the Python `/parse-pdf` endpoint (resume.py) to Next.js App Router.
 * Accepts a multipart PDF upload, extracts text via unpdf, sends the EXACT
 * Python prompt to Gemini, normalises and validates the result, uploads the
 * raw PDF to Cloudflare R2, and persists a row in public.files.
 *
 * LLM prompt ported 1:1 from resume.py lines 622–659. Do NOT weaken or change.
 */

export const maxDuration = 30 // Vercel function timeout (seconds)
export const runtime = 'nodejs' // needed for Buffer / unpdf operations

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeResumeData, ResumeDataSchema } from '@/lib/schemas/resume'
import { uploadToR2, getResumeUploadKey } from '@/lib/r2'
import { generateCompletion } from '@/lib/llm'
import { extractText } from 'unpdf'

// ---------------------------------------------------------------------------
// EXACT PYTHON PROMPT (resume.py lines 622–659) — do NOT alter
// ---------------------------------------------------------------------------

function buildParsePrompt(
  markdownContent: string,
  jobDescription: string | null,
  instructions: string | null,
): string {
  return `Extract resume information and return ONLY valid JSON (no markdown, no explanations).
You must output EXACTLY ONE JSON object, not multiple variations or copies.

RULES:
1. NO default values - use null for missing data, not "Location", "2020", etc.
2. EDUCATION: Extract degree, institution, year(s), grade/GPA only. OMIT location - do not include.
   - For year: extract graduation year or date range (e.g. "2018", "2016-2020"). Be precise.
   - For grade: extract GPA, CGPA, percentage, or class (e.g. "3.8", "First Class", "85%").
3. EXPERIENCE: Extract start_date and end_date accurately. Use formats like "2018", "Jan 2018", "2018-2021", or "Present" for current roles. Match exactly what appears in the resume.
4. BE ELABORATIVE for experience/projects - add details, technologies, metrics, impact
   - Keep descriptions under 900 chars (use achievements array for additional points)
5. OMIT optional sections if not in resume: awards, publications, interests, references
6. When JD provided: tailor content to match job requirements with relevant keywords
7. Do NOT return multiple JSON objects or alternative versions. Produce a single, final JSON object only.

RESUME CONTENT:
${markdownContent}

JOB DESCRIPTION: ${jobDescription ?? 'None'}
INSTRUCTIONS: ${instructions ?? 'None'}

JSON STRUCTURE (return exactly this format):
{
"personal_info": {"first_name": "string", "last_name": "string", "email": "string", "phone": null, "address": null, "city": null, "state": null, "country": null, "linkedin": null, "github": null, "website": null, "twitter": null, "professional_title": null, "summary": null},
"education": [{"degree": "string", "institution": "string", "start_date": "year e.g. 2018 or 2016-2020", "end_date": null, "gpa": "grade e.g. 3.8 or First Class or 85%", "thesis_title": null, "relevant_coursework": []}],
"experience": [{"job_title": "string", "company": "string", "location": null, "start_date": "year e.g. 2018 or Jan 2018", "end_date": "year e.g. 2021 or Present", "current": false, "description": "max 900 chars", "achievements": ["use for additional points"]}],
"skills": [{"category": "string", "items": ["string"]}],
"projects": [{"name": "string", "description": "max 900 chars", "technologies": ["string"], "start_date": null, "end_date": null, "demo_link": null, "github_link": null}],
"languages": [{"language": "string", "proficiency": "string"}],
"awards": [{"title": "string", "organization": "string", "year": "string", "description": null}],
"publications": [{"title": "string", "authors": "string", "journal": "string", "year": "string", "doi": null}],
"interests": ["string"],
"references": [{"name": "string", "title": "string", "organization": "string", "email": null, "phone": null}]
}

REQUIRED FIELDS (must have actual values): personal_info.first_name, personal_info.last_name, personal_info.email, education[].degree, education[].institution, education[].start_date (year), education[].gpa (grade if present), experience[].job_title, experience[].company, experience[].start_date, experience[].end_date

Return JSON only, as a single top-level JSON object with no extra text before or after it, Never ever deviate from the structure or format. Your life depends on it.`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse multipart form ─────────────────────────────────────────────────
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid multipart/form-data' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    const jobDescription = (formData.get('job_description') as string | null) || null
    const instructions = (formData.get('instructions') as string | null) || null
    const templateId = (formData.get('template_id') as string | null) || 'template1'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── Validate file ────────────────────────────────────────────────────────
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
    }

    // ── Read file into Buffer ────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uint8 = new Uint8Array(buffer)

    // ── Generate IDs / keys ──────────────────────────────────────────────────
    const fileId = crypto.randomUUID()
    const r2Key = getResumeUploadKey(user.id, fileId)

    // ── Upload raw PDF to R2 ─────────────────────────────────────────────────
    await uploadToR2(r2Key, buffer, 'application/pdf')

    // ── Extract text from PDF ────────────────────────────────────────────────
    let extractedText: string
    try {
      const { text } = await extractText(uint8, { mergePages: true })
      extractedText = text ?? ''
    } catch (extractErr) {
      console.error('[parse-resume] PDF text extraction failed:', extractErr)
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 422 })
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or image-only — no text could be extracted' },
        { status: 422 },
      )
    }

    // ── Call OpenAI with retry ──────────────────────────────────────────────
    const prompt = buildParsePrompt(extractedText, jobDescription, instructions)
    let rawLlmResponse = ''
    const MAX_RETRIES = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        rawLlmResponse = await generateCompletion({
          systemPrompt:
            'You are an expert resume parser. Extract structured information from resume text and return valid JSON only.',
          userPrompt: prompt,
          temperature: 0.1,
          responseFormatJson: true,
        })
        lastError = null
        break
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`[parse-resume] OpenAI attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * attempt))
        }
      }
    }

    if (lastError) {
      console.error('[parse-resume] All OpenAI retries exhausted:', lastError)
      return NextResponse.json({ error: 'LLM service unavailable. Please try again.' }, { status: 503 })
    }

    // ── Parse, normalize, validate ───────────────────────────────────────────
    let parsedJson: Record<string, unknown>
    try {
      parsedJson = JSON.parse(rawLlmResponse)
    } catch (parseErr) {
      console.error('[parse-resume] JSON parse failed. Raw response:', rawLlmResponse)
      return NextResponse.json(
        { error: 'LLM returned malformed JSON', details: String(parseErr) },
        { status: 502 },
      )
    }

    const normalized = normalizeResumeData(parsedJson)
    const validatedData = ResumeDataSchema.parse(normalized)

    // ── Persist file record in Supabase ──────────────────────────────────────
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: dbError } = await supabase
      .from('rb_files')
      .insert({
        id:           fileId,
        user_id:      user.id,
        file_name:    file.name,
        file_type:    'RESUME_INPUT',
        r2_key:       r2Key,
        file_size:    file.size,
        content_type: 'application/pdf',
        status:       'COMPLETED',
        expires_at:   expiresAt,
        processing_completed_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('[parse-resume] Supabase insert error:', dbError)
      // Non-fatal — still return the parsed data
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      session_id:        fileId,
      resume_data:       validatedData,
      parsing_method:    'advanced',
      extracted_sections: {},
      template_id:       templateId,
    })
  } catch (err) {
    console.error('[parse-resume] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
