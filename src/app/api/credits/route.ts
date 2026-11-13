import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserCredits } from '@/lib/credits'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credits = await getUserCredits(supabase, user.id)

    // Also get last 20 transactions
    const { data: transactions } = await supabase
      .from('rb_credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const normalizedTransactions = (transactions || []).map((tx) => {
      if (
        tx.description === 'AI Resume Optimization & Formatting' ||
        tx.description === 'AI Resume Optimization'
      ) {
        const candidateName = tx.metadata?.candidate_name
        return {
          ...tx,
          description: candidateName ? `Resume Build: ${candidateName}` : 'Resume Build: My Resume',
        }
      }
      return tx
    })

    return NextResponse.json({
      credits,
      transactions: normalizedTransactions,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
