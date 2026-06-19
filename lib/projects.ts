import { createClient } from "@/lib/supabase/server";

export type ProjectStatus = "draft" | "pending" | "published" | "rejected";

export type ProjectCardData = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  cover_template: string;
  authorName: string;
  avgStars: number | null;
  ratingCount: number;
};

export type RatingItem = {
  id: string;
  display_name: string;
  stars: number;
  comment: string | null;
  created_at: string;
};

export type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string;
  cover_template: string;
  authorId: string;
  authorName: string;
  avgStars: number | null;
  ratingCount: number;
  ratings: RatingItem[];
};

/** URL-/SEO-tauglichen Basis-Slug aus einem Titel erzeugen. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "projekt";
}

/** Entfernt Zeichen, die die PostgREST-or()-Syntax stören könnten. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
}

function toAvg(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getPublishedProjects(opts: {
  q?: string;
  sort?: string;
}): Promise<ProjectCardData[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("projects")
    .select("id, slug, title, teaser, cover_template, author_id, published_at")
    .eq("status", "published");

  const q = opts.q ? sanitizeSearch(opts.q) : "";
  if (q) {
    query = query.or(`title.ilike.%${q}%,teaser.ilike.%${q}%`);
  }
  query = query.order("published_at", { ascending: false, nullsFirst: false });

  const { data: projects } = await query;
  if (!projects || projects.length === 0) return [];

  const authorIds = [...new Set(projects.map((p) => p.author_id))];
  const projectIds = projects.map((p) => p.id);

  const [{ data: profiles }, { data: stats }] = await Promise.all([
    supabase.from("public_profiles").select("id, display_name").in("id", authorIds),
    supabase
      .from("project_rating_stats")
      .select("project_id, avg_stars, rating_count")
      .in("project_id", projectIds),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const statById = new Map((stats ?? []).map((s) => [s.project_id, s]));

  const cards: ProjectCardData[] = projects.map((p) => {
    const stat = statById.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      teaser: p.teaser,
      cover_template: p.cover_template,
      authorName: nameById.get(p.author_id) ?? "Unbekannt",
      avgStars: toAvg(stat?.avg_stars),
      ratingCount: stat?.rating_count ?? 0,
    };
  });

  if (opts.sort === "beste") {
    cards.sort((a, b) => (b.avgStars ?? -1) - (a.avgStars ?? -1));
  }

  return cards;
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, title, teaser, description, cover_template, author_id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!project) return null;

  const [{ data: author }, { data: stat }, { data: ratings }] =
    await Promise.all([
      supabase
        .from("public_profiles")
        .select("display_name")
        .eq("id", project.author_id)
        .maybeSingle(),
      supabase
        .from("project_rating_stats")
        .select("avg_stars, rating_count")
        .eq("project_id", project.id)
        .maybeSingle(),
      supabase
        .from("public_ratings")
        .select("id, display_name, stars, comment, created_at")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
    ]);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    teaser: project.teaser,
    description: project.description,
    cover_template: project.cover_template,
    authorId: project.author_id,
    authorName: author?.display_name ?? "Unbekannt",
    avgStars: toAvg(stat?.avg_stars),
    ratingCount: stat?.rating_count ?? 0,
    ratings: (ratings ?? []) as RatingItem[],
  };
}

export type OwnProject = {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus;
};

export async function getOwnProjects(userId: string): Promise<OwnProject[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, status")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as OwnProject[];
}
