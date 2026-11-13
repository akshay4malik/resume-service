import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const paramCountry = req.nextUrl.searchParams.get('country');
    const paramCurrency = req.nextUrl.searchParams.get('currency');
    const cookieCurrency = req.cookies.get('kestral_currency')?.value;

    // Detect country from Vercel header or Cloudflare header
    const vercelCountry =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      null;

    // On local development, if headers are absent and no param provided, default to IN
    const country = (paramCountry || vercelCountry || 'IN').toUpperCase();

    let currency = 'INR';
    if (paramCurrency) {
      currency = paramCurrency.toUpperCase() === 'USD' ? 'USD' : 'INR';
    } else if (cookieCurrency) {
      currency = cookieCurrency.toUpperCase() === 'USD' ? 'USD' : 'INR';
    } else {
      // If user is from India -> INR, otherwise International -> USD
      currency = country === 'IN' ? 'INR' : 'USD';
    }

    const isIndia = currency === 'INR';
    const symbol = isIndia ? '₹' : '$';

    const response = NextResponse.json({
      country,
      currency,
      symbol,
      isIndia,
      rates: {
        creditsPerDollar: 50, // $1 = 50 credits
        creditsPerRupee: 1,   // ₹1 = 1 credit
        resumeBuildCredits: 50, // 50 credits ($1 or ₹50)
        resumeRankCredits: 2,   // 2 credits ($0.04 or ₹2)
        prices: {
          resumeBuild: isIndia ? '₹50' : '$1',
          resumeRank: isIndia ? '₹2' : '$0.04',
          bulk100Ranks: isIndia ? '₹200' : '$4',
          customRate: isIndia ? '₹1 = 1 Credit' : '$1 = 50 Credits',
        },
      },
    });

    // If explicit currency was requested in query, persist it in cookie
    if (paramCurrency) {
      response.cookies.set('kestral_currency', currency, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { country: 'IN', currency: 'INR', symbol: '₹', isIndia: true },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { currency } = await req.json();
    const validCurrency = currency === 'USD' ? 'USD' : 'INR';

    const response = NextResponse.json({
      success: true,
      currency: validCurrency,
      symbol: validCurrency === 'INR' ? '₹' : '$',
      isIndia: validCurrency === 'INR',
    });

    response.cookies.set('kestral_currency', validCurrency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
