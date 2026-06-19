"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validation/project";
import { slugify } from "@/lib/projects";

export type ProjectActionResult = { error: string } | undefined;

export async function createProjectAction(
  values: unknown,
): Promise<ProjectActionResult> {
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: "Bitte überprüfe deine Eingaben." };

  const supabase = await createClient();
  if (!supabase) return { error: "Der Dienst ist gerade nicht verfügbar." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du bist nicht angemeldet." };

  const base = slugify(parsed.data.title);
  let slug = base;

  // Eindeutigen Slug erzeugen: bei Unique-Konflikt (23505) Suffix erhöhen.
  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await supabase.from("projects").insert({
      author_id: user.id,
      title: parsed.data.title,
      teaser: parsed.data.teaser,
      description: parsed.data.description,
      cover_template: parsed.data.cover_template,
      slug,
      status: "pending",
    });

    if (!error) {
      revalidatePath("/profil");
      redirect("/profil?eingereicht=1");
    }
    if (error.code === "23505") {
      slug = `${base}-${attempt + 2}`;
      continue;
    }
    return { error: "Einreichen fehlgeschlagen. Bitte erneut versuchen." };
  }

  return {
    error: "Konnte keinen eindeutigen Link erzeugen. Bitte den Titel anpassen.",
  };
}

export async function updateProjectAction(
  projectId: string,
  values: unknown,
): Promise<ProjectActionResult> {
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: "Bitte überprüfe deine Eingaben." };

  const supabase = await createClient();
  if (!supabase) return { error: "Der Dienst ist gerade nicht verfügbar." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du bist nicht angemeldet." };

  // status & slug bleiben unverändert (DB-Trigger erzwingt das für Nicht-Admins).
  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      teaser: parsed.data.teaser,
      description: parsed.data.description,
      cover_template: parsed.data.cover_template,
    })
    .eq("id", projectId);

  if (error) return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };

  revalidatePath("/profil");
  revalidatePath("/projekte");
  redirect("/profil?gespeichert=1");
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/profil");
  revalidatePath("/projekte");
}
