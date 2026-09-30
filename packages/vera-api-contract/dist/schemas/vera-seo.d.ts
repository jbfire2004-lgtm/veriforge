import { z } from "zod";
export declare const SeoContentTypeSchema: z.ZodEnum<["ARTICLE", "JOB", "PROFILE", "QA_QUESTION"]>;
export declare const SeoChangeFrequencySchema: z.ZodEnum<["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]>;
export declare const SeoSitemapEntrySchema: z.ZodObject<{
    type: z.ZodEnum<["ARTICLE", "JOB", "PROFILE", "QA_QUESTION"]>;
    path: z.ZodString;
    lastModified: z.ZodString;
    changeFrequency: z.ZodEnum<["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]>;
    priority: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    priority: number;
    lastModified: string;
    changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
    title?: string | undefined;
}, {
    path: string;
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    priority: number;
    lastModified: string;
    changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
    title?: string | undefined;
}>;
export declare const SeoSitemapIndexSchema: z.ZodObject<{
    siteUrl: z.ZodString;
    generatedAt: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ARTICLE", "JOB", "PROFILE", "QA_QUESTION"]>;
        path: z.ZodString;
        lastModified: z.ZodString;
        changeFrequency: z.ZodEnum<["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]>;
        priority: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
        priority: number;
        lastModified: string;
        changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
        title?: string | undefined;
    }, {
        path: string;
        type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
        priority: number;
        lastModified: string;
        changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
        title?: string | undefined;
    }>, "many">;
    counts: z.ZodObject<{
        articles: z.ZodNumber;
        jobs: z.ZodNumber;
        profiles: z.ZodNumber;
        questions: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        jobs: number;
        articles: number;
        profiles: number;
        questions: number;
    }, {
        total: number;
        jobs: number;
        articles: number;
        profiles: number;
        questions: number;
    }>;
}, "strip", z.ZodTypeAny, {
    entries: {
        path: string;
        type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
        priority: number;
        lastModified: string;
        changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
        title?: string | undefined;
    }[];
    generatedAt: string;
    counts: {
        total: number;
        jobs: number;
        articles: number;
        profiles: number;
        questions: number;
    };
    siteUrl: string;
}, {
    entries: {
        path: string;
        type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
        priority: number;
        lastModified: string;
        changeFrequency: "never" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
        title?: string | undefined;
    }[];
    generatedAt: string;
    counts: {
        total: number;
        jobs: number;
        articles: number;
        profiles: number;
        questions: number;
    };
    siteUrl: string;
}>;
export declare const SeoOpenGraphSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodString;
    url: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    publishedTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    url: string;
    type?: string | undefined;
    image?: string | undefined;
    publishedTime?: string | undefined;
}, {
    description: string;
    title: string;
    url: string;
    type?: string | undefined;
    image?: string | undefined;
    publishedTime?: string | undefined;
}>;
export declare const SeoMetadataSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    canonical: z.ZodString;
    openGraph: z.ZodObject<{
        type: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodString;
        url: z.ZodString;
        image: z.ZodOptional<z.ZodString>;
        publishedTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        title: string;
        url: string;
        type?: string | undefined;
        image?: string | undefined;
        publishedTime?: string | undefined;
    }, {
        description: string;
        title: string;
        url: string;
        type?: string | undefined;
        image?: string | undefined;
        publishedTime?: string | undefined;
    }>;
    twitter: z.ZodOptional<z.ZodObject<{
        card: z.ZodOptional<z.ZodEnum<["summary", "summary_large_image"]>>;
        title: z.ZodString;
        description: z.ZodString;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        title: string;
        card?: "summary" | "summary_large_image" | undefined;
        images?: string[] | undefined;
    }, {
        description: string;
        title: string;
        card?: "summary" | "summary_large_image" | undefined;
        images?: string[] | undefined;
    }>>;
    robots: z.ZodOptional<z.ZodObject<{
        index: z.ZodOptional<z.ZodBoolean>;
        follow: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        index?: boolean | undefined;
        follow?: boolean | undefined;
    }, {
        index?: boolean | undefined;
        follow?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    canonical: string;
    openGraph: {
        description: string;
        title: string;
        url: string;
        type?: string | undefined;
        image?: string | undefined;
        publishedTime?: string | undefined;
    };
    twitter?: {
        description: string;
        title: string;
        card?: "summary" | "summary_large_image" | undefined;
        images?: string[] | undefined;
    } | undefined;
    robots?: {
        index?: boolean | undefined;
        follow?: boolean | undefined;
    } | undefined;
}, {
    description: string;
    title: string;
    canonical: string;
    openGraph: {
        description: string;
        title: string;
        url: string;
        type?: string | undefined;
        image?: string | undefined;
        publishedTime?: string | undefined;
    };
    twitter?: {
        description: string;
        title: string;
        card?: "summary" | "summary_large_image" | undefined;
        images?: string[] | undefined;
    } | undefined;
    robots?: {
        index?: boolean | undefined;
        follow?: boolean | undefined;
    } | undefined;
}>;
export declare const SeoJsonLdSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const seoLookupSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["ARTICLE", "JOB", "PROFILE", "QA_QUESTION"]>;
    slug: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodNumber>;
    workerId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    workerId?: number | undefined;
    userId?: number | undefined;
    slug?: string | undefined;
}, {
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    workerId?: number | undefined;
    userId?: number | undefined;
    slug?: string | undefined;
}>, {
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    workerId?: number | undefined;
    userId?: number | undefined;
    slug?: string | undefined;
}, {
    type: "ARTICLE" | "JOB" | "PROFILE" | "QA_QUESTION";
    workerId?: number | undefined;
    userId?: number | undefined;
    slug?: string | undefined;
}>;
export type SeoContentType = z.infer<typeof SeoContentTypeSchema>;
export type SeoSitemapEntry = z.infer<typeof SeoSitemapEntrySchema>;
export type SeoSitemapIndex = z.infer<typeof SeoSitemapIndexSchema>;
export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;
export type SeoJsonLd = z.infer<typeof SeoJsonLdSchema>;
