import { z } from "zod";

export const CailSourceTypeSchema = z.enum([
  "inspection",
  "bbo",
  "incident",
  "equipment",
  "jha",
  "flha",
  "heca",
  "sif",
  "training",
  "general",
]);

export const CailStatusSchema = z.enum([
  "open",
  "in_progress",
  "overdue",
  "resolved",
  "verified",
  "cancelled",
]);

export const CailSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const CailRiskCategorySchema = z.enum([
  "behavior",
  "equipment",
  "environment",
  "process",
  "ppe",
  "ergonomic",
  "other",
]);

export const CreateCailBodySchema = z.object({
  projectId: z.number().int(),
  ownerCompanyId: z.number().int(),
  sourceType: CailSourceTypeSchema,
  sourceId: z.string().optional(),
  sourceItemId: z.string().optional(),
  title: z.string().max(500),
  description: z.string().optional(),
  severity: CailSeveritySchema.optional(),
  riskCategory: CailRiskCategorySchema.optional(),
  dueDate: z.string().datetime().optional(),
  assignedUserId: z.number().int().optional(),
  siteId: z.number().int().optional(),
  locationNote: z.string().optional(),
  equipmentId: z.number().int().optional(),
  workerId: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateCailBodySchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().optional(),
  assignedUserId: z.number().int().optional(),
  severity: CailSeveritySchema.optional(),
  riskCategory: CailRiskCategorySchema.optional(),
  dueDate: z.string().datetime().optional(),
  status: CailStatusSchema.optional(),
  rootCauseCategory: z.string().optional(),
  rootCauseNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const CailEntrySummarySchema = z.object({
  id: z.string().uuid(),
  projectId: z.number().int(),
  ownerCompanyId: z.number().int(),
  sourceType: CailSourceTypeSchema,
  sourceId: z.string(),
  title: z.string(),
  status: CailStatusSchema,
  severity: CailSeveritySchema,
  dueDate: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CailProjectDashboardSchema = z.object({
  projectId: z.number().int(),
  total: z.number().int(),
  open: z.number().int(),
  resolved: z.number().int(),
  verified: z.number().int(),
  overdue: z.number().int(),
  closureRate: z.number(),
  byStatus: z.record(z.string(), z.number()),
  bySeverity: z.record(z.string(), z.number()),
  recent: z.array(CailEntrySummarySchema.partial()),
});

export type CailSourceType = z.infer<typeof CailSourceTypeSchema>;
export type CailStatus = z.infer<typeof CailStatusSchema>;
export type CreateCailBody = z.infer<typeof CreateCailBodySchema>;

export const LessonLearnedSummarySchema = z.object({
  id: z.string().uuid(),
  cailId: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  sourceType: CailSourceTypeSchema,
  publishedAt: z.string(),
});

export const VsiProjectDashboardSchema = z.object({
  projectId: z.number().int(),
  total: z.number().int(),
  open: z.number().int(),
  closureRate: z.number(),
  bbo: z
    .object({
      total: z.number().int(),
      safe: z.number().int(),
      positiveRatio: z.number(),
    })
    .optional(),
});
