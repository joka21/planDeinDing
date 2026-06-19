import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { coverFile } from "@/lib/covers";
import { getPublishedProjectBySlug } from "@/lib/projects";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RatingSummary } from "@/components/projects/rating-summary";
import { RatingForm } from "@/components/projects/rating-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: "Projekt nicht gefunden" };
  return { title: project.title, description: project.teaser };
}

function Stars({ stars }: { stars: number }) {
  return (
    <span>
      <span aria-hidden="true">
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </span>
      <span className="sr-only">{stars} von 5 Sternen</span>
    </span>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const profile = await getProfile();
  const isAuthor = profile?.id === project.authorId;
  const canRate = !!profile && !isAuthor && profile.can_rate;

  let ownRating: { stars: number; comment: string | null } | null = null;
  if (profile) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from("ratings")
        .select("stars, comment")
        .eq("project_id", project.id)
        .eq("user_id", profile.id)
        .maybeSingle();
      ownRating = data ?? null;
    }
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Cover-Hero mit Titel im soliden Markenband (Dunkelblau/Weiß, AAA) */}
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverFile(project.cover_template)}
          alt=""
          width={800}
          height={450}
          className="aspect-video w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-surface-dark px-6 py-4">
          <h1 className="font-display text-h2 font-extrabold text-bg lg:text-h1">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-text/80">
        <p className="text-body">von {project.authorName}</p>
        <span aria-hidden="true">·</span>
        <RatingSummary avg={project.avgStars} count={project.ratingCount} />
      </div>

      <p className="mt-6 max-w-[70ch] text-body font-medium text-text">
        {project.teaser}
      </p>

      <h2 className="mt-12 font-display text-h3 font-bold text-text">
        Über das Projekt
      </h2>
      <p className="mt-3 max-w-[70ch] whitespace-pre-line text-body leading-relaxed text-text/90">
        {project.description}
      </p>

      <section aria-labelledby="ratings-heading" className="mt-14">
        <h2
          id="ratings-heading"
          className="font-display text-h3 font-bold text-text"
        >
          Bewertungen
        </h2>
        <RatingSummary
          avg={project.avgStars}
          count={project.ratingCount}
          className="mt-2"
        />

        {canRate ? (
          <RatingForm
            projectId={project.id}
            slug={project.slug}
            initial={ownRating}
          />
        ) : (
          <p className="mt-6 rounded-lg border border-divider bg-surface px-4 py-3 text-body text-text">
            {!profile ? (
              <>
                Zum Bewerten bitte{" "}
                <Link
                  href={`/login?redirect=/projekte/${project.slug}`}
                  className="font-medium underline"
                >
                  anmelden
                </Link>
                .
              </>
            ) : isAuthor ? (
              "Dein eigenes Projekt kannst du nicht bewerten."
            ) : (
              "Zum Bewerten musst du von einem Admin freigeschaltet sein."
            )}
          </p>
        )}

        <h3 className="mt-10 font-display text-h4 font-bold text-text">
          Alle Bewertungen
        </h3>
        {project.ratings.length === 0 ? (
          <p className="mt-4 text-body text-text/80">
            Dieses Projekt wurde noch nicht bewertet.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-5">
            {project.ratings.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-divider bg-surface p-4"
              >
                <p className="flex flex-wrap items-center gap-x-2 text-text">
                  <span className="font-medium">{r.display_name}</span>
                  <Stars stars={r.stars} />
                </p>
                {r.comment && (
                  <p className="mt-2 max-w-[70ch] text-body text-text/90">
                    {r.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
