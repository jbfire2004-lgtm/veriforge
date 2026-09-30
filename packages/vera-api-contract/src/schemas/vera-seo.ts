import { z } from "zod";

export const SeoContentTypeSchema = z.enum([
  "ARTICLE",
  "JOB",
  "PROFILE",
  "QA_QUESTION",
]);

export const SeoChangeFrequencySchema = z.enum([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

export const SeoSitemapEntrySchema = z.object({
  type: SeoContentTypeSchema,
  path: z.string(),
  lastModified: z.string().datetime(),
  changeFrequency: SeoChangeFrequencySchema,
  priority: z.number().min(0).max(1),
  title: z.string().optional(),
});

export const SeoSitemapIndexSchema = z.object({
  siteUrl: z.string().url(),
  generatedAt: z.string().datetime(),
  entries: z.array(SeoSitemapEntrySchema),
  counts: z.object({
    articles: z.number().int(),
    jobs: z.number().int(),
    profiles: z.number().int(),
    questions: z.number().int(),
    total: z.number().int(),
  }),
});

export const SeoOpenGraphSchema = z.object({
  type: z.string().optional(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  image: z.string().optional(),
  publishedTime: z.string().datetime().optional(),
});

export const SeoMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string(),
  openGraph: SeoOpenGraphSchema,
  twitter: z
    .object({
      card: z.enum(["summary", "summary_large_image"]).optional(),
      title: z.string(),
      description: z.string(),
      images: z.array(z.string()).optional(),
    })
    .optional(),
  robots: z
    .object({
      index: z.boolean().optional(),
      follow: z.boolean().optional(),
    })
    .optional(),
});

export const SeoJsonLdSchema = z.record(z.string(), z.unknown());

export const seoLookupSchema = z
  .object({
    type: SeoContentTypeSchema,
    slug: z.string().min(1).optional(),
    userId: z.number().int().positive().optional(),
    workerId: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ARTICLE" || data.type === "JOB" || data.type === "QA_QUESTION") {
      if (!data.slug) {
        ctx.addIssue({ code: "custom", message: "slug required for this type" });
      }
    }
    if (data.type === "PROFILE" && data.userId == null && data.workerId == null) {
      ctx.addIssue({ code: "custom", message: "userId or workerId required for PROFILE" });
    }
  });

export type SeoContentType = z.infer<typeof SeoContentTypeSchema>;
export type SeoSitemapEntry = z.infer<typeof SeoSitemapEntrySchema>;
export type SeoSitemapIndex = z.infer<typeof SeoSitemapIndexSchema>;
export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;
export type SeoJsonLd = z.infer<typeof SeoJsonLdSchema>;
