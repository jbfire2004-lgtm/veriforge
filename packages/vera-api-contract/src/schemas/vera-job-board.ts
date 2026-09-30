import { z } from "zod";

export const JobBoardExperienceLevelSchema = z.enum([
  "ENTRY",
  "INTERMEDIATE",
  "JOURNEYMAN",
  "FOREMAN",
]);

export const JobBoardApplicationStatusSchema = z.enum([
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
  "WITHDRAWN",
]);

export const JobBoardJobSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  companyName: z.string(),
  location: z.string().nullable(),
  locationCity: z.string().nullable().optional(),
  locationRegion: z.string().nullable().optional(),
  trade: z.string().nullable(),
  payRange: z.string().nullable(),
  payMin: z.number().nullable().optional(),
  payMax: z.number().nullable().optional(),
  payPeriod: z.string().nullable().optional(),
  experienceLevel: JobBoardExperienceLevelSchema.nullable().optional(),
  summary: z.string().nullable(),
  publishedAt: z.string().datetime(),
  ticketNames: z.array(z.string()).optional(),
  projectName: z.string().nullable().optional(),
});

export const JobBoardJobDetailSchema = JobBoardJobSummarySchema.extend({
  description: z.string().nullable(),
  companyId: z.number().int().nullable(),
  projectId: z.number().int().nullable(),
  applicationCount: z.number().int().optional(),
});

export const JobBoardJobListSchema = z.object({
  items: z.array(JobBoardJobSummarySchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const JobBoardWorkerSkillSchema = z.object({
  skill: z.string(),
  level: z.string().nullable(),
});

export const JobBoardPortfolioPhotoSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string(),
  caption: z.string().nullable(),
});

export const JobBoardWorkHistorySchema = z.object({
  id: z.string().uuid(),
  employer: z.string(),
  role: z.string(),
  trade: z.string().nullable(),
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  description: z.string().nullable(),
});

export const JobBoardWorkerEndorsementSchema = z.object({
  id: z.string().uuid(),
  skill: z.string(),
  message: z.string().nullable(),
  endorserName: z.string(),
  createdAt: z.string().datetime(),
});

export const JobBoardWorkerProfileSchema = z.object({
  id: z.string().uuid(),
  workerId: z.number().int(),
  displayName: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  primaryTrade: z.string().nullable(),
  experienceLevel: JobBoardExperienceLevelSchema.nullable(),
  yearsExperience: z.number().int().nullable(),
  locationCity: z.string().nullable(),
  locationRegion: z.string().nullable(),
  openToWork: z.boolean(),
  skills: z.array(JobBoardWorkerSkillSchema),
  portfolio: z.array(JobBoardPortfolioPhotoSchema),
  workHistory: z.array(JobBoardWorkHistorySchema),
  endorsements: z.array(JobBoardWorkerEndorsementSchema),
  tickets: z.array(z.string()).optional(),
});

export const JobBoardApplicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  workerId: z.number().int(),
  status: JobBoardApplicationStatusSchema,
  coverMessage: z.string().nullable(),
  chatRoomId: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  workerName: z.string().optional(),
});

export const jobBoardSearchSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
  trade: z.string().optional(),
  location: z.string().optional(),
  payMin: z.number().optional(),
  payMax: z.number().optional(),
  experienceLevel: JobBoardExperienceLevelSchema.optional(),
  ticket: z.string().optional(),
  q: z.string().optional(),
});

export const createJobPostSchema = z.object({
  title: z.string().min(3).max(200),
  companyName: z.string().min(1),
  description: z.string().min(10),
  location: z.string().optional(),
  locationCity: z.string().optional(),
  locationRegion: z.string().optional(),
  trade: z.string().optional(),
  payMin: z.number().optional(),
  payMax: z.number().optional(),
  payPeriod: z.string().optional(),
  payRange: z.string().optional(),
  experienceLevel: JobBoardExperienceLevelSchema.optional(),
  summary: z.string().max(500).optional(),
  companyId: z.number().int().optional(),
  projectId: z.number().int().optional(),
  requiredTickets: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const applyToJobSchema = z.object({
  jobId: z.string().uuid(),
  coverMessage: z.string().max(2000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: JobBoardApplicationStatusSchema,
});

export const upsertWorkerProfileSchema = z.object({
  headline: z.string().max(120).optional(),
  bio: z.string().max(5000).optional(),
  primaryTrade: z.string().optional(),
  experienceLevel: JobBoardExperienceLevelSchema.optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  locationCity: z.string().optional(),
  locationRegion: z.string().optional(),
  openToWork: z.boolean().optional(),
  skills: z.array(z.object({ skill: z.string(), level: z.string().optional() })).optional(),
});

export type JobBoardJobSummary = z.infer<typeof JobBoardJobSummarySchema>;
export type JobBoardJobDetail = z.infer<typeof JobBoardJobDetailSchema>;
export type JobBoardJobList = z.infer<typeof JobBoardJobListSchema>;
export type JobBoardWorkerProfile = z.infer<typeof JobBoardWorkerProfileSchema>;
export type JobBoardApplication = z.infer<typeof JobBoardApplicationSchema>;
