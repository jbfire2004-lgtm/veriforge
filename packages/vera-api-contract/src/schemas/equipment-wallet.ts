import { z } from 'zod';
import { LinkComplianceStatusSchema } from './equipment';
import { InspectionTypeSchema } from './inspection';
import { EquipmentMaintenanceCalibrationSummarySchema } from './maintenance-calibration';

export const EquipmentWalletQrSchema = z.object({
  equipmentId: z.number(),
  equipmentName: z.string(),
  serialNumber: z.string().nullable(),
  assetTag: z.string().nullable(),
  qrToken: z.string(),
  qrContent: z.string(),
  scanUrl: z.string(),
  verifyUrl: z.string(),
  walletUrl: z.string(),
});

export const EquipmentWalletInspectionSchema = z.object({
  id: z.number(),
  inspectionType: InspectionTypeSchema,
  kind: z.enum(['PRE_USE', 'FORMAL']),
  passed: z.boolean().nullable(),
  status: z.string(),
  lockoutTriggered: z.boolean(),
  completedAt: z.string().datetime().nullable(),
  nextInspectionDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  worker: z
    .object({ id: z.number(), firstName: z.string(), lastName: z.string() })
    .nullable()
    .optional(),
  inspectorId: z.number().nullable().optional(),
  checklistName: z.string().optional(),
});

export const EquipmentWalletComplianceSchema = z.object({
  equipmentId: z.number(),
  complianceStatus: LinkComplianceStatusSchema,
  linkComplianceStatus: LinkComplianceStatusSchema.nullable(),
  lastInspectionAt: z.string().datetime().nullable(),
  nextInspectionAt: z.string().datetime().nullable(),
  lockoutStatus: z.enum(['CLEAR', 'LOCKED_OUT']),
  lockedOut: z.boolean(),
  lockoutReason: z.string().nullable(),
  safetyStatus: z.string(),
  competencyRequired: z.boolean(),
  trainingRequired: z.boolean(),
  complianceUpdatedAt: z.string().datetime().nullable(),
});

export const EquipmentWalletFullSchema = z.object({
  type: z.literal('equipment'),
  equipment: z.object({
    id: z.number(),
    name: z.string(),
    serialNumber: z.string().nullable(),
    assetTag: z.string().nullable(),
    catalogTypeKey: z.string().nullable(),
    photoUrl: z.string().nullable(),
  }),
  qr: EquipmentWalletQrSchema,
  inspections: z.array(EquipmentWalletInspectionSchema),
  competency: z.unknown(),
  assignedWorkers: z.array(z.unknown()),
  assignedProjects: z.array(z.unknown()),
  compliance: EquipmentWalletComplianceSchema,
  trainingRequirements: z.array(z.unknown()),
  maintenance: EquipmentMaintenanceCalibrationSummarySchema.optional(),
});

export const ScanEquipmentQrResponseSchema = z.object({
  linked: z.boolean(),
  equipmentId: z.number(),
  companyId: z.number(),
  linkId: z.number(),
  complianceStatus: LinkComplianceStatusSchema,
  equipmentName: z.string().nullable(),
  walletUrl: z.string(),
});
