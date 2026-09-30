import type { MetadataRoute } from "next";
import type { SeoSitemapEntry } from "@vera/api-contract";
import { fetchSeoSitemapIndex } from "./api";

const CF_MAP: Record<SeoSitemapEntry["changeFrequency"], MetadataRoute.Sitemap[0]["changeFrequency"]> =
  {
    always: "always",
    hourly: "hourly",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    yearly: "yearly",
    never: "never",
  };

export function seoEntriesToNextSitemap(
  siteUrl: string,
  entries: SeoSitemapEntry[],
): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  return entries.map((e) => ({
    url: `${base}${e.path.startsWith("/") ? e.path : `/${e.path}`}`,
    lastModified: new Date(e.lastModified),
    changeFrequency: CF_MAP[e.changeFrequency],
    priority: e.priority,
  }));
}

export async function buildHubSitemap(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const index = await fetchSeoSitemapIndex();
    return seoEntriesToNextSitemap(siteUrl, index.entries);
  } catch {
    return [];
  }
}
