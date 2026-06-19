"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validation/auth";

export type RegisterResult = { error: string } | undefined;

export async function registerAction(values: unknown): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte überprüfe deine Eingaben." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Der Dienst ist gerade nicht verfügbar. Bitte später erneut versuchen." };
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
      emailRedirectTo: `${origin}/auth/callback?next=/profil`,
    },
  });

  if (error) {
    return { error: "Registrierung fehlgeschlagen. Eventuell existiert bereits ein Konto mit dieser E-Mail." };
  }

  redirect("/auth/bestaetigung");
}
