"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/auth";

export type ProfileResult = { error: string } | { success: true } | undefined;

export async function updateProfileAction(
  values: unknown,
): Promise<ProfileResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte überprüfe deine Eingaben." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Der Dienst ist gerade nicht verfügbar." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Du bist nicht angemeldet." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.display_name })
    .eq("id", user.id);

  if (error) {
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath("/profil");
  return { success: true };
}
