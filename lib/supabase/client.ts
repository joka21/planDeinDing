import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (Client Components).
 *
 * Defensive: returns `null` when the public env vars are missing so the app
 * still renders during local setup instead of throwing at import time.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing — browser client disabled.",
      );
    }
    return null;
  }

  return createBrowserClient(url, anonKey);
}
