import { z } from "zod";
import {
  FeedCommentSchema,
  FeedEngagementSchema,
  FeedInteractionTypeSchema,
  FeedSubscriptionTargetTypeSchema,
  interactFeedInputSchema,
  subscribeFeedInputSchema,
} from "./vera-feed-engine";

export const SocialActivityVerbSchema = z.enum([
  "LIKE",
  "UNLIKE",
  "COMMENT",
  "SHARE",
  "FOLLOW",
  "UNFOLLOW",
  "SUBSCRIBE",
]);

export const SocialActivityTargetTypeSchema = z.enum([
  "FEED_ITEM",
  "USER",
  "FEED_SOURCE",
  "COMPANY",
  "PROJECT",
  "TRADE",
  "EXPERT",
]);

export const SocialFeedCommentSchema = FeedCommentSchema.extend({
  authorName: z.string(),
  authorUsername: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  replyCount: z.number().int().nonnegative().optional(),
});

export const SocialActivitySchema = z.object({
  id: z.string().uuid(),
  actorUserId: z.number().int(),
  actorName: z.string(),
  verb: SocialActivityVerbSchema,
  targetType: SocialActivityTargetTypeSchema,
  targetId: z.string(),
  summary: z.string().nullable(),
  feedItemId: z.string().uuid().nullable().optional(),
  url: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const SocialActivityListSchema = z.object({
  items: z.array(SocialActivitySchema),
  nextCursor: z.string().uuid().nullable(),
});

export const SocialFollowStatusSchema = z.object({
  following: z.boolean(),
  followerCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
});

export const SocialUserSummarySchema = z.object({
  userId: z.number().int(),
  displayName: z.string(),
  username: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  following: z.boolean().optional(),
});

export const interactFeedSocialInputSchema = interactFeedInputSchema.extend({
  parentId: z.string().uuid().optional(),
});

export const followUserInputSchema = z.object({
  userId: z.number().int(),
});

export const socialActivityQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  scope: z.enum(["me", "following", "all"]).optional(),
});

export {
  FeedEngagementSchema,
  FeedInteractionTypeSchema,
  FeedSubscriptionTargetTypeSchema,
  subscribeFeedInputSchema,
};

export type SocialFeedComment = z.infer<typeof SocialFeedCommentSchema>;
export type SocialActivity = z.infer<typeof SocialActivitySchema>;
export type SocialActivityList = z.infer<typeof SocialActivityListSchema>;
export type SocialFollowStatus = z.infer<typeof SocialFollowStatusSchema>;
export type SocialUserSummary = z.infer<typeof SocialUserSummarySchema>;
