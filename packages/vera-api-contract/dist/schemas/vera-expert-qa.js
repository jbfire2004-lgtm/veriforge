"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateExpertQaSchema = exports.endorseExpertSchema = exports.expertQaListQuerySchema = exports.acceptExpertQaAnswerSchema = exports.voteExpertQaAnswerSchema = exports.createExpertQaAnswerSchema = exports.createExpertQaQuestionSchema = exports.ExpertQaQuestionListSchema = exports.ExpertQaQuestionDetailSchema = exports.ExpertQaQuestionSummarySchema = exports.ExpertQaAnswerSchema = exports.ExpertQaAttachmentSchema = exports.ExpertProfileSchema = exports.ExpertQaAttachmentTypeSchema = exports.ExpertQaModerationStatusSchema = exports.ExpertQaQuestionStatusSchema = exports.ExpertBadgeLevelSchema = void 0;
const zod_1 = require("zod");
exports.ExpertBadgeLevelSchema = zod_1.z.enum([
    "CONTRIBUTOR",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
]);
exports.ExpertQaQuestionStatusSchema = zod_1.z.enum([
    "OPEN",
    "CLOSED",
    "ARCHIVED",
    "HIDDEN",
]);
exports.ExpertQaModerationStatusSchema = zod_1.z.enum([
    "VISIBLE",
    "PENDING",
    "HIDDEN",
]);
exports.ExpertQaAttachmentTypeSchema = zod_1.z.enum(["IMAGE", "PDF", "OTHER"]);
exports.ExpertProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.number().int(),
    displayName: zod_1.z.string(),
    headline: zod_1.z.string().nullable(),
    bio: zod_1.z.string().nullable(),
    trade: zod_1.z.string().nullable(),
    verified: zod_1.z.boolean(),
    reputationScore: zod_1.z.number().int(),
    badgeLevel: exports.ExpertBadgeLevelSchema,
    answerCount: zod_1.z.number().int(),
    acceptedCount: zod_1.z.number().int(),
});
exports.ExpertQaAttachmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    fileName: zod_1.z.string(),
    fileUrl: zod_1.z.string(),
    mimeType: zod_1.z.string(),
    type: exports.ExpertQaAttachmentTypeSchema,
});
exports.ExpertQaAnswerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    questionId: zod_1.z.string().uuid(),
    body: zod_1.z.string(),
    voteScore: zod_1.z.number().int(),
    isExpertAnswer: zod_1.z.boolean(),
    isAccepted: zod_1.z.boolean(),
    author: zod_1.z.object({
        userId: zod_1.z.number().int(),
        displayName: zod_1.z.string(),
        badgeLevel: exports.ExpertBadgeLevelSchema.optional(),
        verified: zod_1.z.boolean().optional(),
    }),
    createdAt: zod_1.z.string().datetime(),
});
exports.ExpertQaQuestionSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    excerpt: zod_1.z.string(),
    trade: zod_1.z.string().nullable(),
    anonymous: zod_1.z.boolean(),
    status: exports.ExpertQaQuestionStatusSchema,
    voteScore: zod_1.z.number().int(),
    answerCount: zod_1.z.number().int(),
    viewCount: zod_1.z.number().int(),
    hasAcceptedAnswer: zod_1.z.boolean(),
    tagSlugs: zod_1.z.array(zod_1.z.string()),
    createdAt: zod_1.z.string().datetime(),
});
exports.ExpertQaQuestionDetailSchema = exports.ExpertQaQuestionSummarySchema.extend({
    body: zod_1.z.string(),
    companyId: zod_1.z.number().int().nullable(),
    projectId: zod_1.z.number().int().nullable(),
    author: zod_1.z
        .object({
        userId: zod_1.z.number().int(),
        displayName: zod_1.z.string(),
    })
        .nullable(),
    attachments: zod_1.z.array(exports.ExpertQaAttachmentSchema),
    answers: zod_1.z.array(exports.ExpertQaAnswerSchema),
    acceptedAnswerId: zod_1.z.string().uuid().nullable(),
});
exports.ExpertQaQuestionListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.ExpertQaQuestionSummarySchema),
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    pageSize: zod_1.z.number().int(),
});
exports.createExpertQaQuestionSchema = zod_1.z.object({
    title: zod_1.z.string().min(10).max(200),
    body: zod_1.z.string().min(20).max(10000),
    trade: zod_1.z.string().max(80).optional(),
    companyId: zod_1.z.number().int().optional(),
    projectId: zod_1.z.number().int().optional(),
    anonymous: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string().min(1).max(40)).max(8).optional(),
    attachments: zod_1.z
        .array(zod_1.z.object({
        fileName: zod_1.z.string(),
        fileUrl: zod_1.z.string().url(),
        mimeType: zod_1.z.string(),
        type: exports.ExpertQaAttachmentTypeSchema.optional(),
        sizeBytes: zod_1.z.number().int().optional(),
    }))
        .max(5)
        .optional(),
});
exports.createExpertQaAnswerSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid(),
    body: zod_1.z.string().min(10).max(10000),
});
exports.voteExpertQaAnswerSchema = zod_1.z.object({
    answerId: zod_1.z.string().uuid(),
    value: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(-1)]),
    voterKey: zod_1.z.string().optional(),
});
exports.acceptExpertQaAnswerSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid(),
    answerId: zod_1.z.string().uuid(),
});
exports.expertQaListQuerySchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).optional(),
    pageSize: zod_1.z.number().int().min(1).max(50).optional(),
    trade: zod_1.z.string().optional(),
    tag: zod_1.z.string().optional(),
    q: zod_1.z.string().optional(),
    sort: zod_1.z.enum(["newest", "votes", "unanswered"]).optional(),
});
exports.endorseExpertSchema = zod_1.z.object({
    expertProfileId: zod_1.z.string().uuid(),
    skill: zod_1.z.string().min(2).max(80),
    message: zod_1.z.string().max(500).optional(),
});
exports.moderateExpertQaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    moderationStatus: exports.ExpertQaModerationStatusSchema,
});
