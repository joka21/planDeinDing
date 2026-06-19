"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ratingSchema } from "@/lib/validation/rating";

export type RateResult = { error: string } | { success: true };

/**
 * Legt eine Bewertung an oder aktualisiert die bestehende (eine pro
 * Nutzer/Projekt). Die eigentliche Sicherheit liegt in der RLS:
 * Insert-Policy verlangt can_rate, Nicht-Autor und published-Projekt;
 * der Trigger schützt comment_hidden. Der Client wird nicht vertraut.
 */
export async function rateAction(
  projectId: string,
  slug: string,
  values: unknown,
): Promise<RateResult> {
  const parsed = ratingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte überprüfe deine Eingabe." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Der Dienst ist gerade nicht verfügbar." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du bist nicht angemeldet." };

  const { error } = await supabase.from("ratings").upsert(
    {
      project_id: projectId,
      user_id: user.id,
      stars: parsed.data.stars,
      comment: parsed.data.comment ? parsed.data.comment : null,
    },
    { onConflict: "project_id,user_id" },
  );

  if (error) {
    return {
      error:
        "Bewertung konnte nicht gespeichert werden. Möglicherweise bist du nicht freigeschaltet oder es ist dein eigenes Projekt.",
    };
  }

  revalidatePath(`/projekte/${slug}`);
  return { success: true };
}
