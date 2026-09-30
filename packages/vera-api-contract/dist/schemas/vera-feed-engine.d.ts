import { z } from "zod";
export declare const FeedInteractionTypeSchema: z.ZodEnum<["LIKE", "COMMENT", "SHARE"]>;
export declare const FeedSubscriptionTargetTypeSchema: z.ZodEnum<["SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT", "USER"]>;
export declare const FeedEngagementSchema: z.ZodObject<{
    likeCount: z.ZodNumber;
    commentCount: z.ZodNumber;
    shareCount: z.ZodNumber;
    likedByMe: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedByMe: boolean;
}, {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedByMe: boolean;
}>;
export declare const FeedItemWithEngagementSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
    rankScore: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
} & {
    engagement: z.ZodObject<{
        likeCount: z.ZodNumber;
        commentCount: z.ZodNumber;
        shareCount: z.ZodNumber;
        likedByMe: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe: boolean;
    }, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe: boolean;
    }>;
    safetyPriority: z.ZodOptional<z.ZodNumber>;
    trade: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
    rankScore: number;
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe: boolean;
    };
    trade?: string | null | undefined;
    projectId?: number | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    safetyPriority?: number | undefined;
}, {
    id: string;
    source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
    rankScore: number;
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe: boolean;
    };
    trade?: string | null | undefined;
    projectId?: number | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    safetyPriority?: number | undefined;
}>;
export declare const FeedPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
        title: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
        imageUrl: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
        rankScore: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    } & {
        engagement: z.ZodObject<{
            likeCount: z.ZodNumber;
            commentCount: z.ZodNumber;
            shareCount: z.ZodNumber;
            likedByMe: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        }, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        }>;
        safetyPriority: z.ZodOptional<z.ZodNumber>;
        trade: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        };
        trade?: string | null | undefined;
        projectId?: number | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        safetyPriority?: number | undefined;
    }, {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        };
        trade?: string | null | undefined;
        projectId?: number | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        safetyPriority?: number | undefined;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        };
        trade?: string | null | undefined;
        projectId?: number | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        safetyPriority?: number | undefined;
    }[];
    nextCursor: string | null;
}, {
    items: {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe: boolean;
        };
        trade?: string | null | undefined;
        projectId?: number | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        safetyPriority?: number | undefined;
    }[];
    nextCursor: string | null;
}>;
export declare const FeedCommentSchema: z.ZodObject<{
    id: z.ZodString;
    feedItemId: z.ZodString;
    userId: z.ZodNumber;
    body: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    createdAt: string;
    userId: number;
    feedItemId: string;
    parentId?: string | null | undefined;
}, {
    id: string;
    body: string;
    createdAt: string;
    userId: number;
    feedItemId: string;
    parentId?: string | null | undefined;
}>;
export declare const FeedSubscriptionSchema: z.ZodObject<{
    id: z.ZodString;
    targetType: z.ZodEnum<["SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT", "USER"]>;
    targetKey: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    targetType: "SOURCE" | "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER";
    targetKey: string;
}, {
    id: string;
    createdAt: string;
    targetType: "SOURCE" | "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER";
    targetKey: string;
}>;
export declare const FeedRealtimeEventSchema: z.ZodObject<{
    type: z.ZodEnum<["feed.item.created", "feed.interaction"]>;
    feedItemId: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "feed.item.created" | "feed.interaction";
    payload?: Record<string, unknown> | undefined;
    feedItemId?: string | undefined;
}, {
    type: "feed.item.created" | "feed.interaction";
    payload?: Record<string, unknown> | undefined;
    feedItemId?: string | undefined;
}>;
export declare const interactFeedInputSchema: z.ZodObject<{
    feedItemId: z.ZodString;
    type: z.ZodEnum<["LIKE", "COMMENT", "SHARE"]>;
    body: z.ZodOptional<z.ZodString>;
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
export declare const subscribeFeedInputSchema: z.ZodObject<{
    targetType: z.ZodEnum<["SOURCE", "COMPANY", "PROJECT", "TRADE", "EXPERT", "USER"]>;
    targetKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetType: "SOURCE" | "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER";
    targetKey: string;
}, {
    targetType: "SOURCE" | "COMPANY" | "PROJECT" | "TRADE" | "EXPERT" | "USER";
    targetKey: string;
}>;
export declare const feedQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    sources: z.ZodOptional<z.ZodArray<z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>, "many">>;
    refresh: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    cursor?: string | undefined;
    sources?: ("VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM")[] | undefined;
    refresh?: boolean | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
    sources?: ("VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM")[] | undefined;
    refresh?: boolean | undefined;
}>;
export declare const veraCoreFeedSyncResponseSchema: z.ZodObject<{
    synced: z.ZodNumber;
    counts: z.ZodObject<{
        training: z.ZodNumber;
        achievements: z.ZodNumber;
        expiry: z.ZodNumber;
        projects: z.ZodNumber;
        equipment: z.ZodNumber;
        verification: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        equipment: number;
        projects: number;
        training: number;
        achievements: number;
        expiry: number;
        verification: number;
    }, {
        equipment: number;
        projects: number;
        training: number;
        achievements: number;
        expiry: number;
        verification: number;
    }>;
}, "strip", z.ZodTypeAny, {
    counts: {
        equipment: number;
        projects: number;
        training: number;
        achievements: number;
        expiry: number;
        verification: number;
    };
    synced: number;
}, {
    counts: {
        equipment: number;
        projects: number;
        training: number;
        achievements: number;
        expiry: number;
        verification: number;
    };
    synced: number;
}>;
export type FeedInteractionType = z.infer<typeof FeedInteractionTypeSchema>;
export type FeedItemWithEngagement = z.infer<typeof FeedItemWithEngagementSchema>;
export type FeedPage = z.infer<typeof FeedPageSchema>;
export type FeedComment = z.infer<typeof FeedCommentSchema>;
export type FeedSubscriptionDto = z.infer<typeof FeedSubscriptionSchema>;
export type FeedRealtimeEvent = z.infer<typeof FeedRealtimeEventSchema>;
