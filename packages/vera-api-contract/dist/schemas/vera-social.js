"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeFeedInputSchema = exports.FeedSubscriptionTargetTypeSchema = exports.FeedInteractionTypeSchema = exports.FeedEngagementSchema = exports.socialActivityQuerySchema = exports.followUserInputSchema = exports.interactFeedSocialInputSchema = exports.SocialUserSummarySchema = exports.SocialFollowStatusSchema = exports.SocialActivityListSchema = exports.SocialActivitySchema = exports.SocialFeedCommentSchema = exports.SocialActivityTargetTypeSchema = exports.SocialActivityVerbSchema = void 0;
const zod_1 = require("zod");
const vera_feed_engine_1 = require("./vera-feed-engine");
Object.defineProperty(exports, "FeedEngagementSchema", { enumerable: true, get: function () { return vera_feed_engine_1.FeedEngagementSchema; } });
Object.defineProperty(exports, "FeedInteractionTypeSchema", { enumerable: true, get: function () { return vera_feed_engine_1.FeedInteractionTypeSchema; } });
Object.defineProperty(exports, "FeedSubscriptionTargetTypeSchema", { enumerable: true, get: function () { return vera_feed_engine_1.FeedSubscriptionTargetTypeSchema; } });
Object.defineProperty(exports, "subscribeFeedInputSchema", { enumerable: true, get: function () { return vera_feed_engine_1.subscribeFeedInputSchema; } });
exports.SocialActivityVerbSchema = zod_1.z.enum([
    "LIKE",
    "UNLIKE",
    "COMMENT",
    "SHARE",
    "FOLLOW",
    "UNFOLLOW",
    "SUBSCRIBE",
]);
exports.SocialActivityTargetTypeSchema = zod_1.z.enum([
    "FEED_ITEM",
    "USER",
    "FEED_SOURCE",
    "COMPANY",
    "PROJECT",
    "TRADE",
    "EXPERT",
]);
exports.SocialFeedCommentSchema = vera_feed_engine_1.FeedCommentSchema.extend({
    authorName: zod_1.z.string(),
    authorUsername: zod_1.z.string().nullable().optional(),
    parentId: zod_1.z.string().uuid().nullable().optional(),
    replyCount: zod_1.z.number().int().nonnegative().optional(),
});
exports.SocialActivitySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    actorUserId: zod_1.z.number().int(),
    actorName: zod_1.z.string(),
    verb: exports.SocialActivityVerbSchema,
    targetType: exports.SocialActivityTargetTypeSchema,
    targetId: zod_1.z.string(),
    summary: zod_1.z.string().nullable(),
    feedItemId: zod_1.z.string().uuid().nullable().optional(),
    url: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().datetime(),
});
exports.SocialActivityListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SocialActivitySchema),
    nextCursor: zod_1.z.string().uuid().nullable(),
});
exports.SocialFollowStatusSchema = zod_1.z.object({
    following: zod_1.z.boolean(),
    followerCount: zod_1.z.number().int().nonnegative(),
    followingCount: zod_1.z.number().int().nonnegative(),
});
exports.SocialUserSummarySchema = zod_1.z.object({
    userId: zod_1.z.number().int(),
    displayName: zod_1.z.string(),
    username: zod_1.z.string().nullable().optional(),
    headline: zod_1.z.string().nullable().optional(),
    following: zod_1.z.boolean().optional(),
});
exports.interactFeedSocialInputSchema = vera_feed_engine_1.interactFeedInputSchema.extend({
    parentId: zod_1.z.string().uuid().optional(),
});
exports.followUserInputSchema = zod_1.z.object({
    userId: zod_1.z.number().int(),
});
exports.socialActivityQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.number().int().min(1).max(50).optional(),
    scope: zod_1.z.enum(["me", "following", "all"]).optional(),
});
