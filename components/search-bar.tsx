"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Such-/Filterleiste im Sticky Header. Native GET-Form (funktioniert ohne JS);
 * mit JS Client-Navigation, damit die aria-live-Ergebnisanzeige auf /projekte
 * angesagt wird. Sortierung als native select (Auto-Submit bei Änderung).
 */
export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "neueste";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const nq = (fd.get("q") as string)?.trim();
    const ns = fd.get("sort") as string;
    if (nq) params.set("q", nq);
    if (ns && ns !== "neueste") params.set("sort", ns);
    const qs = params.toString();
    router.push(qs ? `/projekte?${qs}` : "/projekte");
  }

  return (
    <form
      action="/projekte"
      method="get"
      role="search"
      onSubmit={onSubmit}
      className="flex w-full items-center gap-2"
    >
      <label htmlFor="project-search" className="sr-only">
        Projekte durchsuchen
      </label>
      <input
        id="project-search"
        name="q"
        type="search"
        defaultValue={q}
        key={`q-${q}`}
        placeholder="Projekte suchen"
        className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-body text-text"
      />
      <label htmlFor="project-sort" className="sr-only">
        Sortierung
      </label>
      <select
        id="project-sort"
        name="sort"
        defaultValue={sort}
        key={`s-${sort}`}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-border bg-bg px-2 py-2 text-body text-text"
      >
        <option value="neueste">Neueste</option>
        <option value="beste">Beste Bewertung</option>
      </select>
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-accent px-3 py-2 font-semibold text-bg"
      >
        Suchen
      </button>
    </form>
  );
}
