import { z } from 'zod';

export const EquipmentSafetyStatusSchema = z.enum([
  'OK',
  'NEEDS_INSPECTION',
  'UNSAFE',
]);

export const LinkComplianceStatusSchema = z.enum([
  'COMPLIANT',
  'NEEDS_ATTENTION',
  'NON_COMPLIANT',
  'LOCKED_OUT',
]);

export const EquipmentLockoutStatusSchema = z.enum(['CLEAR', 'LOCKED_OUT']);

export const EquipmentMaintenanceTypeSchema = z.enum([
  'PREVENTIVE',
  'CORRECTIVE',
  'SCHEDULED',
  'EMERGENCY',
]);

export const EquipmentAttachmentTypeSchema = z.enum([
  'PHOTO',
  'MANUAL',
  'CERTIFICATE',
  'INSPECTION_REPORT',
  'OTHER',
]);

export const CreateEquipmentBodySchema = z.object({
  name: z.string().min(1),
  serialNumber: z.string().optional(),
  assetTag: z.string().optional(),
  companyId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  typeId: z.number().int().positive().optional(),
  safetyStatus: EquipmentSafetyStatusSchema.optional(),
  photoUrl: z.string().url().optional(),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  yearMade: z.number().int().min(1900).max(2100).optional(),
  catalogCategory: z
    .enum(['MOBILE_EQUIPMENT', 'SAFETY_CRITICAL', 'SERIALIZED_TOOLS', 'OTHER'])
    .optional(),
  catalogTypeKey: z.string().optional(),
  meterHours: z.number().nonnegative().optional(),
});

export const UpdateEquipmentBodySchema = CreateEquipmentBodySchema.partial();

export const EquipmentComplianceSnapshotSchema = z.object({
  complianceStatus: LinkComplianceStatusSchema,
  lastInspectionAt: z.string().datetime().nullable(),
  nextInspectionAt: z.string().datetime().nullable(),
  lockoutStatus: EquipmentLockoutStatusSchema,
  competencyRequired: z.boolean(),
  trainingRequired: z.boolean(),
  complianceUpdatedAt: z.string().datetime().nullable(),
});

export const EquipmentDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  serialNumber: z.string().nullable(),
  assetTag: z.string().nullable(),
  qrToken: z.string().nullable(),
  safetyStatus: EquipmentSafetyStatusSchema,
  isLockedOut: z.boolean(),
  isSafe: z.boolean(),
  companyId: z.number().nullable(),
  complianceStatus: LinkComplianceStatusSchema.optional(),
  lastInspectionAt: z.string().datetime().nullable().optional(),
  nextInspectionAt: z.string().datetime().nullable().optional(),
  lockoutStatus: EquipmentLockoutStatusSchema.optional(),
  competencyRequired: z.boolean().optional(),
  trainingRequired: z.boolean().optional(),
  complianceUpdatedAt: z.string().datetime().nullable().optional(),
  activeCompanyLink: z
    .object({
      id: z.number(),
      companyId: z.number(),
      active: z.boolean(),
      complianceStatus: LinkComplianceStatusSchema,
    })
    .nullable(),
});

export const AssignProjectBodySchema = z.object({
  projectId: z.number().int().positive(),
});

export const AssignWorkerBodySchema = z.object({
  workerId: z.number().int().positive(),
  companyId: z.number().int().positive().optional(),
});

export const LockoutBodySchema = z.object({
  reason: z.string().min(1),
  companyId: z.number().int().positive().optional(),
});

export const UnlockBodySchema = z.object({
  notes: z.string().optional(),
});

export const MaintenanceBodySchema = z.object({
  type: EquipmentMaintenanceTypeSchema.optional(),
  performedAt: z.string().datetime().optional(),
  performedBy: z.number().int().optional(),
  notes: z.string().optional(),
  nextDueAt: z.string().datetime().optional(),
  meterHours: z.number().optional(),
});

export const CalibrationBodySchema = z.object({
  calibratedAt: z.string().datetime().optional(),
  calibratedBy: z.number().int().optional(),
  certificateNumber: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  passed: z.boolean().optional(),
  notes: z.string().optional(),
});

export const ScanEquipmentQrBodySchema = z.object({
  qrToken: z.string().min(1),
  companyId: z.number().int().positive(),
});

export const EquipmentDashboardSchema = z.object({
  total: z.number(),
  lockedOut: z.number(),
  nonCompliant: z.number(),
  needsInspection: z.number(),
  recent: z.array(z.unknown()),
});

export const EquipmentTimelineEventSchema = z.object({
  at: z.string().datetime(),
  type: z.string(),
  title: z.string(),
  detail: z.string().optional(),
});

export const EquipmentWalletResponseSchema = z.object({
  type: z.literal('equipment'),
  equipmentId: z.number(),
  qrToken: z.string(),
  complianceStatus: LinkComplianceStatusSchema,
  lockedOut: z.boolean(),
  lockoutReason: z.string().nullable().optional(),
});
