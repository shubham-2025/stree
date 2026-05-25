import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv, getSupabaseServiceRoleEnv } from "@/lib/supabase/env";

/**
 * Creates a privileged Supabase client for server-side admin auth operations.
 */
export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const { serviceRoleKey } = getSupabaseServiceRoleEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a non-persisted public client for server-side sign-in after admin user creation.
 */
export function createServerPublicClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

