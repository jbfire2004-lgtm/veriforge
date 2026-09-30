import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/safety-blog/api";
import { fetchExpertQaSitemap } from "@/lib/expert-qa/api";
import { fetchJobBoardSitemap } from "@/lib/job-board/api";
import { siteUrl } from "@/lib/safety-blog/seo";
import { buildHubSitemap } from "@/lib/seo/sitemap";

/** Legacy merge when SEO engine API is unavailable (e.g. offline dev). */
async function legacySitemap(base: string): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/safety`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/safety/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/experts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/experts/ask`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  let articles: { slug: string; updatedAt: string }[] = [];
  let questions: { slug: string; updatedAt: string }[] = [];
  let jobs: { slug: string; updatedAt: string }[] = [];
  try {
    articles = await fetchSitemapEntries();
  } catch {
    articles = [];
  }
  try {
    questions = await fetchExpertQaSitemap();
  } catch {
    questions = [];
  }
  try {
    jobs = await fetchJobBoardSitemap();
  } catch {
    jobs = [];
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/safety/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const questionRoutes: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${base}/experts/questions/${q.slug}`,
    lastModified: new Date(q.updatedAt),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${base}/jobs/${j.slug}`,
    lastModified: new Date(j.updatedAt),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...articleRoutes, ...questionRoutes, ...jobRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const fromEngine = await buildHubSitemap(base);
  if (fromEngine.length > 0) return fromEngine;
  return legacySitemap(base);
}
