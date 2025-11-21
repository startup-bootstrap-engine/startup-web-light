import { createClient } from '@supabase/supabase-js';

// Read environment variables directly from process.env
// NEXT_PUBLIC_* vars are safe to read server-side
// Server-only secrets (without NEXT_PUBLIC_) are never exposed to browser
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not set.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will fail.');
}

// Service role key for admin operations (bypasses RLS)
// This should ONLY be used in secure server-side contexts (API routes, webhooks)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
