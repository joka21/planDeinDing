import Link from "next/link";
import { getPublishedProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/project-card";

export default async function Home() {
  const latest = (await getPublishedProjects({})).slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-display text-body font-medium text-text-accent">
          Plan dein Ding
        </p>
        <h1 className="mt-4 font-display text-h1 font-extrabold tracking-tight text-text lg:text-h1">
          Sei ein Spinner
        </h1>
        <p className="mt-6 max-w-2xl text-body text-text/80">
          Große Ideen brauchen einen Anfang. Hier planst du dein Ding – vom
          ersten verrückten Gedanken bis zum fertigen Projekt. Spinn ruhig
          ein bisschen: die besten Vorhaben fangen genau so an.
        </p>
      </section>

      <section
        aria-labelledby="latest-projects"
        className="mx-auto max-w-6xl px-6 pb-20"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="latest-projects"
            className="font-display text-h2 font-bold text-text"
          >
            Neueste Projekte
          </h2>
          <Link
            href="/projekte"
            className="shrink-0 font-medium text-text underline"
          >
            Alle Projekte
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="mt-6 text-body text-text/80">
            Noch keine veröffentlichten Projekte – sei der erste Spinner.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
