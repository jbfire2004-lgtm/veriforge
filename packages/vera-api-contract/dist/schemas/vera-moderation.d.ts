import { z } from "zod";
export declare const ModerationTargetTypeSchema: z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>;
export declare const SocialPostModerationFlagSchema: z.ZodObject<{
    id: z.ZodString;
    postId: z.ZodString;
    reason: z.ZodString;
    status: z.ZodString;
    createdAt: z.ZodString;
    reporter: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
    }, {
        id: number;
        username: string;
    }>;
    post: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        body: z.ZodString;
        postType: z.ZodString;
        publishedAt: z.ZodString;
        deletedAt: z.ZodNullable<z.ZodString>;
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
        deletedAt: string | null;
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
        deletedAt: string | null;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: string;
    createdAt: string;
    reason: string;
    post: {
        id: string;
        body: string;
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        deletedAt: string | null;
    } | null;
    postId: string;
    reporter: {
        id: number;
        username: string;
    };
}, {
    status: string;
    id: string;
    createdAt: string;
    reason: string;
    post: {
        id: string;
        body: string;
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        deletedAt: string | null;
    } | null;
    postId: string;
    reporter: {
        id: number;
        username: string;
    };
}>;
export declare const SocialPostModerationFlagListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        postId: z.ZodString;
        reason: z.ZodString;
        status: z.ZodString;
        createdAt: z.ZodString;
        reporter: z.ZodObject<{
            id: z.ZodNumber;
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            username: string;
        }, {
            id: number;
            username: string;
        }>;
        post: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodNullable<z.ZodString>;
            body: z.ZodString;
            postType: z.ZodString;
            publishedAt: z.ZodString;
            deletedAt: z.ZodNullable<z.ZodString>;
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
            deletedAt: string | null;
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
            deletedAt: string | null;
        }>>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        id: string;
        createdAt: string;
        reason: string;
        post: {
            id: string;
            body: string;
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            deletedAt: string | null;
        } | null;
        postId: string;
        reporter: {
            id: number;
            username: string;
        };
    }, {
        status: string;
        id: string;
        createdAt: string;
        reason: string;
        post: {
            id: string;
            body: string;
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            deletedAt: string | null;
        } | null;
        postId: string;
        reporter: {
            id: number;
            username: string;
        };
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    items: {
        status: string;
        id: string;
        createdAt: string;
        reason: string;
        post: {
            id: string;
            body: string;
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            deletedAt: string | null;
        } | null;
        postId: string;
        reporter: {
            id: number;
            username: string;
        };
    }[];
    total: number;
    page: number;
    pageSize: number;
}, {
    items: {
        status: string;
        id: string;
        createdAt: string;
        reason: string;
        post: {
            id: string;
            body: string;
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            deletedAt: string | null;
        } | null;
        postId: string;
        reporter: {
            id: number;
            username: string;
        };
    }[];
    total: number;
    page: number;
    pageSize: number;
}>;
export type SocialPostModerationFlag = z.infer<typeof SocialPostModerationFlagSchema>;
export declare const ModerationReportReasonSchema: z.ZodEnum<["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "IMPERSONATION", "SAFETY_RISK", "OTHER"]>;
export declare const ModerationCaseStatusSchema: z.ZodEnum<["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]>;
export declare const ModerationCaseSourceSchema: z.ZodEnum<["USER_REPORT", "AUTO_RULE"]>;
export declare const ModerationResolutionSchema: z.ZodEnum<["NO_ACTION", "CONTENT_HIDDEN", "USER_WARNED", "USER_SUSPENDED", "EXPERT_VERIFIED", "EXPERT_REJECTED"]>;
export declare const ModerationAutoRuleTypeSchema: z.ZodEnum<["KEYWORD_MATCH", "REPORT_THRESHOLD", "REPUTATION_FLOOR"]>;
export declare const ModerationAutoActionSchema: z.ZodEnum<["FLAG", "AUTO_HIDE"]>;
export declare const ExpertVerificationStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
export declare const reportPostSchema: z.ZodObject<{
    targetType: z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>;
    targetId: z.ZodString;
    reason: z.ZodEnum<["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "IMPERSONATION", "SAFETY_RISK", "OTHER"]>;
    details: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK";
    targetType: "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
    targetId: string;
    details?: string | undefined;
}, {
    reason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK";
    targetType: "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
    targetId: string;
    details?: string | undefined;
}>;
export declare const reportUserSchema: z.ZodObject<{
    userId: z.ZodNumber;
    reason: z.ZodEnum<["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "IMPERSONATION", "SAFETY_RISK", "OTHER"]>;
    details: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK";
    userId: number;
    details?: string | undefined;
}, {
    reason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK";
    userId: number;
    details?: string | undefined;
}>;
export declare const moderationQueueQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]>>;
    targetType: z.ZodOptional<z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | undefined;
    targetType?: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    status?: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | undefined;
    targetType?: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const resolveModerationCaseSchema: z.ZodObject<{
    caseId: z.ZodString;
    status: z.ZodEnum<["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]>;
    resolution: z.ZodOptional<z.ZodEnum<["NO_ACTION", "CONTENT_HIDDEN", "USER_WARNED", "USER_SUSPENDED", "EXPERT_VERIFIED", "EXPERT_REJECTED"]>>;
    resolutionNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
    caseId: string;
    resolution?: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | undefined;
    resolutionNote?: string | undefined;
}, {
    status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
    caseId: string;
    resolution?: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | undefined;
    resolutionNote?: string | undefined;
}>;
export declare const upsertAutoRuleSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    enabled: z.ZodOptional<z.ZodBoolean>;
    targetType: z.ZodOptional<z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>>;
    ruleType: z.ZodEnum<["KEYWORD_MATCH", "REPORT_THRESHOLD", "REPUTATION_FLOOR"]>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    priority: z.ZodOptional<z.ZodNumber>;
    action: z.ZodOptional<z.ZodEnum<["FLAG", "AUTO_HIDE"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    ruleType: "KEYWORD_MATCH" | "REPORT_THRESHOLD" | "REPUTATION_FLOOR";
    config: Record<string, unknown>;
    id?: string | undefined;
    action?: "FLAG" | "AUTO_HIDE" | undefined;
    priority?: number | undefined;
    targetType?: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | undefined;
    enabled?: boolean | undefined;
}, {
    name: string;
    ruleType: "KEYWORD_MATCH" | "REPORT_THRESHOLD" | "REPUTATION_FLOOR";
    config: Record<string, unknown>;
    id?: string | undefined;
    action?: "FLAG" | "AUTO_HIDE" | undefined;
    priority?: number | undefined;
    targetType?: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | undefined;
    enabled?: boolean | undefined;
}>;
export declare const applyExpertVerificationSchema: z.ZodObject<{
    statement: z.ZodString;
    tradeEvidence: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    statement: string;
    tradeEvidence?: string | undefined;
}, {
    statement: string;
    tradeEvidence?: string | undefined;
}>;
export declare const reviewExpertVerificationSchema: z.ZodObject<{
    requestId: z.ZodString;
    status: z.ZodEnum<["APPROVED", "REJECTED"]>;
    reviewNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED";
    requestId: string;
    reviewNote?: string | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    requestId: string;
    reviewNote?: string | undefined;
}>;
export declare const ModerationCaseSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodEnum<["USER_REPORT", "AUTO_RULE"]>;
    targetType: z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>;
    targetId: z.ZodString;
    reportReason: z.ZodNullable<z.ZodEnum<["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "IMPERSONATION", "SAFETY_RISK", "OTHER"]>>;
    reportDetails: z.ZodNullable<z.ZodString>;
    reporterUserId: z.ZodNullable<z.ZodNumber>;
    reporterName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    autoRuleName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodNumber;
    status: z.ZodEnum<["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]>;
    resolution: z.ZodNullable<z.ZodEnum<["NO_ACTION", "CONTENT_HIDDEN", "USER_WARNED", "USER_SUSPENDED", "EXPERT_VERIFIED", "EXPERT_REJECTED"]>>;
    resolutionNote: z.ZodNullable<z.ZodString>;
    targetSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
    id: string;
    createdAt: string;
    updatedAt: string;
    source: "USER_REPORT" | "AUTO_RULE";
    priority: number;
    targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
    targetId: string;
    resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
    resolutionNote: string | null;
    reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
    reportDetails: string | null;
    reporterUserId: number | null;
    reporterName?: string | null | undefined;
    autoRuleName?: string | null | undefined;
    targetSummary?: string | null | undefined;
}, {
    status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
    id: string;
    createdAt: string;
    updatedAt: string;
    source: "USER_REPORT" | "AUTO_RULE";
    priority: number;
    targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
    targetId: string;
    resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
    resolutionNote: string | null;
    reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
    reportDetails: string | null;
    reporterUserId: number | null;
    reporterName?: string | null | undefined;
    autoRuleName?: string | null | undefined;
    targetSummary?: string | null | undefined;
}>;
export declare const ModerationCaseListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodEnum<["USER_REPORT", "AUTO_RULE"]>;
        targetType: z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>;
        targetId: z.ZodString;
        reportReason: z.ZodNullable<z.ZodEnum<["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "IMPERSONATION", "SAFETY_RISK", "OTHER"]>>;
        reportDetails: z.ZodNullable<z.ZodString>;
        reporterUserId: z.ZodNullable<z.ZodNumber>;
        reporterName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        autoRuleName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodNumber;
        status: z.ZodEnum<["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]>;
        resolution: z.ZodNullable<z.ZodEnum<["NO_ACTION", "CONTENT_HIDDEN", "USER_WARNED", "USER_SUSPENDED", "EXPERT_VERIFIED", "EXPERT_REJECTED"]>>;
        resolutionNote: z.ZodNullable<z.ZodString>;
        targetSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
        id: string;
        createdAt: string;
        updatedAt: string;
        source: "USER_REPORT" | "AUTO_RULE";
        priority: number;
        targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
        targetId: string;
        resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
        resolutionNote: string | null;
        reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
        reportDetails: string | null;
        reporterUserId: number | null;
        reporterName?: string | null | undefined;
        autoRuleName?: string | null | undefined;
        targetSummary?: string | null | undefined;
    }, {
        status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
        id: string;
        createdAt: string;
        updatedAt: string;
        source: "USER_REPORT" | "AUTO_RULE";
        priority: number;
        targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
        targetId: string;
        resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
        resolutionNote: string | null;
        reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
        reportDetails: string | null;
        reporterUserId: number | null;
        reporterName?: string | null | undefined;
        autoRuleName?: string | null | undefined;
        targetSummary?: string | null | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
        id: string;
        createdAt: string;
        updatedAt: string;
        source: "USER_REPORT" | "AUTO_RULE";
        priority: number;
        targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
        targetId: string;
        resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
        resolutionNote: string | null;
        reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
        reportDetails: string | null;
        reporterUserId: number | null;
        reporterName?: string | null | undefined;
        autoRuleName?: string | null | undefined;
        targetSummary?: string | null | undefined;
    }[];
    total: number;
    page: number;
    pageSize: number;
}, {
    items: {
        status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
        id: string;
        createdAt: string;
        updatedAt: string;
        source: "USER_REPORT" | "AUTO_RULE";
        priority: number;
        targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST";
        targetId: string;
        resolution: "NO_ACTION" | "CONTENT_HIDDEN" | "USER_WARNED" | "USER_SUSPENDED" | "EXPERT_VERIFIED" | "EXPERT_REJECTED" | null;
        resolutionNote: string | null;
        reportReason: "OTHER" | "SPAM" | "HARASSMENT" | "MISINFORMATION" | "OFF_TOPIC" | "IMPERSONATION" | "SAFETY_RISK" | null;
        reportDetails: string | null;
        reporterUserId: number | null;
        reporterName?: string | null | undefined;
        autoRuleName?: string | null | undefined;
        targetSummary?: string | null | undefined;
    }[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare const ModerationAutoRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    enabled: z.ZodBoolean;
    targetType: z.ZodNullable<z.ZodEnum<["FEED_ITEM", "SOCIAL_POST", "USER", "EXPERT_QA_QUESTION", "EXPERT_QA_ANSWER", "SAFETY_ARTICLE", "SAFETY_COMMENT", "JOB_POST"]>>;
    ruleType: z.ZodEnum<["KEYWORD_MATCH", "REPORT_THRESHOLD", "REPUTATION_FLOOR"]>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    priority: z.ZodNumber;
    action: z.ZodEnum<["FLAG", "AUTO_HIDE"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    action: "FLAG" | "AUTO_HIDE";
    priority: number;
    targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | null;
    enabled: boolean;
    ruleType: "KEYWORD_MATCH" | "REPORT_THRESHOLD" | "REPUTATION_FLOOR";
    config: Record<string, unknown>;
}, {
    id: string;
    name: string;
    action: "FLAG" | "AUTO_HIDE";
    priority: number;
    targetType: "USER" | "FEED_ITEM" | "SOCIAL_POST" | "EXPERT_QA_QUESTION" | "EXPERT_QA_ANSWER" | "SAFETY_ARTICLE" | "SAFETY_COMMENT" | "JOB_POST" | null;
    enabled: boolean;
    ruleType: "KEYWORD_MATCH" | "REPORT_THRESHOLD" | "REPUTATION_FLOOR";
    config: Record<string, unknown>;
}>;
export declare const ExpertVerificationRequestSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodNumber;
    displayName: z.ZodString;
    headline: z.ZodNullable<z.ZodString>;
    trade: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
    statement: z.ZodNullable<z.ZodString>;
    tradeEvidence: z.ZodNullable<z.ZodString>;
    submittedAt: z.ZodString;
    reviewedAt: z.ZodNullable<z.ZodString>;
    reviewNote: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED";
    id: string;
    trade: string | null;
    userId: number;
    displayName: string;
    headline: string | null;
    statement: string | null;
    tradeEvidence: string | null;
    reviewNote: string | null;
    submittedAt: string;
    reviewedAt: string | null;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED";
    id: string;
    trade: string | null;
    userId: number;
    displayName: string;
    headline: string | null;
    statement: string | null;
    tradeEvidence: string | null;
    reviewNote: string | null;
    submittedAt: string;
    reviewedAt: string | null;
}>;
export type ModerationCase = z.infer<typeof ModerationCaseSchema>;
export type ModerationCaseList = z.infer<typeof ModerationCaseListSchema>;
export type ModerationAutoRule = z.infer<typeof ModerationAutoRuleSchema>;
export type ExpertVerificationRequest = z.infer<typeof ExpertVerificationRequestSchema>;
