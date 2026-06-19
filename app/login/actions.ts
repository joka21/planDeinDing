"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export type LoginResult = { error: string } | undefined;

/** Erlaubt nur interne Pfade als Redirect-Ziel (kein Open Redirect). */
function safeRedirect(target: unknown): string {
  if (
    typeof target === "string" &&
    target.startsWith("/") &&
    !target.startsWith("//")
  ) {
    return target;
  }
  return "/profil";
}

export async function loginAction(
  values: unknown,
  redirectTo?: string,
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte überprüfe deine Eingaben." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Der Dienst ist gerade nicht verfügbar. Bitte später erneut versuchen." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Bewusst generisch (keine Auskunft, ob die E-Mail existiert).
    return { error: "E-Mail oder Passwort ist nicht korrekt – oder die E-Mail wurde noch nicht bestätigt." };
  }

  redirect(safeRedirect(redirectTo));
}
