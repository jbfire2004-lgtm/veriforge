import { z } from "zod";

export const ModerationTargetTypeSchema = z.enum([
  "FEED_ITEM",
  "SOCIAL_POST",
  "USER",
  "EXPERT_QA_QUESTION",
  "EXPERT_QA_ANSWER",
  "SAFETY_ARTICLE",
  "SAFETY_COMMENT",
  "JOB_POST",
]);

export const SocialPostModerationFlagSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  reason: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
  reporter: z.object({ id: z.number(), username: z.string() }),
  post: z
    .object({
      id: z.string().uuid(),
      title: z.string().nullable(),
      body: z.string(),
      postType: z.string(),
      publishedAt: z.string().datetime(),
      deletedAt: z.string().datetime().nullable(),
      author: z.object({ id: z.number(), username: z.string() }),
    })
    .nullable(),
});

export const SocialPostModerationFlagListSchema = z.object({
  items: z.array(SocialPostModerationFlagSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export type SocialPostModerationFlag = z.infer<typeof SocialPostModerationFlagSchema>;

export const ModerationReportReasonSchema = z.enum([
  "SPAM",
  "HARASSMENT",
  "MISINFORMATION",
  "OFF_TOPIC",
  "IMPERSONATION",
  "SAFETY_RISK",
  "OTHER",
]);

export const ModerationCaseStatusSchema = z.enum([
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "DISMISSED",
]);

export const ModerationCaseSourceSchema = z.enum(["USER_REPORT", "AUTO_RULE"]);

export const ModerationResolutionSchema = z.enum([
  "NO_ACTION",
  "CONTENT_HIDDEN",
  "USER_WARNED",
  "USER_SUSPENDED",
  "EXPERT_VERIFIED",
  "EXPERT_REJECTED",
]);

export const ModerationAutoRuleTypeSchema = z.enum([
  "KEYWORD_MATCH",
  "REPORT_THRESHOLD",
  "REPUTATION_FLOOR",
]);

export const ModerationAutoActionSchema = z.enum(["FLAG", "AUTO_HIDE"]);

export const ExpertVerificationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const reportPostSchema = z.object({
  targetType: ModerationTargetTypeSchema.exclude(["USER"]),
  targetId: z.string().min(1),
  reason: ModerationReportReasonSchema,
  details: z.string().max(2000).optional(),
});

export const reportUserSchema = z.object({
  userId: z.number().int().positive(),
  reason: ModerationReportReasonSchema,
  details: z.string().max(2000).optional(),
});

export const moderationQueueQuerySchema = z.object({
  status: ModerationCaseStatusSchema.optional(),
  targetType: ModerationTargetTypeSchema.optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export const resolveModerationCaseSchema = z.object({
  caseId: z.string().uuid(),
  status: ModerationCaseStatusSchema,
  resolution: ModerationResolutionSchema.optional(),
  resolutionNote: z.string().max(2000).optional(),
});

export const upsertAutoRuleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  enabled: z.boolean().optional(),
  targetType: ModerationTargetTypeSchema.optional(),
  ruleType: ModerationAutoRuleTypeSchema,
  config: z.record(z.string(), z.unknown()),
  priority: z.number().int().optional(),
  action: ModerationAutoActionSchema.optional(),
});

export const applyExpertVerificationSchema = z.object({
  statement: z.string().min(20).max(5000),
  tradeEvidence: z.string().max(2000).optional(),
});

export const reviewExpertVerificationSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(2000).optional(),
});

export const ModerationCaseSchema = z.object({
  id: z.string().uuid(),
  source: ModerationCaseSourceSchema,
  targetType: ModerationTargetTypeSchema,
  targetId: z.string(),
  reportReason: ModerationReportReasonSchema.nullable(),
  reportDetails: z.string().nullable(),
  reporterUserId: z.number().int().nullable(),
  reporterName: z.string().nullable().optional(),
  autoRuleName: z.string().nullable().optional(),
  priority: z.number().int(),
  status: ModerationCaseStatusSchema,
  resolution: ModerationResolutionSchema.nullable(),
  resolutionNote: z.string().nullable(),
  targetSummary: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ModerationCaseListSchema = z.object({
  items: z.array(ModerationCaseSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const ModerationAutoRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  enabled: z.boolean(),
  targetType: ModerationTargetTypeSchema.nullable(),
  ruleType: ModerationAutoRuleTypeSchema,
  config: z.record(z.string(), z.unknown()),
  priority: z.number().int(),
  action: ModerationAutoActionSchema,
});

export const ExpertVerificationRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int(),
  displayName: z.string(),
  headline: z.string().nullable(),
  trade: z.string().nullable(),
  status: ExpertVerificationStatusSchema,
  statement: z.string().nullable(),
  tradeEvidence: z.string().nullable(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
  reviewNote: z.string().nullable(),
});

export type ModerationCase = z.infer<typeof ModerationCaseSchema>;
export type ModerationCaseList = z.infer<typeof ModerationCaseListSchema>;
export type ModerationAutoRule = z.infer<typeof ModerationAutoRuleSchema>;
export type ExpertVerificationRequest = z.infer<typeof ExpertVerificationRequestSchema>;
