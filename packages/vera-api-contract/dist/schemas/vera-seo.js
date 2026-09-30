"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seoLookupSchema = exports.SeoJsonLdSchema = exports.SeoMetadataSchema = exports.SeoOpenGraphSchema = exports.SeoSitemapIndexSchema = exports.SeoSitemapEntrySchema = exports.SeoChangeFrequencySchema = exports.SeoContentTypeSchema = void 0;
const zod_1 = require("zod");
exports.SeoContentTypeSchema = zod_1.z.enum([
    "ARTICLE",
    "JOB",
    "PROFILE",
    "QA_QUESTION",
]);
exports.SeoChangeFrequencySchema = zod_1.z.enum([
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
]);
exports.SeoSitemapEntrySchema = zod_1.z.object({
    type: exports.SeoContentTypeSchema,
    path: zod_1.z.string(),
    lastModified: zod_1.z.string().datetime(),
    changeFrequency: exports.SeoChangeFrequencySchema,
    priority: zod_1.z.number().min(0).max(1),
    title: zod_1.z.string().optional(),
});
exports.SeoSitemapIndexSchema = zod_1.z.object({
    siteUrl: zod_1.z.string().url(),
    generatedAt: zod_1.z.string().datetime(),
    entries: zod_1.z.array(exports.SeoSitemapEntrySchema),
    counts: zod_1.z.object({
        articles: zod_1.z.number().int(),
        jobs: zod_1.z.number().int(),
        profiles: zod_1.z.number().int(),
        questions: zod_1.z.number().int(),
        total: zod_1.z.number().int(),
    }),
});
exports.SeoOpenGraphSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    url: zod_1.z.string(),
    image: zod_1.z.string().optional(),
    publishedTime: zod_1.z.string().datetime().optional(),
});
exports.SeoMetadataSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    canonical: zod_1.z.string(),
    openGraph: exports.SeoOpenGraphSchema,
    twitter: zod_1.z
        .object({
        card: zod_1.z.enum(["summary", "summary_large_image"]).optional(),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
    robots: zod_1.z
        .object({
        index: zod_1.z.boolean().optional(),
        follow: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.SeoJsonLdSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.unknown());
exports.seoLookupSchema = zod_1.z
    .object({
    type: exports.SeoContentTypeSchema,
    slug: zod_1.z.string().min(1).optional(),
    userId: zod_1.z.number().int().positive().optional(),
    workerId: zod_1.z.number().int().positive().optional(),
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
