import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from('rb_user_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rawList = history || []

    // Map candidate names from 0-credit or save logs to merge onto 50-credit logs if needed
    const candidateNamesByResumeId = new Map<string, string>()
    const recentCandidateNames: string[] = []

    for (const item of rawList) {
      if (item.service_type === 'RESUME_BUILD') {
        const rawName = (item.title || '')
          .replace(/^Resume Build:\s*/i, '')
          .replace(/\s+Resume$/i, '')
          .trim()

        if (
          rawName &&
          rawName !== 'My Resume' &&
          rawName !== 'Untitled Resume' &&
          !rawName.toLowerCase().includes('optimization')
        ) {
          const rId = item.details?.resume_id
          if (rId) candidateNamesByResumeId.set(rId, rawName)
          recentCandidateNames.push(rawName)
        }
      }
    }

    // Filter out 0-credit duplicate RESUME_BUILD rows (legacy save logs)
    // and normalize any legacy generic titles
    const consolidatedHistory = rawList
      .filter((item: any) => {
        // Exclude duplicate 0-credit RESUME_BUILD items
        if (item.service_type === 'RESUME_BUILD' && Number(item.credits_used) === 0) {
          return false
        }
        return true
      })
      .map((item: any) => {
        if (item.service_type === 'RESUME_BUILD') {
          const isGeneric =
            item.title === 'AI Resume Optimization & Formatting' ||
            item.title === 'AI Resume Optimization' ||
            item.title === 'Resume Optimization & Formatting' ||
            !item.title?.startsWith('Resume Build:')

          if (isGeneric) {
            const rId = item.details?.resume_id
            const matchedName =
              item.details?.candidate_name ||
              (rId ? candidateNamesByResumeId.get(rId) : null) ||
              recentCandidateNames[0] ||
              'My Resume'

            return {
              ...item,
              title: `Resume Build: ${matchedName}`,
            }
          }
        }
        return item
      })

    return NextResponse.json({ history: consolidatedHistory })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
