import { z } from 'zod';
import { LinkComplianceStatusSchema } from './equipment';

export const EquipmentComplianceDashboardSchema = z.object({
  total: z.number(),
  compliant: z.number(),
  needsAttention: z.number(),
  nonCompliant: z.number(),
  lockedOut: z.number(),
  overdueInspection: z.number(),
  recent: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      complianceStatus: LinkComplianceStatusSchema,
      lockoutStatus: z.enum(['CLEAR', 'LOCKED_OUT']),
      lastInspectionAt: z.string().datetime().nullable(),
      nextInspectionAt: z.string().datetime().nullable(),
      competencyRequired: z.boolean(),
      trainingRequired: z.boolean(),
      safetyStatus: z.string(),
      company: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    }),
  ),
});
