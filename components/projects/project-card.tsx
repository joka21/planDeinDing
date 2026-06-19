import Link from "next/link";
import { coverFile } from "@/lib/covers";
import type { ProjectCardData } from "@/lib/projects";
import { RatingSummary } from "./rating-summary";

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg border border-divider bg-bg transition hover:bg-surface">
      {/* Cover ist dekorativ -> alt="" */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverFile(project.cover_template)}
        alt=""
        width={400}
        height={225}
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-h4 font-bold text-text">
          {/* Stretched link: ganze Karte klickbar, zugänglicher Name = Titel */}
          <Link
            href={`/projekte/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-body text-text/80">{project.teaser}</p>
        <p className="mt-auto text-small text-text/70">
          von {project.authorName}
        </p>
        <RatingSummary avg={project.avgStars} count={project.ratingCount} />
      </div>
    </li>
  );
}
