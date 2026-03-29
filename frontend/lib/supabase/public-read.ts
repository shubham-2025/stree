import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Anonymous Supabase client (no cookies). Use for public catalog data so
 * routes can use ISR/static generation without triggering `cookies()` dynamic errors.
 * RLS must allow `anon` to read the relevant tables.
 */
export function createPublicReadClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey);
}
