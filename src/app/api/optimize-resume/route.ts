/**
 * @file src/app/api/optimize-resume/route.ts
 * @description POST /api/optimize-resume
 *
 * Ports the Python `/optimize-data` endpoint (resume.py lines 751–774).
 * Accepts a structured resume JSON body, sends the EXACT Python optimize
 * prompt to Gemini, normalises/validates the result, and upserts a row in
 * public.resumes.
 *
 * LLM prompt ported 1:1 from resume.py. Do NOT weaken or change.
 */

export const maxDuration = 60 // seconds — Vercel function timeout
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeResumeData, ResumeDataSchema } from '@/lib/schemas/resume'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'
import { generateCompletion } from '@/lib/llm'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// EXACT PYTHON PROMPT (resume.py lines 751–774) — do NOT alter
// ---------------------------------------------------------------------------

function buildOptimizePrompt(
  resumeData: Record<string, unknown>,
  jobDescription: string | null,
  instructions: string | null,
): string {
  return `You are an expert resume writer. 
I have a user's structured resume information (JSON).
I also have a Job Description (JD) and some specific formatting instructions.

Task: Enhance and optimize this "candidate information dictionary" in JSON format.

1. Use the provided User Data as the base.
2. Tailor the content (summary, experience descriptions, skills) to align with the provided Job Description.
3. Follow the specific Instructions provided.
4. Fix any grammatical errors or weak phrasing.
5. Ensure the output is a valid JSON object matching the schema for ResumeData.

User Data (JSON):
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription ?? 'Generic optimization'}

Instructions:
${instructions ?? 'Improve clarity and impact.'}

Output valid JSON only.`
}

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const OptimizeBodySchema = z.object({
  resume_data:     ResumeDataSchema,
  job_description: z.string().optional().nullable(),
  instructions:    z.string().optional().nullable(),
  resume_id:       z.string().uuid().optional().nullable(),
  template_id:     z.string().optional().default('template1'),
  session_id:      z.string().optional().nullable(),
})

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

    const parsed = OptimizeBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { resume_data, job_description, instructions, resume_id, template_id, session_id } =
      parsed.data

    // ── Deduct 50 Credits for Resume Build / Optimization ────────────────────
    const deduction = await deductCredits(supabase, {
      userId: user.id,
      amount: CREDIT_COSTS.RESUME_BUILD,
      description: 'AI Resume Optimization & Formatting',
      serviceType: 'RESUME_BUILD',
      details: { template_id },
    })

    if (!deduction.success) {
      return NextResponse.json(
        { error: deduction.error || 'Insufficient credits to optimize resume.' },
        { status: 402 } // Payment Required
      )
    }

    // ── Build prompt and call OpenAI ─────────────────────────────────────────
    const prompt = buildOptimizePrompt(
      resume_data as unknown as Record<string, unknown>,
      job_description ?? null,
      instructions ?? null,
    )

    let rawLlmResponse = ''
    const MAX_RETRIES = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        rawLlmResponse = await generateCompletion({
          systemPrompt:
            'You are an expert resume writer and ATS optimization specialist.',
          userPrompt: prompt,
          temperature: 0.3,
          responseFormatJson: true,
        })
        lastError = null
        break
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`[optimize-resume] OpenAI attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * attempt))
        }
      }
    }

    if (lastError) {
      console.error('[optimize-resume] All OpenAI retries exhausted:', lastError)
      return NextResponse.json({ error: 'LLM service unavailable. Please try again.' }, { status: 503 })
    }

    // ── Parse, normalize, validate ───────────────────────────────────────────
    let parsedJson: Record<string, unknown>
    try {
      parsedJson = JSON.parse(rawLlmResponse)
    } catch (parseErr) {
      console.error('[optimize-resume] JSON parse failed. Raw response:', rawLlmResponse)
      return NextResponse.json(
        { error: 'LLM returned malformed JSON', details: String(parseErr) },
        { status: 502 },
      )
    }

    const normalized = normalizeResumeData(parsedJson)
    const optimizedData = ResumeDataSchema.parse(normalized)

    // ── Derive a title from personal_info ────────────────────────────────────
    const title =
      [optimizedData.personal_info.first_name, optimizedData.personal_info.last_name]
        .filter(Boolean)
        .join(' ') || 'Untitled Resume'

    // ── Upsert resume in Supabase ────────────────────────────────────────────
    let supabaseResumeId: string

    if (resume_id) {
      // UPDATE existing row
      const { data: updated, error: updateError } = await supabase
        .from('rb_resumes')
        .update({
          optimized_data:  optimizedData,
          job_description: job_description ?? null,
          updated_at:      new Date().toISOString(),
        })
        .eq('id', resume_id)
        .eq('user_id', user.id) // RLS also enforces this, but explicit is safer
        .select('id')
        .single()

      if (updateError || !updated) {
        console.error('[optimize-resume] Supabase UPDATE error:', updateError)
        return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 })
      }

      supabaseResumeId = updated.id as string
    } else {
      // INSERT new row
      const { data: inserted, error: insertError } = await supabase
        .from('rb_resumes')
        .insert({
          user_id:         user.id,
          title,
          template_id:     template_id ?? 'template1',
          job_description: job_description ?? null,
          optimized_data:  optimizedData,
        })
        .select('id')
        .single()

      if (insertError || !inserted) {
        console.error('[optimize-resume] Supabase INSERT error:', insertError)
        return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
      }

      supabaseResumeId = inserted.id as string
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      session_id:     session_id ?? supabaseResumeId,
      resume_data:    optimizedData,
      resume_id:      supabaseResumeId,
      parsing_method: 'advanced',
    })
  } catch (err) {
    console.error('[optimize-resume] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
