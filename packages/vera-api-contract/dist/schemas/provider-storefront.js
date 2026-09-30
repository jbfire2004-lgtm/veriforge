"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderStorefrontPostSchema = exports.ProviderStorefrontProfileSchema = void 0;
const zod_1 = require("zod");
exports.ProviderStorefrontProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    trainingProviderId: zod_1.z.number(),
    displayName: zod_1.z.string(),
    bio: zod_1.z.string().nullable(),
    logoUrl: zod_1.z.string().nullable(),
    bannerUrl: zod_1.z.string().nullable(),
    websiteUrl: zod_1.z.string().nullable(),
    links: zod_1.z.record(zod_1.z.string()).nullable().optional(),
    postCount: zod_1.z.number().int(),
    provider: zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        website: zod_1.z.string().nullable(),
        logoUrl: zod_1.z.string().nullable(),
        phone: zod_1.z.string().nullable(),
        email: zod_1.z.string().nullable(),
    }),
});
exports.ProviderStorefrontPostSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    postType: zod_1.z.string(),
    title: zod_1.z.string().nullable(),
    body: zod_1.z.string(),
    publishedAt: zod_1.z.string().datetime(),
    author: zod_1.z.object({ id: zod_1.z.number(), username: zod_1.z.string() }),
    engagement: zod_1.z.object({
        likeCount: zod_1.z.number().int(),
        commentCount: zod_1.z.number().int(),
        shareCount: zod_1.z.number().int(),
    }),
});
