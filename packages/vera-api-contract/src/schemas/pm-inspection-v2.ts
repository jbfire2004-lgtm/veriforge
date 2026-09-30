import { z } from 'zod';

export const PmInspectionFindingCategorySchema = z.enum([
  'unsafe_condition',
  'missing_ppe',
  'equipment_defect',
  'housekeeping',
  'environmental',
  'other',
]);

export const PmInspectionResponsiblePartySchema = z.enum([
  'contractor',
  'supervisor',
  'company',
  'worker',
]);

export const PmInspectionPhotoCaptureBodySchema = z.object({
  dataUrl: z.string().optional(),
  coreFileId: z.number().int().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  caption: z.string().optional(),
  clientSyncId: z.string().optional(),
  offline: z.boolean().optional(),
  defaultSubcontractorCompanyId: z.number().int().optional(),
});

export const PmInspectionPhotoFindingSchema = z.object({
  id: z.string(),
  inspectionId: z.string(),
  category: PmInspectionFindingCategorySchema,
  title: z.string(),
  description: z.string().nullable().optional(),
  severity: z.string(),
  confidence: z.number(),
  responsibleParty: PmInspectionResponsiblePartySchema,
  evidenceRequired: z.array(z.string()),
  deficiencyId: z.string().nullable().optional(),
  correctiveActionId: z.string().nullable().optional(),
});

export const PmContractorDispatchStatusSchema = z.enum([
  'pending',
  'sent',
  'acknowledged',
  'in_progress',
  'completed',
  'overdue',
  'cancelled',
]);

export const PmInspectionContractorDispatchSchema = z.object({
  id: z.string(),
  correctiveActionId: z.string(),
  subcontractorCompanyId: z.number(),
  status: PmContractorDispatchStatusSchema,
  sentAt: z.string().nullable().optional(),
  acknowledgedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export type PmInspectionPhotoCaptureBody = z.infer<typeof PmInspectionPhotoCaptureBodySchema>;
