/**
 * @file src/lib/supabase/middleware.ts
 * @description Supabase session refresh helper for Next.js middleware.
 *
 * Call `updateSession(request)` inside your middleware to keep the user's
 * Supabase session alive across navigations by refreshing the auth cookie.
 *
 * IMPORTANT: This file must NOT import anything from 'next/headers' — it runs
 * in the Edge runtime (middleware context) where that module is unavailable.
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Start with a response we can mutate (set cookies on)
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // Write cookies onto the *request* so subsequent middleware reads them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Re-create the response to pick up the updated request cookies,
          // then write the same cookies onto the *response* so the browser stores them
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do NOT remove this call.
  // It refreshes the session and keeps the auth cookie up-to-date.
  // Avoid writing any logic between createServerClient and getUser().
  await supabase.auth.getUser()

  return supabaseResponse
}
