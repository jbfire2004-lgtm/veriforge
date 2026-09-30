"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFeedPageSchema = exports.SocialFeedEntrySchema = exports.PinnedPostCardSchema = exports.SponsoredAdCardSchema = exports.LegacyFeedCardSchema = exports.SocialPostCardSchema = exports.SocialMediaAttachmentSchema = exports.SocialPostEngagementSchema = void 0;
const zod_1 = require("zod");
exports.SocialPostEngagementSchema = zod_1.z.object({
    likeCount: zod_1.z.number().int(),
    commentCount: zod_1.z.number().int(),
    shareCount: zod_1.z.number().int(),
    likedByMe: zod_1.z.boolean().optional(),
    savedByMe: zod_1.z.boolean().optional(),
});
exports.SocialMediaAttachmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    fileType: zod_1.z.string(),
    url: zod_1.z.string(),
    mimeType: zod_1.z.string().nullable().optional(),
});
exports.SocialPostCardSchema = zod_1.z.object({
    kind: zod_1.z.literal("post"),
    id: zod_1.z.string().uuid(),
    postType: zod_1.z.string(),
    title: zod_1.z.string().nullable(),
    body: zod_1.z.string(),
    publishedAt: zod_1.z.string().datetime(),
    author: zod_1.z.object({ id: zod_1.z.number(), username: zod_1.z.string() }),
    media: zod_1.z.array(exports.SocialMediaAttachmentSchema),
    pinned: zod_1.z.boolean().optional(),
    engagement: exports.SocialPostEngagementSchema,
});
exports.LegacyFeedCardSchema = zod_1.z.object({
    kind: zod_1.z.literal("legacy"),
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    title: zod_1.z.string(),
    summary: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    url: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().datetime(),
});
exports.SponsoredAdCardSchema = zod_1.z.object({
    kind: zod_1.z.literal("ad"),
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    imageUrl: zod_1.z.string().nullable(),
    ctaUrl: zod_1.z.string().nullable(),
    ctaLabel: zod_1.z.string().nullable().optional(),
});
exports.PinnedPostCardSchema = zod_1.z.object({
    kind: zod_1.z.literal("pinned"),
    post: exports.SocialPostCardSchema,
});
exports.SocialFeedEntrySchema = zod_1.z.discriminatedUnion("kind", [
    exports.SocialPostCardSchema,
    exports.LegacyFeedCardSchema,
    exports.SponsoredAdCardSchema,
    exports.PinnedPostCardSchema,
]);
exports.SocialFeedPageSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SocialFeedEntrySchema),
    nextCursor: zod_1.z.string().nullable(),
});
