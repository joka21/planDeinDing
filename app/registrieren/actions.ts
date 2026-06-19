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
    console.error(
      "[registerAction] Supabase-Env fehlt (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). .env.local prüfen und Dev-Server neu starten.",
    );
    return {
      error:
        "Konfiguration unvollständig: Der Supabase-Zugang ist nicht gesetzt. Bitte .env.local prüfen und den Server neu starten.",
    };
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
    // Echten Fehler serverseitig loggen und dem Nutzer sichtbar machen.
    console.error("[registerAction] signUp error:", error.message);
    return { error: `Registrierung fehlgeschlagen: ${error.message}` };
  }

  redirect("/auth/bestaetigung");
}
