import { z } from "zod";
import { FeedSourceSchema, FeedItemDtoSchema } from "./vera-hub-homepage";

export const FeedInteractionTypeSchema = z.enum(["LIKE", "COMMENT", "SHARE"]);

export const FeedSubscriptionTargetTypeSchema = z.enum([
  "SOURCE",
  "COMPANY",
  "PROJECT",
  "TRADE",
  "EXPERT",
  "USER",
]);

export const FeedEngagementSchema = z.object({
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  shareCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
});

export const FeedItemWithEngagementSchema = FeedItemDtoSchema.extend({
  engagement: FeedEngagementSchema,
  safetyPriority: z.number().int().optional(),
  trade: z.string().nullable().optional(),
  projectId: z.number().int().nullable().optional(),
});

export const FeedPageSchema = z.object({
  items: z.array(FeedItemWithEngagementSchema),
  nextCursor: z.string().nullable(),
});

export const FeedCommentSchema = z.object({
  id: z.string().uuid(),
  feedItemId: z.string().uuid(),
  userId: z.number().int(),
  body: z.string(),
  parentId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const FeedSubscriptionSchema = z.object({
  id: z.string().uuid(),
  targetType: FeedSubscriptionTargetTypeSchema,
  targetKey: z.string(),
  createdAt: z.string().datetime(),
});

export const FeedRealtimeEventSchema = z.object({
  type: z.enum(["feed.item.created", "feed.interaction"]),
  feedItemId: z.string().uuid().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const interactFeedInputSchema = z.object({
  feedItemId: z.string().uuid(),
  type: FeedInteractionTypeSchema,
  body: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional(),
});

export const subscribeFeedInputSchema = z.object({
  targetType: FeedSubscriptionTargetTypeSchema,
  targetKey: z.string().min(1).max(128),
});

export const feedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  sources: z.array(FeedSourceSchema).optional(),
  refresh: z.boolean().optional(),
});

export const veraCoreFeedSyncResponseSchema = z.object({
  synced: z.number().int(),
  counts: z.object({
    training: z.number().int(),
    achievements: z.number().int(),
    expiry: z.number().int(),
    projects: z.number().int(),
    equipment: z.number().int(),
    verification: z.number().int(),
  }),
});

export type FeedInteractionType = z.infer<typeof FeedInteractionTypeSchema>;
export type FeedItemWithEngagement = z.infer<typeof FeedItemWithEngagementSchema>;
export type FeedPage = z.infer<typeof FeedPageSchema>;
export type FeedComment = z.infer<typeof FeedCommentSchema>;
export type FeedSubscriptionDto = z.infer<typeof FeedSubscriptionSchema>;
export type FeedRealtimeEvent = z.infer<typeof FeedRealtimeEventSchema>;
