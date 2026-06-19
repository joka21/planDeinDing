import type { Metadata } from "next";
import { ProjectForm } from "@/components/projects/project-form";
import { createAdminProjectAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Neues Projekt · Admin" };

export default function AdminNewProjectPage() {
  return (
    <>
      <h1 className="font-display text-h1 font-extrabold text-text">
        Neues Projekt
      </h1>
      <p className="mt-3 text-body text-text/80">
        Als Admin erstellte Projekte werden sofort veröffentlicht.
      </p>
      <ProjectForm
        action={createAdminProjectAction}
        submitLabel="Projekt veröffentlichen"
        submittingLabel="Wird veröffentlicht…"
      />
    </>
  );
}
