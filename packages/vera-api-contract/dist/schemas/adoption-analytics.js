"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRequestSchema = exports.FeedbackRequestStatusSchema = exports.ModuleUsageResponseSchema = exports.GrowthStatsResponseSchema = exports.GrowthMonthBucketSchema = exports.AdoptionMapResponseSchema = exports.AdoptionMapCompanySchema = exports.AdoptionCompanyAnalyticsSchema = void 0;
const zod_1 = require("zod");
exports.AdoptionCompanyAnalyticsSchema = zod_1.z.object({
    lastLogin: zod_1.z.string().nullable(),
    activeUsers30d: zod_1.z.number(),
    modulesUsed: zod_1.z.record(zod_1.z.number()),
    totalWorkers: zod_1.z.number(),
    totalEquipment: zod_1.z.number(),
    totalProjects: zod_1.z.number(),
    churnRiskScore: zod_1.z.number(),
});
exports.AdoptionMapCompanySchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    city: zod_1.z.string().nullable(),
    province: zod_1.z.string().nullable(),
    lat: zod_1.z.number().nullable(),
    lng: zod_1.z.number().nullable(),
    createdAt: zod_1.z.string(),
    analytics: exports.AdoptionCompanyAnalyticsSchema.nullable(),
});
exports.AdoptionMapResponseSchema = zod_1.z.array(exports.AdoptionMapCompanySchema);
exports.GrowthMonthBucketSchema = zod_1.z.object({
    month: zod_1.z.string(),
    count: zod_1.z.number(),
});
exports.GrowthStatsResponseSchema = zod_1.z.object({
    newCompaniesByMonth: zod_1.z.array(exports.GrowthMonthBucketSchema),
    newWorkersByMonth: zod_1.z.array(exports.GrowthMonthBucketSchema),
    newProjectsByMonth: zod_1.z.array(exports.GrowthMonthBucketSchema),
});
exports.ModuleUsageResponseSchema = zod_1.z.object({
    globalTotals: zod_1.z.record(zod_1.z.number()),
    companiesUsingModule: zod_1.z.record(zod_1.z.number()),
    totalCompanies: zod_1.z.number(),
    moduleAdoptionPercent: zod_1.z.record(zod_1.z.number()),
    companies: zod_1.z.array(zod_1.z.object({
        companyId: zod_1.z.number(),
        companyName: zod_1.z.string(),
        modulesUsed: zod_1.z.record(zod_1.z.number()),
        activeUsers30d: zod_1.z.number(),
        churnRiskScore: zod_1.z.number(),
    })),
});
exports.FeedbackRequestStatusSchema = zod_1.z.enum([
    "NEW",
    "PLANNED",
    "IN_PROGRESS",
    "COMPLETED",
    "DECLINED",
]);
exports.FeedbackRequestSchema = zod_1.z.object({
    id: zod_1.z.number(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    status: exports.FeedbackRequestStatusSchema,
    upvotes: zod_1.z.number(),
    internalNotes: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string().optional(),
});
