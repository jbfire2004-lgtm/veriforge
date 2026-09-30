import { z } from 'zod';

export const PlatformSummarySchema = z.object({
  companyId: z.number().nullable(),
  generatedAt: z.string(),
  modules: z.object({
    reporting: z.unknown(),
    equipment: z.object({
      total: z.number(),
      compliant: z.number(),
      needsAttention: z.number(),
      nonCompliant: z.number(),
      lockedOut: z.number(),
      overdueInspection: z.number(),
    }),
    inspections: z.object({
      total: z.number(),
      passed: z.number(),
      failed: z.number(),
      dueWithin7Days: z.number(),
    }),
    competency: z.object({
      totalEvaluations: z.number(),
      passing: z.number(),
      expiringSoon: z.number(),
      expired: z.number(),
    }),
    toolsPpe: z.unknown(),
    maintenanceCalibration: z.unknown(),
  }),
  links: z.record(z.string()),
});
