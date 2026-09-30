import { z } from "zod";
export declare const ProviderStorefrontProfileSchema: z.ZodObject<{
    id: z.ZodString;
    trainingProviderId: z.ZodNumber;
    displayName: z.ZodString;
    bio: z.ZodNullable<z.ZodString>;
    logoUrl: z.ZodNullable<z.ZodString>;
    bannerUrl: z.ZodNullable<z.ZodString>;
    websiteUrl: z.ZodNullable<z.ZodString>;
    links: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    postCount: z.ZodNumber;
    provider: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        website: z.ZodNullable<z.ZodString>;
        logoUrl: z.ZodNullable<z.ZodString>;
        phone: z.ZodNullable<z.ZodString>;
        email: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        logoUrl: string | null;
    }, {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        logoUrl: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    provider: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        logoUrl: string | null;
    };
    trainingProviderId: number;
    displayName: string;
    bio: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    websiteUrl: string | null;
    postCount: number;
    links?: Record<string, string> | null | undefined;
}, {
    id: string;
    provider: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        logoUrl: string | null;
    };
    trainingProviderId: number;
    displayName: string;
    bio: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    websiteUrl: string | null;
    postCount: number;
    links?: Record<string, string> | null | undefined;
}>;
export declare const ProviderStorefrontPostSchema: z.ZodObject<{
    id: z.ZodString;
    postType: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    body: z.ZodString;
    publishedAt: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
    }, {
        id: number;
        username: string;
    }>;
    engagement: z.ZodObject<{
        likeCount: z.ZodNumber;
        commentCount: z.ZodNumber;
        shareCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
    }, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
    };
}, {
    id: string;
    body: string;
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
    };
}>;
export type ProviderStorefrontProfile = z.infer<typeof ProviderStorefrontProfileSchema>;
export type ProviderStorefrontPost = z.infer<typeof ProviderStorefrontPostSchema>;
