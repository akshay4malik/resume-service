import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Pricing tiers matching 1 Credit = ₹1.00 (Flat ₹50 / resume, Flat ₹2 / rank)
const CREDIT_PACKS: Record<string, { credits: number; amountPaise: number; label: string }> = {
  resume_single: { credits: 50, amountPaise: 5000, label: '1 Resume Build (50 Credits) - ₹50' },   // ₹50 (1 Resume)
  resume_duo: { credits: 100, amountPaise: 10000, label: '2 Resume Builds (100 Credits) - ₹100' }, // ₹100 (2 Resumes)
  recruiter_100: { credits: 200, amountPaise: 20000, label: '100 Resume Rankings (200 Credits) - ₹200' }, // ₹200 (100 candidates)
  recruiter_250: { credits: 500, amountPaise: 50000, label: '250 Resume Rankings (500 Credits) - ₹500' }, // ₹500 (250 candidates)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let credits: number
    let amountPaise: number
    let label: string
    let pack_id = 'custom'

    const body = await request.json()
    const { packId, customAmount } = body

    if (customAmount !== undefined && customAmount !== null) {
      const amt = Number(customAmount)
      if (isNaN(amt) || amt < 10) {
        return NextResponse.json({ error: 'Minimum top up amount is ₹10' }, { status: 400 })
      }
      if (amt > 50000) {
        return NextResponse.json({ error: 'Maximum single top up amount is ₹50,000' }, { status: 400 })
      }
      credits = Math.floor(amt) // 1 Rupee = 1 Credit
      amountPaise = Math.round(amt * 100)
      label = `Custom Credit Top-up (${credits} Credits) - ₹${amt}`
      pack_id = `custom_${amt}`
    } else if (packId && CREDIT_PACKS[packId]) {
      const pack = CREDIT_PACKS[packId]
      credits = pack.credits
      amountPaise = pack.amountPaise
      label = pack.label
      pack_id = packId
    } else {
      return NextResponse.json({ error: 'Please specify a valid package or custom amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || keyId.startsWith('rzp_live_...')) {
      return NextResponse.json({ 
        error: 'Razorpay API credentials not configured in .env.local',
      }, { status: 503 })
    }

    // Call Razorpay API to generate order
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const receipt = `kestral_rcpt_${Date.now()}`

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          user_id: user.id,
          pack_id,
          credits,
        },
      }),
    })

    const orderData = await rzpResponse.json()
    if (!rzpResponse.ok) {
      return NextResponse.json({ error: orderData.error?.description || 'Razorpay order creation failed' }, { status: 502 })
    }

    // Record order in rb_payments table
    await supabase.from('rb_payments').insert({
      user_id: user.id,
      razorpay_order_id: orderData.id,
      amount: amountPaise,
      currency: 'INR',
      status: 'PENDING',
      credits_purchased: credits,
      metadata: { pack_id, receipt },
    })

    return NextResponse.json({
      orderId: orderData.id,
      amount: amountPaise,
      currency: 'INR',
      keyId,
      pack: {
        credits,
        amountPaise,
        label,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

