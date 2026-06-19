import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { ProjectForm } from "@/components/projects/project-form";
import { createProjectAction } from "./actions";

export const metadata: Metadata = { title: "Projekt einreichen" };

export default async function EinreichenPage() {
  await requireProfile();

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-h1 font-extrabold text-text">
        Projekt einreichen
      </h1>
      <p className="mt-3 text-body text-text/80">
        Nach dem Einreichen prüft ein Admin dein Projekt, bevor es
        veröffentlicht wird.
      </p>
      <ProjectForm
        action={createProjectAction}
        submitLabel="Projekt einreichen"
      />
    </section>
  );
}
