import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment signature parameters' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 })
    }

    // Verify Razorpay HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Look up the pending payment record
    const { data: payment, error: fetchError } = await supabase
      .from('rb_payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment order record not found' }, { status: 404 })
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    const creditsToAdd = payment.credits_purchased || 100

    // Update payment record to COMPLETED
    await supabase
      .from('rb_payments')
      .update({
        status: 'COMPLETED',
        razorpay_payment_id,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    // Fetch user credits and update with concurrency check
    const { data: currentCredits } = await supabase
      .from('rb_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const oldBalance = currentCredits?.current_balance || 0
    const newBalance = oldBalance + creditsToAdd

    await supabase
      .from('rb_credits')
      .update({
        current_balance: newBalance,
        total_purchased: (currentCredits?.total_purchased || 0) + creditsToAdd,
        version: (currentCredits?.version || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Ledger entry
    await supabase.from('rb_credit_transactions').insert({
      user_id: user.id,
      transaction_type: 'PURCHASE',
      amount: creditsToAdd,
      balance_after: newBalance,
      description: `Purchased ${creditsToAdd} credits via Razorpay`,
      payment_id: payment.id,
    })

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
      newBalance,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

