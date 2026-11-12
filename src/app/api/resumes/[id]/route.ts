/**
 * @file src/app/api/resumes/[id]/route.ts
 * @description
 *   GET    /api/resumes/[id] — fetch a single resume with full data
 *   PATCH  /api/resumes/[id] — update resume fields
 *   DELETE /api/resumes/[id] — permanently delete a resume
 *
 * Supabase RLS policies ensure users can only access their own resumes.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ResumeDataSchema } from '@/lib/schemas/resume'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared context type
// ---------------------------------------------------------------------------

type RouteContext = { params: Promise<{ id: string }> }

// ---------------------------------------------------------------------------
// GET /api/resumes/[id]
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('rb_resumes')
      .select(
        'id, title, template_id, job_description, parsed_data, optimized_data, ats_score, is_paid, created_at, updated_at',
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      // RLS + .single() will return an error for not-found or unauthorized rows
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({ resume: data })
  } catch (err) {
    console.error('[resumes/get] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/resumes/[id]
// ---------------------------------------------------------------------------

const PatchBodySchema = z.object({
  title:          z.string().min(1).max(255).optional(),
  template_id:    z.string().optional(),
  job_description: z.string().nullable().optional(),
  optimized_data: z.unknown().optional(),  // validated below if present
})

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = PatchBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { title, template_id, job_description, optimized_data } = parsed.data

    // Build the update payload — only include provided fields
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (template_id !== undefined) updates.template_id = template_id
    if (job_description !== undefined) updates.job_description = job_description

    // Validate optimized_data if provided
    if (optimized_data !== undefined) {
      const validResult = ResumeDataSchema.safeParse(optimized_data)
      if (!validResult.success) {
        return NextResponse.json(
          { error: 'Invalid optimized_data', details: validResult.error.flatten() },
          { status: 400 },
        )
      }
      updates.optimized_data = validResult.data
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // updated_at is stamped by the DB trigger (handle_updated_at)
    const { data, error } = await supabase
      .from('rb_resumes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, template_id, ats_score, is_paid, updated_at')
      .single()

    if (error || !data) {
      console.error('[resumes/patch] Supabase update error:', error)
      return NextResponse.json({ error: 'Resume not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ resume: data })
  } catch (err) {
    console.error('[resumes/patch] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/resumes/[id]
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('rb_resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[resumes/delete] Supabase delete error:', error)
      return NextResponse.json({ error: 'Resume not found or delete failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('[resumes/delete] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
