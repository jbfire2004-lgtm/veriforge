"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.veraCoreFeedSyncResponseSchema = exports.feedQuerySchema = exports.subscribeFeedInputSchema = exports.interactFeedInputSchema = exports.FeedRealtimeEventSchema = exports.FeedSubscriptionSchema = exports.FeedCommentSchema = exports.FeedPageSchema = exports.FeedItemWithEngagementSchema = exports.FeedEngagementSchema = exports.FeedSubscriptionTargetTypeSchema = exports.FeedInteractionTypeSchema = void 0;
const zod_1 = require("zod");
const vera_hub_homepage_1 = require("./vera-hub-homepage");
exports.FeedInteractionTypeSchema = zod_1.z.enum(["LIKE", "COMMENT", "SHARE"]);
exports.FeedSubscriptionTargetTypeSchema = zod_1.z.enum([
    "SOURCE",
    "COMPANY",
    "PROJECT",
    "TRADE",
    "EXPERT",
    "USER",
]);
exports.FeedEngagementSchema = zod_1.z.object({
    likeCount: zod_1.z.number().int().nonnegative(),
    commentCount: zod_1.z.number().int().nonnegative(),
    shareCount: zod_1.z.number().int().nonnegative(),
    likedByMe: zod_1.z.boolean(),
});
exports.FeedItemWithEngagementSchema = vera_hub_homepage_1.FeedItemDtoSchema.extend({
    engagement: exports.FeedEngagementSchema,
    safetyPriority: zod_1.z.number().int().optional(),
    trade: zod_1.z.string().nullable().optional(),
    projectId: zod_1.z.number().int().nullable().optional(),
});
exports.FeedPageSchema = zod_1.z.object({
    items: zod_1.z.array(exports.FeedItemWithEngagementSchema),
    nextCursor: zod_1.z.string().nullable(),
});
exports.FeedCommentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    feedItemId: zod_1.z.string().uuid(),
    userId: zod_1.z.number().int(),
    body: zod_1.z.string(),
    parentId: zod_1.z.string().uuid().nullable().optional(),
    createdAt: zod_1.z.string().datetime(),
});
exports.FeedSubscriptionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    targetType: exports.FeedSubscriptionTargetTypeSchema,
    targetKey: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
});
exports.FeedRealtimeEventSchema = zod_1.z.object({
    type: zod_1.z.enum(["feed.item.created", "feed.interaction"]),
    feedItemId: zod_1.z.string().uuid().optional(),
    payload: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.interactFeedInputSchema = zod_1.z.object({
    feedItemId: zod_1.z.string().uuid(),
    type: exports.FeedInteractionTypeSchema,
    body: zod_1.z.string().max(2000).optional(),
    parentId: zod_1.z.string().uuid().optional(),
});
exports.subscribeFeedInputSchema = zod_1.z.object({
    targetType: exports.FeedSubscriptionTargetTypeSchema,
    targetKey: zod_1.z.string().min(1).max(128),
});
exports.feedQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.number().int().min(1).max(50).optional(),
    sources: zod_1.z.array(vera_hub_homepage_1.FeedSourceSchema).optional(),
    refresh: zod_1.z.boolean().optional(),
});
exports.veraCoreFeedSyncResponseSchema = zod_1.z.object({
    synced: zod_1.z.number().int(),
    counts: zod_1.z.object({
        training: zod_1.z.number().int(),
        achievements: zod_1.z.number().int(),
        expiry: zod_1.z.number().int(),
        projects: zod_1.z.number().int(),
        equipment: zod_1.z.number().int(),
        verification: zod_1.z.number().int(),
    }),
});
