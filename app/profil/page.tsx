import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getOwnProjects, type ProjectStatus } from "@/lib/projects";
import { signOutAction } from "@/app/auth/actions";
import { ProfileForm } from "./profile-form";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Entwurf",
  pending: "In Prüfung",
  published: "Veröffentlicht",
  rejected: "Abgelehnt",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ eingereicht?: string; gespeichert?: string }>;
}) {
  const profile = await requireProfile();
  const { eingereicht, gespeichert } = await searchParams;
  const projects = await getOwnProjects(profile.id);

  const notice = eingereicht
    ? "Dein Projekt wurde eingereicht und wartet auf die Freigabe durch einen Admin."
    : gespeichert
      ? "Änderungen gespeichert."
      : null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 font-extrabold text-text">Profil</h1>

      {notice && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-border bg-surface px-4 py-3 text-body text-text"
        >
          {notice}
        </p>
      )}

      <h2 className="mt-10 font-display text-h4 font-bold text-text">
        Anzeigename
      </h2>
      <ProfileForm displayName={profile.display_name} />

      <h2 className="mt-12 font-display text-h4 font-bold text-text">Bewerten</h2>
      <p className="mt-3 text-body text-text/80">
        {profile.can_rate
          ? "Du bist freigeschaltet und kannst veröffentlichte Projekte bewerten."
          : "Du bist noch nicht zum Bewerten freigeschaltet. Ein Admin schaltet dich frei."}
      </p>

      <div className="mt-12 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-h4 font-bold text-text">
          Meine Projekte
        </h2>
        <Link
          href="/einreichen"
          className="shrink-0 font-medium text-text underline"
        >
          Neues Projekt
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-3 text-body text-text/80">
          Du hast noch keine Projekte eingereicht.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-divider bg-bg p-4"
            >
              <span className="font-medium text-text">{p.title}</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-small text-text">
                {STATUS_LABEL[p.status]}
              </span>
              <span className="ml-auto flex items-center gap-3">
                {p.status === "published" && (
                  <Link
                    href={`/projekte/${p.slug}`}
                    className="text-small font-medium text-text underline"
                  >
                    Ansehen
                  </Link>
                )}
                <Link
                  href={`/projekte/${p.slug}/bearbeiten`}
                  className="text-small font-medium text-text underline"
                >
                  Bearbeiten
                </Link>
                <DeleteProjectButton projectId={p.id} title={p.title} />
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 font-display text-h4 font-bold text-text">Konto</h2>
      <form action={signOutAction} className="mt-3">
        <button
          type="submit"
          className="rounded-lg border border-border px-4 py-2.5 font-semibold text-text hover:bg-surface"
        >
          Abmelden
        </button>
      </form>
    </section>
  );
}
