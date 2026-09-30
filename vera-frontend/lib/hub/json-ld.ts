import type { JobPostDto, SafetyArticleDto } from "@vera/api-contract";

export function jobPostingJsonLd(job: JobPostDto, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary ?? job.title,
    datePosted: job.publishedAt,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
    },
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: job.location },
        }
      : undefined,
    url: job.url ?? `${siteUrl}/jobs`,
    baseSalary: job.payRange
      ? { "@type": "MonetaryAmount", currency: "CAD", value: job.payRange }
      : undefined,
  };
}

export function articleJsonLd(article: SafetyArticleDto, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? article.title,
    author: article.authorName
      ? { "@type": "Person", name: article.authorName }
      : undefined,
    datePublished: article.publishedAt,
    image: article.imageUrl ?? undefined,
    url: `${siteUrl}/safety/${article.slug}`,
    timeRequired: `PT${article.readMinutes}M`,
  };
}
