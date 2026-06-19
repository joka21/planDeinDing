import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  let pendingCount = 0;
  let unratedCount = 0;

  if (supabase) {
    const { count: pc } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = pc ?? 0;

    const { count: uc } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("can_rate", false)
      .eq("role", "user");
    unratedCount = uc ?? 0;
  }

  return (
    <>
      <h1 className="font-display text-h1 font-extrabold text-text">
        Admin-Übersicht
      </h1>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-divider bg-surface p-6">
          <dt className="text-body text-text/80">Offene Projekte (in Prüfung)</dt>
          <dd className="mt-1 font-display text-h2 font-bold text-text">
            {pendingCount}
          </dd>
          <Link
            href="/admin/projekte"
            className="mt-2 inline-block font-medium text-text underline"
          >
            Projekte moderieren
          </Link>
        </div>

        <div className="rounded-lg border border-divider bg-surface p-6">
          <dt className="text-body text-text/80">Nutzer ohne Freigabe</dt>
          <dd className="mt-1 font-display text-h2 font-bold text-text">
            {unratedCount}
          </dd>
          <Link
            href="/admin/nutzer"
            className="mt-2 inline-block font-medium text-text underline"
          >
            Nutzer verwalten
          </Link>
        </div>
      </dl>

      <p className="mt-8">
        <Link
          href="/admin/projekte/neu"
          className="inline-block rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text"
        >
          Neues Projekt erstellen
        </Link>
      </p>
    </>
  );
}
