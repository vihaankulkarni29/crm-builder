import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public keys')
}

// Client for UI
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin for Server Actions (Must not fallback!)
if (!supabaseServiceKey) {
  console.error("🚨 CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing. Admin actions will fail.")
}

// User requested fallback in code block: `supabaseServiceKey || supabaseAnonKey`
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
