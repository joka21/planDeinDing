import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/projects/project-form";
import { updateProjectAction } from "@/app/einreichen/actions";
import type { CoverValue } from "@/lib/covers";

export const metadata: Metadata = {
  title: "Projekt bearbeiten",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireProfile();

  const supabase = await createClient();
  if (!supabase) notFound();

  // RLS lässt Autor (alle Status) und Admin lesen; Fremde erhalten null.
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, teaser, description, cover_template, author_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) notFound();
  if (project.author_id !== profile.id && profile.role !== "admin") notFound();

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-h1 font-extrabold text-text">
        Projekt bearbeiten
      </h1>
      <p className="mt-3 text-body text-text/80">
        Ein bereits veröffentlichtes Projekt bleibt nach dem Bearbeiten
        veröffentlicht.
      </p>
      <ProjectForm
        action={updateProjectAction.bind(null, project.id)}
        submitLabel="Änderungen speichern"
        submittingLabel="Wird gespeichert…"
        initial={{
          title: project.title,
          teaser: project.teaser,
          description: project.description,
          cover_template: project.cover_template as CoverValue,
        }}
      />
    </section>
  );
}
