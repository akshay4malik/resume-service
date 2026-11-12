/**
 * @file src/app/api/cover-letter/route.ts
 * @description POST /api/cover-letter
 *
 * Ports the Python cover letter generation endpoint.
 * Generates a personalised cover letter using Gemini, saves metadata to
 * public.files, and returns the text. PDF generation is done client-side
 * with @react-pdf/renderer — this endpoint never generates a PDF.
 */

export const maxDuration = 20 // seconds — Vercel function timeout
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ResumeDataSchema, type ResumeData } from '@/lib/schemas/resume'
import { generateCompletion } from '@/lib/llm'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const CoverLetterBodySchema = z.object({
  resume_data:     ResumeDataSchema,
  job_description: z.string().min(1, 'job_description must not be empty'),
  session_id:      z.string().optional().nullable(),
  max_words:       z.number().int().positive().default(350),
})

// ---------------------------------------------------------------------------
// Prompt builder (ported from Python cover letter generation logic)
// ---------------------------------------------------------------------------

function buildCoverLetterPrompt(
  resumeData: ResumeData,
  jobDescription: string,
  maxWords: number,
): string {
  const name = [
    resumeData.personal_info.first_name,
    resumeData.personal_info.last_name,
  ]
    .filter(Boolean)
    .join(' ')

  return `You are a professional cover letter writer. Write a compelling, personalized cover letter.
Use the candidate's resume data and tailor it to the job description.
Keep it to ${maxWords} words. Be specific, professional, and engaging.
Do NOT use generic phrases. Reference specific skills and experiences from the resume.

Candidate Name: ${name}
Job Description: ${jobDescription}
Resume Data: ${JSON.stringify(resumeData)}

Write only the cover letter body text (no subject line, no date). Start directly.`
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

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = CoverLetterBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { resume_data, job_description, session_id, max_words } = parsed.data

    // ── Build prompt and call OpenAI ─────────────────────────────────────────
    const prompt = buildCoverLetterPrompt(resume_data, job_description, max_words)

    let coverLetterText = ''
    try {
      coverLetterText = await generateCompletion({
        systemPrompt: 'You are an expert cover letter writer.',
        userPrompt: prompt,
        temperature: 0.7,
      })
      coverLetterText = coverLetterText.trim()
    } catch (llmErr) {
      console.error('[cover-letter] OpenAI error:', llmErr)
      return NextResponse.json({ error: 'LLM service unavailable. Please try again.' }, { status: 503 })
    }

    // ── Persist file record in Supabase ──────────────────────────────────────
    // No PDF stored — cover letter is text only; PDF rendered client-side.
    // We use a dummy r2_key since no file is actually uploaded.
    const fileId = crypto.randomUUID()
    const dummyR2Key = `cover_letter/${user.id}/${fileId}.txt`

    const { error: dbError } = await supabase.from('rb_files').insert({
      id:           fileId,
      user_id:      user.id,
      file_name:    'cover_letter.txt',
      file_type:    'COVER_LETTER',
      r2_key:       dummyR2Key,
      file_size:    Buffer.byteLength(coverLetterText, 'utf-8'),
      content_type: 'text/plain',
      status:       'COMPLETED',
      processing_completed_at: new Date().toISOString(),
      metadata: {
        cover_letter_text: coverLetterText,
        session_id:        session_id ?? null,
        job_description,
      },
    })

    if (dbError) {
      // Non-fatal — still return the generated text
      console.warn('[cover-letter] Supabase insert warning:', dbError)
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      cover_letter: coverLetterText,
      file_id:      fileId,
      pdf_pending:  false, // PDF is generated client-side
    })
  } catch (err) {
    console.error('[cover-letter] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
