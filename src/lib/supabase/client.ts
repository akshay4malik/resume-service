/**
 * @file src/lib/supabase/client.ts
 * @description Supabase browser client for use in Client Components.
 * Uses @supabase/ssr's createBrowserClient which manages cookies automatically.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
