"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertVerificationRequestSchema = exports.ModerationAutoRuleSchema = exports.ModerationCaseListSchema = exports.ModerationCaseSchema = exports.reviewExpertVerificationSchema = exports.applyExpertVerificationSchema = exports.upsertAutoRuleSchema = exports.resolveModerationCaseSchema = exports.moderationQueueQuerySchema = exports.reportUserSchema = exports.reportPostSchema = exports.ExpertVerificationStatusSchema = exports.ModerationAutoActionSchema = exports.ModerationAutoRuleTypeSchema = exports.ModerationResolutionSchema = exports.ModerationCaseSourceSchema = exports.ModerationCaseStatusSchema = exports.ModerationReportReasonSchema = exports.SocialPostModerationFlagListSchema = exports.SocialPostModerationFlagSchema = exports.ModerationTargetTypeSchema = void 0;
const zod_1 = require("zod");
exports.ModerationTargetTypeSchema = zod_1.z.enum([
    "FEED_ITEM",
    "SOCIAL_POST",
    "USER",
    "EXPERT_QA_QUESTION",
    "EXPERT_QA_ANSWER",
    "SAFETY_ARTICLE",
    "SAFETY_COMMENT",
    "JOB_POST",
]);
exports.SocialPostModerationFlagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    postId: zod_1.z.string().uuid(),
    reason: zod_1.z.string(),
    status: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    reporter: zod_1.z.object({ id: zod_1.z.number(), username: zod_1.z.string() }),
    post: zod_1.z
        .object({
        id: zod_1.z.string().uuid(),
        title: zod_1.z.string().nullable(),
        body: zod_1.z.string(),
        postType: zod_1.z.string(),
        publishedAt: zod_1.z.string().datetime(),
        deletedAt: zod_1.z.string().datetime().nullable(),
        author: zod_1.z.object({ id: zod_1.z.number(), username: zod_1.z.string() }),
    })
        .nullable(),
});
exports.SocialPostModerationFlagListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SocialPostModerationFlagSchema),
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    pageSize: zod_1.z.number().int(),
});
exports.ModerationReportReasonSchema = zod_1.z.enum([
    "SPAM",
    "HARASSMENT",
    "MISINFORMATION",
    "OFF_TOPIC",
    "IMPERSONATION",
    "SAFETY_RISK",
    "OTHER",
]);
exports.ModerationCaseStatusSchema = zod_1.z.enum([
    "OPEN",
    "IN_REVIEW",
    "RESOLVED",
    "DISMISSED",
]);
exports.ModerationCaseSourceSchema = zod_1.z.enum(["USER_REPORT", "AUTO_RULE"]);
exports.ModerationResolutionSchema = zod_1.z.enum([
    "NO_ACTION",
    "CONTENT_HIDDEN",
    "USER_WARNED",
    "USER_SUSPENDED",
    "EXPERT_VERIFIED",
    "EXPERT_REJECTED",
]);
exports.ModerationAutoRuleTypeSchema = zod_1.z.enum([
    "KEYWORD_MATCH",
    "REPORT_THRESHOLD",
    "REPUTATION_FLOOR",
]);
exports.ModerationAutoActionSchema = zod_1.z.enum(["FLAG", "AUTO_HIDE"]);
exports.ExpertVerificationStatusSchema = zod_1.z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
]);
exports.reportPostSchema = zod_1.z.object({
    targetType: exports.ModerationTargetTypeSchema.exclude(["USER"]),
    targetId: zod_1.z.string().min(1),
    reason: exports.ModerationReportReasonSchema,
    details: zod_1.z.string().max(2000).optional(),
});
exports.reportUserSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
    reason: exports.ModerationReportReasonSchema,
    details: zod_1.z.string().max(2000).optional(),
});
exports.moderationQueueQuerySchema = zod_1.z.object({
    status: exports.ModerationCaseStatusSchema.optional(),
    targetType: exports.ModerationTargetTypeSchema.optional(),
    page: zod_1.z.number().int().min(1).optional(),
    pageSize: zod_1.z.number().int().min(1).max(100).optional(),
});
exports.resolveModerationCaseSchema = zod_1.z.object({
    caseId: zod_1.z.string().uuid(),
    status: exports.ModerationCaseStatusSchema,
    resolution: exports.ModerationResolutionSchema.optional(),
    resolutionNote: zod_1.z.string().max(2000).optional(),
});
exports.upsertAutoRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(2).max(120),
    enabled: zod_1.z.boolean().optional(),
    targetType: exports.ModerationTargetTypeSchema.optional(),
    ruleType: exports.ModerationAutoRuleTypeSchema,
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    priority: zod_1.z.number().int().optional(),
    action: exports.ModerationAutoActionSchema.optional(),
});
exports.applyExpertVerificationSchema = zod_1.z.object({
    statement: zod_1.z.string().min(20).max(5000),
    tradeEvidence: zod_1.z.string().max(2000).optional(),
});
exports.reviewExpertVerificationSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(["APPROVED", "REJECTED"]),
    reviewNote: zod_1.z.string().max(2000).optional(),
});
exports.ModerationCaseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    source: exports.ModerationCaseSourceSchema,
    targetType: exports.ModerationTargetTypeSchema,
    targetId: zod_1.z.string(),
    reportReason: exports.ModerationReportReasonSchema.nullable(),
    reportDetails: zod_1.z.string().nullable(),
    reporterUserId: zod_1.z.number().int().nullable(),
    reporterName: zod_1.z.string().nullable().optional(),
    autoRuleName: zod_1.z.string().nullable().optional(),
    priority: zod_1.z.number().int(),
    status: exports.ModerationCaseStatusSchema,
    resolution: exports.ModerationResolutionSchema.nullable(),
    resolutionNote: zod_1.z.string().nullable(),
    targetSummary: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.ModerationCaseListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.ModerationCaseSchema),
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    pageSize: zod_1.z.number().int(),
});
exports.ModerationAutoRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    enabled: zod_1.z.boolean(),
    targetType: exports.ModerationTargetTypeSchema.nullable(),
    ruleType: exports.ModerationAutoRuleTypeSchema,
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    priority: zod_1.z.number().int(),
    action: exports.ModerationAutoActionSchema,
});
exports.ExpertVerificationRequestSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.number().int(),
    displayName: zod_1.z.string(),
    headline: zod_1.z.string().nullable(),
    trade: zod_1.z.string().nullable(),
    status: exports.ExpertVerificationStatusSchema,
    statement: zod_1.z.string().nullable(),
    tradeEvidence: zod_1.z.string().nullable(),
    submittedAt: zod_1.z.string().datetime(),
    reviewedAt: zod_1.z.string().datetime().nullable(),
    reviewNote: zod_1.z.string().nullable(),
});
