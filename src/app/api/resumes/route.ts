/**
 * @file src/app/api/resumes/route.ts
 * @description GET /api/resumes — list the authenticated user's resumes.
 *
 * Returns a paginated list of resume summaries ordered by created_at desc.
 * Full resume data (parsed_data / optimized_data) is intentionally excluded
 * from this listing endpoint to keep responses lightweight.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
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

    // ── Parse query params ───────────────────────────────────────────────────
    const { searchParams } = new URL(request.url)
    const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)
    const limit = Math.min(isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : rawLimit, MAX_LIMIT)

    // ── Query ────────────────────────────────────────────────────────────────
    // RLS ensures only the authenticated user's rows are returned.
    const { data, error } = await supabase
      .from('rb_resumes')
      .select('id, title, template_id, ats_score, is_paid, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[resumes/list] Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
    }

    // Attach pdf_storage_key from rb_user_history details if available
    const { data: historyRows } = await supabase
      .from('rb_user_history')
      .select('details')
      .eq('user_id', user.id)
      .eq('service_type', 'RESUME_BUILD')
      .order('created_at', { ascending: false })
      .limit(100)

    const pdfKeyMap = new Map<string, string>()
    for (const row of historyRows ?? []) {
      const details = row.details as Record<string, unknown> | null
      const rId = details?.resume_id as string | undefined
      const key = details?.pdf_storage_key as string | undefined
      if (rId && key && !pdfKeyMap.has(rId)) {
        pdfKeyMap.set(rId, key)
      }
    }

    const resumesWithPdf = (data ?? []).map((r) => ({
      ...r,
      pdf_storage_key: pdfKeyMap.get(r.id) ?? null,
    }))

    return NextResponse.json({ resumes: resumesWithPdf })
  } catch (err) {
    console.error('[resumes/list] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
