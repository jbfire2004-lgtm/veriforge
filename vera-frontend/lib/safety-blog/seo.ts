import type { Metadata } from "next";
import type { SafetyBlogPostDetail, SafetyBlogPostSummary } from "@vera/api-contract";
import { publicSiteUrl } from "@/lib/dev-ports";

export function siteUrl(): string {
  return publicSiteUrl();
}

export function postCanonicalUrl(post: {
  slug: string;
  canonicalUrl?: string | null;
}): string {
  return post.canonicalUrl ?? `${siteUrl()}/safety/${post.slug}`;
}

export function postMetadata(post: SafetyBlogPostDetail): Metadata {
  const url = postCanonicalUrl(post);
  const description =
    post.metaDescription ?? post.excerpt ?? post.title.slice(0, 160);
  return {
    title: `${post.title} | Vera Safety`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.publishedAt,
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

export function articleJsonLd(
  post: SafetyBlogPostDetail | SafetyBlogPostSummary,
) {
  const url = postCanonicalUrl(post);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription ?? post.excerpt ?? post.title,
    author: post.authorName
      ? {
          "@type": "Person",
          name: post.authorName,
        }
      : { "@type": "Organization", name: "VERA Safety" },
    datePublished: post.publishedAt,
    image: "imageUrl" in post && post.imageUrl ? post.imageUrl : undefined,
    url,
    timeRequired: `PT${post.readMinutes}M`,
    keywords: "tagSlugs" in post ? post.tagSlugs?.join(", ") : undefined,
  };
}
