import { z } from 'zod';

/** Unified SMS workflow entity slugs (`/api/v1/pm/sms/workflows/:entity`). */
export const SmsWorkflowEntitySchema = z.enum([
  'flha',
  'jha',
  'inspection',
  'audit',
  'corrective-action',
  'investigation',
]);

export const JhaFlhaStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'LOCKED',
  'REJECTED',
]);

export const PmInspectionStatusSchema = z.enum([
  'draft',
  'in_progress',
  'submitted',
  'review_required',
  'approved',
  'rejected',
  'closed',
]);

export const PmCorrectiveActionStatusSchema = z.enum([
  'draft',
  'open',
  'assigned',
  'in_progress',
  'verification_pending',
  'verified',
  'closed',
  'cancelled',
]);

export const PmInvestigationStatusSchema = z.enum([
  'not_started',
  'evidence_gathering',
  'analysis',
  'root_cause',
  'capa_planning',
  'review',
  'closed',
]);

export const SmsWorkflowSectionSchema = z.enum([
  'overview',
  'hazards',
  'findings',
  'controls',
  'actions',
  'signatures',
  'attachments',
]);

export const SmsWorkflowListQuerySchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  kind: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const SmsWorkflowCreateBodySchema = z.object({
  companyId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  clientSyncId: z.string().max(128).optional(),
  /** FLHA / JHA */
  kind: z.enum(['FLHA', 'JHA']).optional(),
  taskDescription: z.string().min(1).max(4000).optional(),
  workScope: z.string().max(8000).optional(),
  locationNote: z.string().max(2000).optional(),
  /** Inspection / audit */
  templateId: z.string().uuid().optional(),
  title: z.string().max(500).optional(),
  siteId: z.coerce.number().int().optional(),
  equipmentId: z.coerce.number().int().optional(),
  workerId: z.coerce.number().int().optional(),
  /** Corrective action */
  sourceModule: z.string().max(64).optional(),
  sourceId: z.string().max(128).optional(),
  description: z.string().max(8000).optional(),
  actionType: z.string().max(64).optional(),
  severity: z.string().max(32).optional(),
  assignUserId: z.coerce.number().int().optional(),
  publish: z.boolean().optional(),
  /** Investigation (requires parent incident event) */
  eventId: z.string().uuid().optional(),
  leadInvestigatorId: z.coerce.number().int().optional(),
});

export const SmsWorkflowUpdateBodySchema = z.object({
  overview: z.record(z.unknown()).optional(),
  hazards: z.array(z.unknown()).optional(),
  findings: z.array(z.unknown()).optional(),
  controls: z.array(z.unknown()).optional(),
  actions: z.array(z.unknown()).optional(),
  signatures: z.array(z.unknown()).optional(),
  attachments: z.array(z.unknown()).optional(),
  answers: z.record(z.unknown()).optional(),
  taskDescription: z.string().max(4000).optional(),
  workScope: z.string().max(8000).optional(),
  locationNote: z.string().max(2000).optional(),
  environmentalJson: z.record(z.unknown()).optional(),
  title: z.string().max(500).optional(),
  narrative: z.string().max(16000).optional(),
  immediateActions: z.string().max(8000).optional(),
  status: z.string().max(64).optional(),
  currentStep: z.coerce.number().int().min(0).optional(),
  guidedAnswersJson: z.record(z.unknown()).optional(),
});

export type SmsWorkflowEntity = z.infer<typeof SmsWorkflowEntitySchema>;
export type SmsWorkflowListQuery = z.infer<typeof SmsWorkflowListQuerySchema>;
export type SmsWorkflowCreateBody = z.infer<typeof SmsWorkflowCreateBodySchema>;
export type SmsWorkflowUpdateBody = z.infer<typeof SmsWorkflowUpdateBodySchema>;
