"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth";
import { projectSchema } from "@/lib/validation/project";
import { slugify } from "@/lib/projects";

async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

function revalidateProject(slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/projekte");
  revalidatePath("/projekte");
  if (slug) revalidatePath(`/projekte/${slug}`);
}

// --- Projekt-Moderation (Admin-Session, RLS erlaubt is_admin) ---------------

export async function publishProjectAction(id: string, slug: string) {
  if (!(await isAdmin())) return;
  const supabase = await createClient();
  if (!supabase) return;
  // published_at wird vom Trigger gesetzt.
  await supabase
    .from("projects")
    .update({ status: "published", rejection_reason: null })
    .eq("id", id);
  revalidateProject(slug);
}

export type RejectResult = { error: string } | undefined;

export async function rejectProjectAction(
  id: string,
  slug: string,
  reason: string,
): Promise<RejectResult> {
  if (!(await isAdmin())) return { error: "Nicht erlaubt." };
  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return { error: "Bitte gib einen kurzen Ablehnungsgrund an." };
  }
  const supabase = await createClient();
  if (!supabase) return { error: "Dienst nicht verfügbar." };
  await supabase
    .from("projects")
    .update({ status: "rejected", rejection_reason: trimmed.slice(0, 500) })
    .eq("id", id);
  revalidateProject(slug);
}

export async function withdrawProjectAction(id: string, slug: string) {
  if (!(await isAdmin())) return;
  const supabase = await createClient();
  if (!supabase) return;
  // Zurückziehen: zurück in die Prüf-Warteschlange, published_at zurücksetzen.
  await supabase
    .from("projects")
    .update({ status: "pending", published_at: null })
    .eq("id", id);
  revalidateProject(slug);
}

// --- Nutzer-Freigabe (can_rate) — nur Admin, via Service-Role ---------------

export async function setCanRateAction(userId: string, canRate: boolean) {
  if (!(await isAdmin())) return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("profiles").update({ can_rate: canRate }).eq("id", userId);
  revalidatePath("/admin/nutzer");
  revalidatePath("/admin");
}

// --- Kommentar-Moderation (Admin-Session, RLS erlaubt is_admin) -------------

export async function setCommentHiddenAction(
  ratingId: string,
  hidden: boolean,
  slug: string,
) {
  if (!(await isAdmin())) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase
    .from("ratings")
    .update({ comment_hidden: hidden })
    .eq("id", ratingId);
  if (slug) revalidatePath(`/projekte/${slug}`);
}

export async function deleteRatingAction(ratingId: string, slug: string) {
  if (!(await isAdmin())) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("ratings").delete().eq("id", ratingId);
  if (slug) revalidatePath(`/projekte/${slug}`);
}

// --- Admin erstellt Projekt direkt veröffentlicht ---------------------------

export type ProjectActionResult = { error: string } | undefined;

export async function createAdminProjectAction(
  values: unknown,
): Promise<ProjectActionResult> {
  if (!(await isAdmin())) return { error: "Nicht erlaubt." };

  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: "Bitte überprüfe deine Eingaben." };

  const supabase = await createClient();
  if (!supabase) return { error: "Dienst nicht verfügbar." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du bist nicht angemeldet." };

  const base = slugify(parsed.data.title);
  let slug = base;

  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await supabase.from("projects").insert({
      author_id: user.id,
      title: parsed.data.title,
      teaser: parsed.data.teaser,
      description: parsed.data.description,
      cover_template: parsed.data.cover_template,
      slug,
      status: "published",
    });

    if (!error) {
      revalidatePath("/projekte");
      revalidatePath("/admin/projekte");
      redirect(`/projekte/${slug}`);
    }
    if (error.code === "23505") {
      slug = `${base}-${attempt + 2}`;
      continue;
    }
    return { error: "Erstellen fehlgeschlagen. Bitte erneut versuchen." };
  }
  return { error: "Konnte keinen eindeutigen Link erzeugen." };
}
