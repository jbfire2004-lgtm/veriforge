import type { Metadata } from "next";
import type { JobBoardJobDetail } from "@vera/api-contract";
import { publicSiteUrl } from "@/lib/dev-ports";

export function siteUrl(): string {
  return publicSiteUrl();
}

export function jobMetadata(job: JobBoardJobDetail): Metadata {
  const base = siteUrl();
  const title = `${job.title} · ${job.companyName}`;
  const description =
    job.summary ??
    `${job.trade ?? "Trade"} role in ${job.location ?? "Canada"}. ${job.payRange ?? ""}`.trim();
  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description,
      url: `${base}/jobs/${job.slug}`,
      type: "website",
    },
  };
}

export function jobPostingJsonLd(job: JobBoardJobDetail, baseUrl: string) {
  const locality =
    job.locationCity && job.locationRegion
      ? `${job.locationCity}, ${job.locationRegion}`
      : job.location;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? job.summary ?? job.title,
    datePosted: job.publishedAt,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
    },
    jobLocation: locality
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.locationCity ?? locality,
            addressRegion: job.locationRegion ?? undefined,
            addressCountry: "CA",
          },
        }
      : undefined,
    employmentType: "CONTRACTOR",
    occupationalCategory: job.trade ?? undefined,
    qualifications: job.ticketNames?.length
      ? job.ticketNames.join(", ")
      : undefined,
    experienceRequirements: job.experienceLevel ?? undefined,
    url: `${baseUrl}/jobs/${job.slug}`,
    baseSalary:
      job.payMin != null
        ? {
            "@type": "MonetaryAmount",
            currency: "CAD",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.payMin,
              maxValue: job.payMax ?? job.payMin,
              unitText: job.payPeriod === "annual" ? "YEAR" : "HOUR",
            },
          }
        : job.payRange
          ? { "@type": "MonetaryAmount", currency: "CAD", value: job.payRange }
          : undefined,
  };
}
