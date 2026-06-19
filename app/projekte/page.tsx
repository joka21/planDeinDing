import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/project-card";

export const metadata: Metadata = {
  title: "Projekte",
  description: "Entdecke und bewerte veröffentlichte Projekte.",
  alternates: { canonical: "/projekte" },
};

export default async function ProjektePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const projects = await getPublishedProjects({ q, sort });
  const count = projects.length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-h1 font-extrabold text-text">Projekte</h1>

      <p aria-live="polite" className="mt-2 text-body text-text/80">
        {count === 1 ? "1 Projekt" : `${count} Projekte`}
        {q ? ` für „${q}“` : ""} gefunden
      </p>

      {count === 0 ? (
        <div className="mt-10 rounded-lg border border-divider bg-surface p-6">
          <p className="text-body text-text">
            Keine Projekte gefunden{q ? ` für „${q}“` : ""}.
          </p>
          <p className="mt-2 text-body text-text/80">
            Schau später wieder vorbei oder{" "}
            <Link href="/einreichen" className="font-medium text-text underline">
              reiche selbst ein Projekt ein
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
