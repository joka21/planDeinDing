import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-Role-Client (umgeht RLS). NUR serverseitig und ausschließlich nach
 * einer Admin-Prüfung verwenden — z. B. zum Ändern von profiles.can_rate,
 * das laut Datenmodell nur Admins dürfen. Der Key trägt KEIN NEXT_PUBLIC_-Präfix
 * und gelangt damit nie in den Client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
