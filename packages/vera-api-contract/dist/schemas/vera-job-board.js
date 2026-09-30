"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertWorkerProfileSchema = exports.updateApplicationStatusSchema = exports.applyToJobSchema = exports.createJobPostSchema = exports.jobBoardSearchSchema = exports.JobBoardApplicationSchema = exports.JobBoardWorkerProfileSchema = exports.JobBoardWorkerEndorsementSchema = exports.JobBoardWorkHistorySchema = exports.JobBoardPortfolioPhotoSchema = exports.JobBoardWorkerSkillSchema = exports.JobBoardJobListSchema = exports.JobBoardJobDetailSchema = exports.JobBoardJobSummarySchema = exports.JobBoardApplicationStatusSchema = exports.JobBoardExperienceLevelSchema = void 0;
const zod_1 = require("zod");
exports.JobBoardExperienceLevelSchema = zod_1.z.enum([
    "ENTRY",
    "INTERMEDIATE",
    "JOURNEYMAN",
    "FOREMAN",
]);
exports.JobBoardApplicationStatusSchema = zod_1.z.enum([
    "PENDING",
    "REVIEWING",
    "SHORTLISTED",
    "REJECTED",
    "HIRED",
    "WITHDRAWN",
]);
exports.JobBoardJobSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    companyName: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    locationCity: zod_1.z.string().nullable().optional(),
    locationRegion: zod_1.z.string().nullable().optional(),
    trade: zod_1.z.string().nullable(),
    payRange: zod_1.z.string().nullable(),
    payMin: zod_1.z.number().nullable().optional(),
    payMax: zod_1.z.number().nullable().optional(),
    payPeriod: zod_1.z.string().nullable().optional(),
    experienceLevel: exports.JobBoardExperienceLevelSchema.nullable().optional(),
    summary: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().datetime(),
    ticketNames: zod_1.z.array(zod_1.z.string()).optional(),
    projectName: zod_1.z.string().nullable().optional(),
});
exports.JobBoardJobDetailSchema = exports.JobBoardJobSummarySchema.extend({
    description: zod_1.z.string().nullable(),
    companyId: zod_1.z.number().int().nullable(),
    projectId: zod_1.z.number().int().nullable(),
    applicationCount: zod_1.z.number().int().optional(),
});
exports.JobBoardJobListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.JobBoardJobSummarySchema),
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    pageSize: zod_1.z.number().int(),
});
exports.JobBoardWorkerSkillSchema = zod_1.z.object({
    skill: zod_1.z.string(),
    level: zod_1.z.string().nullable(),
});
exports.JobBoardPortfolioPhotoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    imageUrl: zod_1.z.string(),
    caption: zod_1.z.string().nullable(),
});
exports.JobBoardWorkHistorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    employer: zod_1.z.string(),
    role: zod_1.z.string(),
    trade: zod_1.z.string().nullable(),
    startDate: zod_1.z.string().datetime().nullable(),
    endDate: zod_1.z.string().datetime().nullable(),
    description: zod_1.z.string().nullable(),
});
exports.JobBoardWorkerEndorsementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    skill: zod_1.z.string(),
    message: zod_1.z.string().nullable(),
    endorserName: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
});
exports.JobBoardWorkerProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workerId: zod_1.z.number().int(),
    displayName: zod_1.z.string(),
    headline: zod_1.z.string().nullable(),
    bio: zod_1.z.string().nullable(),
    primaryTrade: zod_1.z.string().nullable(),
    experienceLevel: exports.JobBoardExperienceLevelSchema.nullable(),
    yearsExperience: zod_1.z.number().int().nullable(),
    locationCity: zod_1.z.string().nullable(),
    locationRegion: zod_1.z.string().nullable(),
    openToWork: zod_1.z.boolean(),
    skills: zod_1.z.array(exports.JobBoardWorkerSkillSchema),
    portfolio: zod_1.z.array(exports.JobBoardPortfolioPhotoSchema),
    workHistory: zod_1.z.array(exports.JobBoardWorkHistorySchema),
    endorsements: zod_1.z.array(exports.JobBoardWorkerEndorsementSchema),
    tickets: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.JobBoardApplicationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    jobId: zod_1.z.string().uuid(),
    workerId: zod_1.z.number().int(),
    status: exports.JobBoardApplicationStatusSchema,
    coverMessage: zod_1.z.string().nullable(),
    chatRoomId: zod_1.z.number().int().nullable(),
    createdAt: zod_1.z.string().datetime(),
    workerName: zod_1.z.string().optional(),
});
exports.jobBoardSearchSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).optional(),
    pageSize: zod_1.z.number().int().min(1).max(50).optional(),
    trade: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    payMin: zod_1.z.number().optional(),
    payMax: zod_1.z.number().optional(),
    experienceLevel: exports.JobBoardExperienceLevelSchema.optional(),
    ticket: zod_1.z.string().optional(),
    q: zod_1.z.string().optional(),
});
exports.createJobPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    companyName: zod_1.z.string().min(1),
    description: zod_1.z.string().min(10),
    location: zod_1.z.string().optional(),
    locationCity: zod_1.z.string().optional(),
    locationRegion: zod_1.z.string().optional(),
    trade: zod_1.z.string().optional(),
    payMin: zod_1.z.number().optional(),
    payMax: zod_1.z.number().optional(),
    payPeriod: zod_1.z.string().optional(),
    payRange: zod_1.z.string().optional(),
    experienceLevel: exports.JobBoardExperienceLevelSchema.optional(),
    summary: zod_1.z.string().max(500).optional(),
    companyId: zod_1.z.number().int().optional(),
    projectId: zod_1.z.number().int().optional(),
    requiredTickets: zod_1.z.array(zod_1.z.string()).optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.applyToJobSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
    coverMessage: zod_1.z.string().max(2000).optional(),
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid(),
    status: exports.JobBoardApplicationStatusSchema,
});
exports.upsertWorkerProfileSchema = zod_1.z.object({
    headline: zod_1.z.string().max(120).optional(),
    bio: zod_1.z.string().max(5000).optional(),
    primaryTrade: zod_1.z.string().optional(),
    experienceLevel: exports.JobBoardExperienceLevelSchema.optional(),
    yearsExperience: zod_1.z.number().int().min(0).max(60).optional(),
    locationCity: zod_1.z.string().optional(),
    locationRegion: zod_1.z.string().optional(),
    openToWork: zod_1.z.boolean().optional(),
    skills: zod_1.z.array(zod_1.z.object({ skill: zod_1.z.string(), level: zod_1.z.string().optional() })).optional(),
});
