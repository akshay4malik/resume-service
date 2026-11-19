import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// INR Pricing: 1 Credit = ₹1.00 (Flat ₹50 / resume, Flat ₹2 / rank)
const CREDIT_PACKS_INR: Record<string, { credits: number; amount: number; label: string }> = {
  resume_single: { credits: 50, amount: 5000, label: '1 Resume Build (50 Credits) - ₹50' },
  resume_duo: { credits: 100, amount: 10000, label: '2 Resume Builds (100 Credits) - ₹100' },
  recruiter_100: { credits: 200, amount: 20000, label: '100 Resume Rankings (200 Credits) - ₹200' },
  recruiter_250: { credits: 500, amount: 50000, label: '250 Resume Rankings (500 Credits) - ₹500' },
}

// USD Pricing: $1.00 = 50 Credits (Flat $1 / resume, Flat $0.04 / rank)
const CREDIT_PACKS_USD: Record<string, { credits: number; amount: number; label: string }> = {
  resume_single: { credits: 50, amount: 100, label: '1 Resume Build (50 Credits) - $1' },
  resume_duo: { credits: 100, amount: 200, label: '2 Resume Builds (100 Credits) - $2' },
  recruiter_100: { credits: 200, amount: 400, label: '100 Resume Rankings (200 Credits) - $4' },
  recruiter_250: { credits: 500, amount: 1000, label: '250 Resume Rankings (500 Credits) - $10' },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packId, customAmount, requestedCurrency } = body

    // Detect currency from request body, cookie, or Vercel edge country header
    const cookieCurrency = request.cookies.get('kestral_currency')?.value
    const vercelCountry = request.headers.get('x-vercel-ip-country') || 'IN'

    let currency = 'INR'
    if (requestedCurrency) {
      currency = requestedCurrency.toUpperCase() === 'USD' ? 'USD' : 'INR'
    } else if (cookieCurrency) {
      currency = cookieCurrency.toUpperCase() === 'USD' ? 'USD' : 'INR'
    } else {
      currency = vercelCountry.toUpperCase() === 'IN' ? 'INR' : 'USD'
    }

    const isUSD = currency === 'USD'
    const packs = isUSD ? CREDIT_PACKS_USD : CREDIT_PACKS_INR

    let credits: number
    let amountInSmallestUnit: number // Paise for INR, Cents for USD
    let label: string
    let pack_id = 'custom'

    if (customAmount !== undefined && customAmount !== null) {
      const amt = Number(customAmount)
      if (isUSD) {
        if (isNaN(amt) || amt < 1) {
          return NextResponse.json({ error: 'Minimum top up amount is $1' }, { status: 400 })
        }
        if (amt > 1000) {
          return NextResponse.json({ error: 'Maximum single top up amount is $1,000' }, { status: 400 })
        }
        credits = Math.floor(amt * 50) // $1 = 50 credits
        amountInSmallestUnit = Math.round(amt * 100) // in cents
        label = `Custom Credit Top-up (${credits} Credits) - $${amt}`
        pack_id = `custom_${amt}_usd`
      } else {
        if (isNaN(amt) || amt < 10) {
          return NextResponse.json({ error: 'Minimum top up amount is ₹10' }, { status: 400 })
        }
        if (amt > 50000) {
          return NextResponse.json({ error: 'Maximum single top up amount is ₹50,000' }, { status: 400 })
        }
        credits = Math.floor(amt) // ₹1 = 1 credit
        amountInSmallestUnit = Math.round(amt * 100) // in paise
        label = `Custom Credit Top-up (${credits} Credits) - ₹${amt}`
        pack_id = `custom_${amt}_inr`
      }
    } else if (packId && packs[packId]) {
      const pack = packs[packId]
      credits = pack.credits
      amountInSmallestUnit = pack.amount
      label = pack.label
      pack_id = `${packId}_${currency.toLowerCase()}`
    } else {
      return NextResponse.json({ error: 'Please specify a valid package or custom amount' }, { status: 400 })
    }

    if (amountInSmallestUnit < 100) {
      return NextResponse.json({ error: 'Minimum amount must be at least 100 paise' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || keyId.startsWith('rzp_live_...')) {
      return NextResponse.json({ 
        error: 'Payment gateway API credentials not configured in .env.local',
      }, { status: 503 })
    }

    // Call Razorpay API to generate order in requested currency (INR or USD)
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const receipt = `kestral_${currency.toLowerCase()}_${Date.now()}`

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency,
        receipt,
        notes: {
          user_id: user.id,
          pack_id,
          credits,
          currency,
        },
      }),
    })

    const orderData = await rzpResponse.json()
    if (!rzpResponse.ok) {
      return NextResponse.json({ error: orderData.error?.description || 'Payment order creation failed' }, { status: 502 })
    }

    // Record order in rb_payments table
    await supabase.from('rb_payments').insert({
      user_id: user.id,
      razorpay_order_id: orderData.id,
      amount: amountInSmallestUnit,
      currency,
      status: 'PENDING',
      credits_purchased: credits,
      metadata: { pack_id, receipt, currency },
    })

    return NextResponse.json({
      orderId: orderData.id,
      order_id: orderData.id,
      amount: amountInSmallestUnit,
      currency,
      keyId,
      pack: {
        id: pack_id,
        credits,
        label,
      },
    })
  } catch (err: any) {
    console.error('[create-order] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
