import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ApproveButton,
  RejectForm,
  WithdrawButton,
} from "@/components/admin/project-moderation";

export const metadata: Metadata = { title: "Projekte · Admin" };

type Row = {
  id: string;
  slug: string;
  title: string;
  status: string;
  author_id: string;
  rejection_reason: string | null;
};

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  let rows: Row[] = [];
  const names = new Map<string, string>();

  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("id, slug, title, status, author_id, rejection_reason")
      .order("created_at", { ascending: false });
    rows = (data ?? []) as Row[];

    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    if (authorIds.length) {
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, display_name")
        .in("id", authorIds);
      (profiles ?? []).forEach((p) => names.set(p.id, p.display_name));
    }
  }

  const pending = rows.filter((r) => r.status === "pending");
  const published = rows.filter((r) => r.status === "published");
  const rejected = rows.filter((r) => r.status === "rejected");

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-h1 font-extrabold text-text">
          Projekte moderieren
        </h1>
        <Link
          href="/admin/projekte/neu"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 font-semibold text-bg hover:bg-text"
        >
          Neues Projekt
        </Link>
      </div>

      <section aria-labelledby="pending-heading" className="mt-10">
        <h2
          id="pending-heading"
          className="font-display text-h3 font-bold text-text"
        >
          Wartet auf Freigabe ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-body text-text/80">
            Keine offenen Projekte.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {pending.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-divider bg-bg p-4"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-medium text-text">{p.title}</span>
                  <span className="text-small text-text/70">
                    von {names.get(p.author_id) ?? "Unbekannt"}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <ApproveButton id={p.id} slug={p.slug} />
                  </span>
                </div>
                <div className="mt-2">
                  <RejectForm id={p.id} slug={p.slug} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="published-heading" className="mt-12">
        <h2
          id="published-heading"
          className="font-display text-h3 font-bold text-text"
        >
          Veröffentlicht ({published.length})
        </h2>
        {published.length === 0 ? (
          <p className="mt-3 text-body text-text/80">
            Noch nichts veröffentlicht.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {published.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-divider bg-bg p-4"
              >
                <span className="font-medium text-text">{p.title}</span>
                <span className="ml-auto flex items-center gap-3">
                  <Link
                    href={`/projekte/${p.slug}`}
                    className="text-small font-medium text-text underline"
                  >
                    Ansehen
                  </Link>
                  <WithdrawButton id={p.id} slug={p.slug} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rejected.length > 0 && (
        <section aria-labelledby="rejected-heading" className="mt-12">
          <h2
            id="rejected-heading"
            className="font-display text-h3 font-bold text-text"
          >
            Abgelehnt ({rejected.length})
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {rejected.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-divider bg-bg p-4"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-medium text-text">{p.title}</span>
                  <span className="ml-auto">
                    <ApproveButton id={p.id} slug={p.slug} />
                  </span>
                </div>
                {p.rejection_reason && (
                  <p className="mt-2 text-small text-text/80">
                    Grund: {p.rejection_reason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
