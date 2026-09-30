"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiProjectDashboardSchema = exports.LessonLearnedSummarySchema = exports.CailProjectDashboardSchema = exports.CailEntrySummarySchema = exports.UpdateCailBodySchema = exports.CreateCailBodySchema = exports.CailRiskCategorySchema = exports.CailSeveritySchema = exports.CailStatusSchema = exports.CailSourceTypeSchema = void 0;
const zod_1 = require("zod");
exports.CailSourceTypeSchema = zod_1.z.enum([
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
exports.CailStatusSchema = zod_1.z.enum([
    "open",
    "in_progress",
    "overdue",
    "resolved",
    "verified",
    "cancelled",
]);
exports.CailSeveritySchema = zod_1.z.enum([
    "low",
    "medium",
    "high",
    "critical",
]);
exports.CailRiskCategorySchema = zod_1.z.enum([
    "behavior",
    "equipment",
    "environment",
    "process",
    "ppe",
    "ergonomic",
    "other",
]);
exports.CreateCailBodySchema = zod_1.z.object({
    projectId: zod_1.z.number().int(),
    ownerCompanyId: zod_1.z.number().int(),
    sourceType: exports.CailSourceTypeSchema,
    sourceId: zod_1.z.string().optional(),
    sourceItemId: zod_1.z.string().optional(),
    title: zod_1.z.string().max(500),
    description: zod_1.z.string().optional(),
    severity: exports.CailSeveritySchema.optional(),
    riskCategory: exports.CailRiskCategorySchema.optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    assignedUserId: zod_1.z.number().int().optional(),
    siteId: zod_1.z.number().int().optional(),
    locationNote: zod_1.z.string().optional(),
    equipmentId: zod_1.z.number().int().optional(),
    workerId: zod_1.z.number().int().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateCailBodySchema = zod_1.z.object({
    title: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().optional(),
    assignedUserId: zod_1.z.number().int().optional(),
    severity: exports.CailSeveritySchema.optional(),
    riskCategory: exports.CailRiskCategorySchema.optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    status: exports.CailStatusSchema.optional(),
    rootCauseCategory: zod_1.z.string().optional(),
    rootCauseNotes: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.CailEntrySummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    projectId: zod_1.z.number().int(),
    ownerCompanyId: zod_1.z.number().int(),
    sourceType: exports.CailSourceTypeSchema,
    sourceId: zod_1.z.string(),
    title: zod_1.z.string(),
    status: exports.CailStatusSchema,
    severity: exports.CailSeveritySchema,
    dueDate: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.CailProjectDashboardSchema = zod_1.z.object({
    projectId: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    open: zod_1.z.number().int(),
    resolved: zod_1.z.number().int(),
    verified: zod_1.z.number().int(),
    overdue: zod_1.z.number().int(),
    closureRate: zod_1.z.number(),
    byStatus: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    bySeverity: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    recent: zod_1.z.array(exports.CailEntrySummarySchema.partial()),
});
exports.LessonLearnedSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    cailId: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    summary: zod_1.z.string(),
    sourceType: exports.CailSourceTypeSchema,
    publishedAt: zod_1.z.string(),
});
exports.VsiProjectDashboardSchema = zod_1.z.object({
    projectId: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    open: zod_1.z.number().int(),
    closureRate: zod_1.z.number(),
    bbo: zod_1.z
        .object({
        total: zod_1.z.number().int(),
        safe: zod_1.z.number().int(),
        positiveRatio: zod_1.z.number(),
    })
        .optional(),
});
