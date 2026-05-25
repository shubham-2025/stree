import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Creates a stateless Supabase client for API route handlers.
 * Optionally scopes requests to a bearer token so RLS applies to the signed-in user.
 */
export function createRequestClient(accessToken?: string) {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function getRequestAccessToken(request: Request): string | null {
  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
}
