import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string;
  role: "user" | "admin";
  can_rate: boolean;
};

/** Aktuell angemeldeter Auth-User (serverseitig, validiert) oder null. */
export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Profil des angemeldeten Nutzers (inkl. role/can_rate) oder null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, can_rate")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

/** Erzwingt eine Session; leitet sonst auf /login um. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Erzwingt ein geladenes Profil; leitet sonst auf /login um. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Erzwingt Admin-Rolle; leitet Nicht-Admins auf die Startseite um. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
