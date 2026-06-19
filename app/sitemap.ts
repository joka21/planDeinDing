import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/site";

// Stündlich neu generieren, damit neu veröffentlichte Projekte erscheinen.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/projekte`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/registrieren`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return staticRoutes;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const projectRoutes: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
    url: `${siteUrl}/projekte/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
