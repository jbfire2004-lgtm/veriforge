import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'SUPER_ADMIN',
  'UNION_HALL_ADMIN',
  'COMPANY_ADMIN',
  'ADMIN',
  'SUPERVISOR',
  'PROJECT_MANAGER',
  'WORKER',
  'TRAINING_PROVIDER_ADMIN',
  'TRAINING_INSTRUCTOR',
]);

export const ProjectStatusSchema = z.enum(['ACTIVE', 'CLOSED']);
export const AssignmentStatusSchema = z.enum(['ACTIVE', 'REMOVED', 'COMPLETED']);
export const LinkComplianceStatusSchema = z.enum([
  'COMPLIANT',
  'NEEDS_ATTENTION',
  'NON_COMPLIANT',
  'LOCKED_OUT',
]);

export const CompanyLinkSchema = z.object({
  id: z.number(),
  workerId: z.number(),
  companyId: z.number(),
  active: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  role: z.string().nullable(),
  trade: z.string().nullable(),
});

export const EquipmentLinkSchema = z.object({
  id: z.number(),
  equipmentId: z.number(),
  companyId: z.number(),
  active: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  complianceStatus: LinkComplianceStatusSchema,
});

export const ProjectSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  siteId: z.number().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  status: ProjectStatusSchema,
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
});

export const WorkerWalletSchema = z.object({
  type: z.literal('worker'),
  workerId: z.number(),
  qrToken: z.string(),
  qrContent: z.string(),
  qrJson: z.object({
    type: z.literal('worker'),
    id: z.number(),
    token: z.string(),
  }),
  /** Enriched provider training (GET /api/v1/core/wallets/worker/:id). */
  training: z.array(z.unknown()).optional(),
  companyHistory: z.array(z.unknown()).optional(),
  projectHistory: z.array(z.unknown()).optional(),
  walletItems: z.array(z.unknown()).optional(),
});

export const EquipmentWalletSchema = z.object({
  type: z.literal('equipment'),
  equipmentId: z.number(),
  qrToken: z.string(),
  qrContent: z.string(),
  complianceStatus: LinkComplianceStatusSchema,
  lastInspectionAt: z.string().datetime().nullable().optional(),
  nextInspectionAt: z.string().datetime().nullable().optional(),
  lockoutStatus: z.enum(['CLEAR', 'LOCKED_OUT']).optional(),
  competencyRequired: z.boolean().optional(),
  trainingRequired: z.boolean().optional(),
  complianceUpdatedAt: z.string().datetime().nullable().optional(),
  lockedOut: z.boolean(),
});

export const LinkWorkerBodySchema = z.object({
  workerId: z.number(),
  companyId: z.number(),
  role: z.string().optional(),
  trade: z.string().optional(),
  deactivateOtherCompanies: z.boolean().optional(),
});

export const LinkByQrBodySchema = z.object({
  qrToken: z.string(),
  companyId: z.number(),
});

export const TrainingIngestBodySchema = z.object({
  workerId: z.number().optional(),
  workerEmail: z.string().email().optional(),
  workerPhone: z.string().optional(),
  equipmentId: z.number().optional(),
  companyId: z.number().optional(),
  projectId: z.number().optional(),
  certificationId: z.number(),
  providerId: z.number().optional(),
  trainingProviderId: z.number().optional(),
  courseId: z.number().optional(),
  instructorId: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
  issuedAt: z.string().datetime().optional(),
  certificateNumber: z.string().optional(),
});

export const MergeWorkerBodySchema = z.object({
  survivorId: z.number(),
  mergedId: z.number(),
  reason: z.string().optional(),
});

export const CreateProjectBodySchema = z.object({
  companyId: z.number(),
  name: z.string().min(1),
  code: z.string().optional(),
  siteId: z.number().optional(),
  startDate: z.string().datetime().optional(),
});

export const DispatchWorkerBodySchema = z.object({
  workerId: z.number(),
  companyId: z.number(),
  notes: z.string().optional(),
});

export const CompetencyEvaluateBodySchema = z.object({
  workerId: z.number(),
  equipmentId: z.number(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  evidenceNotes: z.string().optional(),
  evidencePhotos: z.array(z.string()).optional(),
  workerSignature: z.string().optional(),
  evaluatorSignature: z.string().optional(),
});

export const CreateInspectionBodySchema = z.object({
  equipmentId: z.number(),
  siteId: z.number().optional(),
  kind: z.enum(['PRE_USE', 'FORMAL']).optional(),
  checklist: z.record(z.unknown()),
  passed: z.boolean(),
  notes: z.string().optional(),
  correctiveActions: z.string().optional(),
  meterReading: z.number().optional(),
  signature: z.string().optional(),
});
