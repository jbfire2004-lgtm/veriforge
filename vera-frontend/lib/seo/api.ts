import type { Metadata } from "next";
import type { SeoMetadata as SeoMetadataDto, SeoSitemapIndex } from "@vera/api-contract";
import { API_URL } from "@/lib/api-fetch";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`SEO API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchSeoSitemapIndex(): Promise<SeoSitemapIndex> {
  return fetchJson<SeoSitemapIndex>("/api/v1/seo/sitemap");
}

export async function fetchSeoMetadata(query: {
  type: "ARTICLE" | "JOB" | "QA_QUESTION" | "PROFILE";
  slug?: string;
  userId?: number;
  workerId?: number;
}): Promise<SeoMetadataDto> {
  const qs = new URLSearchParams({ type: query.type });
  if (query.slug) qs.set("slug", query.slug);
  if (query.userId != null) qs.set("userId", String(query.userId));
  if (query.workerId != null) qs.set("workerId", String(query.workerId));
  return fetchJson<SeoMetadataDto>(`/api/v1/seo/metadata?${qs.toString()}`);
}

export async function fetchSeoSchema(query: {
  type: "ARTICLE" | "JOB" | "QA_QUESTION" | "PROFILE";
  slug?: string;
  userId?: number;
  workerId?: number;
}): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({ type: query.type });
  if (query.slug) qs.set("slug", query.slug);
  if (query.userId != null) qs.set("userId", String(query.userId));
  if (query.workerId != null) qs.set("workerId", String(query.workerId));
  return fetchJson<Record<string, unknown>>(`/api/v1/seo/schema?${qs.toString()}`);
}

export function nextMetadataFromSeo(dto: SeoMetadataDto): Metadata {
  return {
    title: dto.title,
    description: dto.description,
    alternates: { canonical: dto.canonical },
    openGraph: {
      type: dto.openGraph.type as "article" | "website" | undefined,
      title: dto.openGraph.title,
      description: dto.openGraph.description,
      url: dto.openGraph.url,
      images: dto.openGraph.image ? [{ url: dto.openGraph.image }] : undefined,
      publishedTime: dto.openGraph.publishedTime,
    },
    twitter: dto.twitter
      ? {
          card: dto.twitter.card,
          title: dto.twitter.title,
          description: dto.twitter.description,
          images: dto.twitter.images,
        }
      : undefined,
    robots: dto.robots,
  };
}
