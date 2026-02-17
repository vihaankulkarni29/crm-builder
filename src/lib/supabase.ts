import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 1. Client Access (Safe for UI)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Admin Access (For Server Actions ONLY)
// If the Service Key is available (Server-side), use it. Otherwise fall back to Anon.
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) {
    console.error("🚨 FATAL: SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.")
    // We return a broken client that logs errors instead of failing silently with 403s
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { 'x-debug-error': 'missing-service-role-key' } }
    })
  }

  // Log to confirm verify loading (safe enough, only first 3 chars)
  console.log("✅ Service Role Key loaded:", supabaseServiceKey.substring(0, 3) + "...")

  return createClient(supabaseUrl, supabaseServiceKey)
})()
