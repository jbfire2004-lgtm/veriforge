import { z } from "zod";

export const AdoptionCompanyAnalyticsSchema = z.object({
  lastLogin: z.string().nullable(),
  activeUsers30d: z.number(),
  modulesUsed: z.record(z.number()),
  totalWorkers: z.number(),
  totalEquipment: z.number(),
  totalProjects: z.number(),
  churnRiskScore: z.number(),
});

export const AdoptionMapCompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  createdAt: z.string(),
  analytics: AdoptionCompanyAnalyticsSchema.nullable(),
});

export const AdoptionMapResponseSchema = z.array(AdoptionMapCompanySchema);

export const GrowthMonthBucketSchema = z.object({
  month: z.string(),
  count: z.number(),
});

export const GrowthStatsResponseSchema = z.object({
  newCompaniesByMonth: z.array(GrowthMonthBucketSchema),
  newWorkersByMonth: z.array(GrowthMonthBucketSchema),
  newProjectsByMonth: z.array(GrowthMonthBucketSchema),
});

export const ModuleUsageResponseSchema = z.object({
  globalTotals: z.record(z.number()),
  companiesUsingModule: z.record(z.number()),
  totalCompanies: z.number(),
  moduleAdoptionPercent: z.record(z.number()),
  companies: z.array(
    z.object({
      companyId: z.number(),
      companyName: z.string(),
      modulesUsed: z.record(z.number()),
      activeUsers30d: z.number(),
      churnRiskScore: z.number(),
    }),
  ),
});

export const FeedbackRequestStatusSchema = z.enum([
  "NEW",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
]);

export const FeedbackRequestSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: FeedbackRequestStatusSchema,
  upvotes: z.number(),
  internalNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type AdoptionMapCompany = z.infer<typeof AdoptionMapCompanySchema>;
export type GrowthStatsResponse = z.infer<typeof GrowthStatsResponseSchema>;
export type ModuleUsageResponse = z.infer<typeof ModuleUsageResponseSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
