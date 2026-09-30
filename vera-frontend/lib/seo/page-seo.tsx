import type { Metadata } from "next";
import type { SeoJsonLd } from "@vera/api-contract";
import { fetchSeoMetadata, fetchSeoSchema, nextMetadataFromSeo } from "./api";
import { siteUrl } from "@/lib/safety-blog/seo";

export async function loadPageSeo(input: {
  type: "ARTICLE" | "JOB" | "QA_QUESTION" | "PROFILE";
  slug?: string;
  userId?: number;
  workerId?: number;
}): Promise<{ metadata: Metadata; jsonLd: SeoJsonLd }> {
  const [metaDto, jsonLd] = await Promise.all([
    fetchSeoMetadata(input),
    fetchSeoSchema(input),
  ]);
  return {
    metadata: nextMetadataFromSeo(metaDto),
    jsonLd,
  };
}

export function jsonLdScriptTag(jsonLd: SeoJsonLd) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function canonicalSiteUrl(): string {
  return siteUrl();
}
