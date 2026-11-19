/**
 * @file src/middleware.ts
 * @description Next.js middleware — runs on every matched request.
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie (keeps auth alive)
 *  2. Protect private routes under /dashboard, /resume, /api (except /api/auth/*)
 *  3. Redirect unauthenticated visitors to /login
 *  4. Let public routes (/login, /signup, /) pass through freely
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/refund-policy',
  '/terms',
  '/privacy',
  '/shipping-policy',
  '/contact',
]

// Prefixes that are always public (e.g. /api/auth/* for Supabase callbacks, /api/geo for currency detection)
const PUBLIC_API_PREFIXES = ['/api/auth', '/auth/callback', '/api/geo']

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  return false
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/api')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Always refresh the Supabase session (updates the auth cookie)
  const supabaseResponse = await updateSession(request)

  // 2. If this is a public route, nothing more to do
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // 3. Only enforce auth on protected routes
  if (isProtectedRoute(pathname)) {
    // Read the (possibly refreshed) user from the session cookie
    // We need a fresh client scoped to the *incoming* request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Intentional no-op — cookie writes were handled by updateSession
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Redirect unauthenticated users to /login, preserving the original URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser icon)
     * - public assets (png, jpg, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot|css|js)$).*)',
  ],
}
