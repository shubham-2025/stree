/**
 * Fails fast with a clear message (visible in Vercel / server logs) when
 * public Supabase env vars are missing — a common cause of opaque RSC errors in production.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing: use Vercel → Integrations → Supabase (linked project), or set SUPABASE_URL + SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY for Production & Preview."
    );
  }
  return { url, anonKey };
}
