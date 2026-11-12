/**
 * @file src/app/api/upload-url/route.ts
 * @description POST /api/upload-url
 *
 * Generates a short-lived R2 pre-signed PUT URL so the browser can upload a
 * file directly to Cloudflare R2 without routing the bytes through this server.
 *
 * Flow (client perspective):
 *   1. POST /api/upload-url → receive { upload_url, file_id, r2_key }
 *   2. PUT the file directly to upload_url with the correct Content-Type header
 *   3. Notify the server of completion (or let the DB row status speak for itself)
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPresignedUploadUrl,
  getResumeUploadKey,
  getCoverLetterKey,
} from '@/lib/r2'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const ALLOWED_FILE_TYPES = ['RESUME_INPUT', 'COVER_LETTER'] as const

const UploadUrlBodySchema = z.object({
  file_type:    z.enum(ALLOWED_FILE_TYPES),
  content_type: z.string().min(1),
  file_name:    z.string().min(1).max(255),
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

    const parsed = UploadUrlBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { file_type, content_type, file_name } = parsed.data

    // ── Generate file ID and R2 key ──────────────────────────────────────────
    const fileId = crypto.randomUUID()

    let r2Key: string
    switch (file_type) {
      case 'RESUME_INPUT':
        r2Key = getResumeUploadKey(user.id, fileId)
        break
      case 'COVER_LETTER':
        r2Key = getCoverLetterKey(user.id, fileId)
        break
      default:
        // TypeScript exhaustiveness guard
        return NextResponse.json({ error: 'Unsupported file_type' }, { status: 400 })
    }

    // ── Generate pre-signed upload URL (5-minute validity) ───────────────────
    let uploadUrl: string
    try {
      uploadUrl = await getPresignedUploadUrl(r2Key, content_type, 300)
    } catch (r2Err) {
      console.error('[upload-url] Failed to generate presigned URL:', r2Err)
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }

    // ── Insert a PENDING file record in Supabase ─────────────────────────────
    const { error: dbError } = await supabase.from('rb_files').insert({
      id:           fileId,
      user_id:      user.id,
      file_name,
      file_type,
      r2_key:       r2Key,
      content_type,
      status:       'PENDING',
    })

    if (dbError) {
      console.error('[upload-url] Supabase insert error:', dbError)
      // Still return the URL — client can retry the DB record creation later
      // but we log so it can be investigated
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      upload_url: uploadUrl,
      file_id:    fileId,
      r2_key:     r2Key,
    })
  } catch (err) {
    console.error('[upload-url] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
