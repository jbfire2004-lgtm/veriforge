import { z } from "zod";
import { FeedEngagementSchema, FeedInteractionTypeSchema, FeedSubscriptionTargetTypeSchema, subscribeFeedInputSchema } from "./vera-feed-engine";
export declare const SocialActivityVerbSchema: z.ZodEnum<["LIKE", "UNLIKE", "COMMENT", "SHARE", "FOLLOW", "UNFOLLOW", "SUBSCRIBE"]>;
export declare const SocialActivityTargetTypeSchema: z.ZodEnum<["FEED_ITEM", "USER", "FEED_SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT"]>;
export declare const SocialFeedCommentSchema: z.ZodObject<{
    id: z.ZodString;
    feedItemId: z.ZodString;
    userId: z.ZodNumber;
    body: z.ZodString;
    createdAt: z.ZodString;
} & {
    authorName: z.ZodString;
    authorUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    replyCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    createdAt: string;
    userId: number;
    authorName: string;
    feedItemId: string;
    parentId?: string | null | undefined;
    authorUsername?: string | null | undefined;
    replyCount?: number | undefined;
}, {
    id: string;
    body: string;
    createdAt: string;
    userId: number;
    authorName: string;
    feedItemId: string;
    parentId?: string | null | undefined;
    authorUsername?: string | null | undefined;
    replyCount?: number | undefined;
}>;
export declare const SocialActivitySchema: z.ZodObject<{
    id: z.ZodString;
    actorUserId: z.ZodNumber;
    actorName: z.ZodString;
    verb: z.ZodEnum<["LIKE", "UNLIKE", "COMMENT", "SHARE", "FOLLOW", "UNFOLLOW", "SUBSCRIBE"]>;
    targetType: z.ZodEnum<["FEED_ITEM", "USER", "FEED_SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT"]>;
    targetId: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    feedItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    summary: string | null;
    targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
    actorUserId: number;
    actorName: string;
    verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
    targetId: string;
    url?: string | null | undefined;
    feedItemId?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    summary: string | null;
    targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
    actorUserId: number;
    actorName: string;
    verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
    targetId: string;
    url?: string | null | undefined;
    feedItemId?: string | null | undefined;
}>;
export declare const SocialActivityListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        actorUserId: z.ZodNumber;
        actorName: z.ZodString;
        verb: z.ZodEnum<["LIKE", "UNLIKE", "COMMENT", "SHARE", "FOLLOW", "UNFOLLOW", "SUBSCRIBE"]>;
        targetType: z.ZodEnum<["FEED_ITEM", "USER", "FEED_SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT"]>;
        targetId: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
        feedItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        summary: string | null;
        targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
        actorUserId: number;
        actorName: string;
        verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
        targetId: string;
        url?: string | null | undefined;
        feedItemId?: string | null | undefined;
    }, {
        id: string;
        createdAt: string;
        summary: string | null;
        targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
        actorUserId: number;
        actorName: string;
        verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
        targetId: string;
        url?: string | null | undefined;
        feedItemId?: string | null | undefined;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        createdAt: string;
        summary: string | null;
        targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
        actorUserId: number;
        actorName: string;
        verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
        targetId: string;
        url?: string | null | undefined;
        feedItemId?: string | null | undefined;
    }[];
    nextCursor: string | null;
}, {
    items: {
        id: string;
        createdAt: string;
        summary: string | null;
        targetType: "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER" | "FEED_ITEM" | "FEED_SOURCE";
        actorUserId: number;
        actorName: string;
        verb: "LIKE" | "COMMENT" | "SHARE" | "UNLIKE" | "FOLLOW" | "UNFOLLOW" | "SUBSCRIBE";
        targetId: string;
        url?: string | null | undefined;
        feedItemId?: string | null | undefined;
    }[];
    nextCursor: string | null;
}>;
export declare const SocialFollowStatusSchema: z.ZodObject<{
    following: z.ZodBoolean;
    followerCount: z.ZodNumber;
    followingCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    following: boolean;
    followerCount: number;
    followingCount: number;
}, {
    following: boolean;
    followerCount: number;
    followingCount: number;
}>;
export declare const SocialUserSummarySchema: z.ZodObject<{
    userId: z.ZodNumber;
    displayName: z.ZodString;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    headline: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    following: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: number;
    displayName: string;
    username?: string | null | undefined;
    headline?: string | null | undefined;
    following?: boolean | undefined;
}, {
    userId: number;
    displayName: string;
    username?: string | null | undefined;
    headline?: string | null | undefined;
    following?: boolean | undefined;
}>;
export declare const interactFeedSocialInputSchema: z.ZodObject<{
    feedItemId: z.ZodString;
    type: z.ZodEnum<["LIKE", "COMMENT", "SHARE"]>;
    body: z.ZodOptional<z.ZodString>;
} & {
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "LIKE" | "COMMENT" | "SHARE";
    feedItemId: string;
    body?: string | undefined;
    parentId?: string | undefined;
}, {
    type: "LIKE" | "COMMENT" | "SHARE";
    feedItemId: string;
    body?: string | undefined;
    parentId?: string | undefined;
}>;
export declare const followUserInputSchema: z.ZodObject<{
    userId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: number;
}, {
    userId: number;
}>;
export declare const socialActivityQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    scope: z.ZodOptional<z.ZodEnum<["me", "following", "all"]>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    cursor?: string | undefined;
    scope?: "following" | "me" | "all" | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
    scope?: "following" | "me" | "all" | undefined;
}>;
export { FeedEngagementSchema, FeedInteractionTypeSchema, FeedSubscriptionTargetTypeSchema, subscribeFeedInputSchema, };
export type SocialFeedComment = z.infer<typeof SocialFeedCommentSchema>;
export type SocialActivity = z.infer<typeof SocialActivitySchema>;
export type SocialActivityList = z.infer<typeof SocialActivityListSchema>;
export type SocialFollowStatus = z.infer<typeof SocialFollowStatusSchema>;
export type SocialUserSummary = z.infer<typeof SocialUserSummarySchema>;
