import { z } from "zod";

export const ExpertBadgeLevelSchema = z.enum([
  "CONTRIBUTOR",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
]);

export const ExpertQaQuestionStatusSchema = z.enum([
  "OPEN",
  "CLOSED",
  "ARCHIVED",
  "HIDDEN",
]);

export const ExpertQaModerationStatusSchema = z.enum([
  "VISIBLE",
  "PENDING",
  "HIDDEN",
]);

export const ExpertQaAttachmentTypeSchema = z.enum(["IMAGE", "PDF", "OTHER"]);

export const ExpertProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int(),
  displayName: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  trade: z.string().nullable(),
  verified: z.boolean(),
  reputationScore: z.number().int(),
  badgeLevel: ExpertBadgeLevelSchema,
  answerCount: z.number().int(),
  acceptedCount: z.number().int(),
});

export const ExpertQaAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileUrl: z.string(),
  mimeType: z.string(),
  type: ExpertQaAttachmentTypeSchema,
});

export const ExpertQaAnswerSchema = z.object({
  id: z.string().uuid(),
  questionId: z.string().uuid(),
  body: z.string(),
  voteScore: z.number().int(),
  isExpertAnswer: z.boolean(),
  isAccepted: z.boolean(),
  author: z.object({
    userId: z.number().int(),
    displayName: z.string(),
    badgeLevel: ExpertBadgeLevelSchema.optional(),
    verified: z.boolean().optional(),
  }),
  createdAt: z.string().datetime(),
});

export const ExpertQaQuestionSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  trade: z.string().nullable(),
  anonymous: z.boolean(),
  status: ExpertQaQuestionStatusSchema,
  voteScore: z.number().int(),
  answerCount: z.number().int(),
  viewCount: z.number().int(),
  hasAcceptedAnswer: z.boolean(),
  tagSlugs: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const ExpertQaQuestionDetailSchema = ExpertQaQuestionSummarySchema.extend({
  body: z.string(),
  companyId: z.number().int().nullable(),
  projectId: z.number().int().nullable(),
  author: z
    .object({
      userId: z.number().int(),
      displayName: z.string(),
    })
    .nullable(),
  attachments: z.array(ExpertQaAttachmentSchema),
  answers: z.array(ExpertQaAnswerSchema),
  acceptedAnswerId: z.string().uuid().nullable(),
});

export const ExpertQaQuestionListSchema = z.object({
  items: z.array(ExpertQaQuestionSummarySchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const createExpertQaQuestionSchema = z.object({
  title: z.string().min(10).max(200),
  body: z.string().min(20).max(10000),
  trade: z.string().max(80).optional(),
  companyId: z.number().int().optional(),
  projectId: z.number().int().optional(),
  anonymous: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(40)).max(8).optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        mimeType: z.string(),
        type: ExpertQaAttachmentTypeSchema.optional(),
        sizeBytes: z.number().int().optional(),
      }),
    )
    .max(5)
    .optional(),
});

export const createExpertQaAnswerSchema = z.object({
  questionId: z.string().uuid(),
  body: z.string().min(10).max(10000),
});

export const voteExpertQaAnswerSchema = z.object({
  answerId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1)]),
  voterKey: z.string().optional(),
});

export const acceptExpertQaAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerId: z.string().uuid(),
});

export const expertQaListQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
  trade: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "votes", "unanswered"]).optional(),
});

export const endorseExpertSchema = z.object({
  expertProfileId: z.string().uuid(),
  skill: z.string().min(2).max(80),
  message: z.string().max(500).optional(),
});

export const moderateExpertQaSchema = z.object({
  id: z.string().uuid(),
  moderationStatus: ExpertQaModerationStatusSchema,
});

export type ExpertProfile = z.infer<typeof ExpertProfileSchema>;
export type ExpertQaQuestionSummary = z.infer<typeof ExpertQaQuestionSummarySchema>;
export type ExpertQaQuestionDetail = z.infer<typeof ExpertQaQuestionDetailSchema>;
export type ExpertQaAnswer = z.infer<typeof ExpertQaAnswerSchema>;
export type ExpertQaQuestionList = z.infer<typeof ExpertQaQuestionListSchema>;
