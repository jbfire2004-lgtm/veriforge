"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentWalletResponseSchema = exports.EquipmentTimelineEventSchema = exports.EquipmentDashboardSchema = exports.ScanEquipmentQrBodySchema = exports.CalibrationBodySchema = exports.MaintenanceBodySchema = exports.UnlockBodySchema = exports.LockoutBodySchema = exports.AssignWorkerBodySchema = exports.AssignProjectBodySchema = exports.EquipmentDetailSchema = exports.EquipmentComplianceSnapshotSchema = exports.UpdateEquipmentBodySchema = exports.CreateEquipmentBodySchema = exports.EquipmentAttachmentTypeSchema = exports.EquipmentMaintenanceTypeSchema = exports.EquipmentLockoutStatusSchema = exports.LinkComplianceStatusSchema = exports.EquipmentSafetyStatusSchema = void 0;
const zod_1 = require("zod");
exports.EquipmentSafetyStatusSchema = zod_1.z.enum([
    'OK',
    'NEEDS_INSPECTION',
    'UNSAFE',
]);
exports.LinkComplianceStatusSchema = zod_1.z.enum([
    'COMPLIANT',
    'NEEDS_ATTENTION',
    'NON_COMPLIANT',
    'LOCKED_OUT',
]);
exports.EquipmentLockoutStatusSchema = zod_1.z.enum(['CLEAR', 'LOCKED_OUT']);
exports.EquipmentMaintenanceTypeSchema = zod_1.z.enum([
    'PREVENTIVE',
    'CORRECTIVE',
    'SCHEDULED',
    'EMERGENCY',
]);
exports.EquipmentAttachmentTypeSchema = zod_1.z.enum([
    'PHOTO',
    'MANUAL',
    'CERTIFICATE',
    'INSPECTION_REPORT',
    'OTHER',
]);
exports.CreateEquipmentBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    serialNumber: zod_1.z.string().optional(),
    assetTag: zod_1.z.string().optional(),
    companyId: zod_1.z.number().int().positive().optional(),
    categoryId: zod_1.z.number().int().positive().optional(),
    typeId: zod_1.z.number().int().positive().optional(),
    safetyStatus: exports.EquipmentSafetyStatusSchema.optional(),
    photoUrl: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional(),
    manufacturer: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    yearMade: zod_1.z.number().int().min(1900).max(2100).optional(),
    catalogCategory: zod_1.z
        .enum(['MOBILE_EQUIPMENT', 'SAFETY_CRITICAL', 'SERIALIZED_TOOLS', 'OTHER'])
        .optional(),
    catalogTypeKey: zod_1.z.string().optional(),
    meterHours: zod_1.z.number().nonnegative().optional(),
});
exports.UpdateEquipmentBodySchema = exports.CreateEquipmentBodySchema.partial();
exports.EquipmentComplianceSnapshotSchema = zod_1.z.object({
    complianceStatus: exports.LinkComplianceStatusSchema,
    lastInspectionAt: zod_1.z.string().datetime().nullable(),
    nextInspectionAt: zod_1.z.string().datetime().nullable(),
    lockoutStatus: exports.EquipmentLockoutStatusSchema,
    competencyRequired: zod_1.z.boolean(),
    trainingRequired: zod_1.z.boolean(),
    complianceUpdatedAt: zod_1.z.string().datetime().nullable(),
});
exports.EquipmentDetailSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    serialNumber: zod_1.z.string().nullable(),
    assetTag: zod_1.z.string().nullable(),
    qrToken: zod_1.z.string().nullable(),
    safetyStatus: exports.EquipmentSafetyStatusSchema,
    isLockedOut: zod_1.z.boolean(),
    isSafe: zod_1.z.boolean(),
    companyId: zod_1.z.number().nullable(),
    complianceStatus: exports.LinkComplianceStatusSchema.optional(),
    lastInspectionAt: zod_1.z.string().datetime().nullable().optional(),
    nextInspectionAt: zod_1.z.string().datetime().nullable().optional(),
    lockoutStatus: exports.EquipmentLockoutStatusSchema.optional(),
    competencyRequired: zod_1.z.boolean().optional(),
    trainingRequired: zod_1.z.boolean().optional(),
    complianceUpdatedAt: zod_1.z.string().datetime().nullable().optional(),
    activeCompanyLink: zod_1.z
        .object({
        id: zod_1.z.number(),
        companyId: zod_1.z.number(),
        active: zod_1.z.boolean(),
        complianceStatus: exports.LinkComplianceStatusSchema,
    })
        .nullable(),
});
exports.AssignProjectBodySchema = zod_1.z.object({
    projectId: zod_1.z.number().int().positive(),
});
exports.AssignWorkerBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive(),
    companyId: zod_1.z.number().int().positive().optional(),
});
exports.LockoutBodySchema = zod_1.z.object({
    reason: zod_1.z.string().min(1),
    companyId: zod_1.z.number().int().positive().optional(),
});
exports.UnlockBodySchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
exports.MaintenanceBodySchema = zod_1.z.object({
    type: exports.EquipmentMaintenanceTypeSchema.optional(),
    performedAt: zod_1.z.string().datetime().optional(),
    performedBy: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().optional(),
    nextDueAt: zod_1.z.string().datetime().optional(),
    meterHours: zod_1.z.number().optional(),
});
exports.CalibrationBodySchema = zod_1.z.object({
    calibratedAt: zod_1.z.string().datetime().optional(),
    calibratedBy: zod_1.z.number().int().optional(),
    certificateNumber: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    passed: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
});
exports.ScanEquipmentQrBodySchema = zod_1.z.object({
    qrToken: zod_1.z.string().min(1),
    companyId: zod_1.z.number().int().positive(),
});
exports.EquipmentDashboardSchema = zod_1.z.object({
    total: zod_1.z.number(),
    lockedOut: zod_1.z.number(),
    nonCompliant: zod_1.z.number(),
    needsInspection: zod_1.z.number(),
    recent: zod_1.z.array(zod_1.z.unknown()),
});
exports.EquipmentTimelineEventSchema = zod_1.z.object({
    at: zod_1.z.string().datetime(),
    type: zod_1.z.string(),
    title: zod_1.z.string(),
    detail: zod_1.z.string().optional(),
});
exports.EquipmentWalletResponseSchema = zod_1.z.object({
    type: zod_1.z.literal('equipment'),
    equipmentId: zod_1.z.number(),
    qrToken: zod_1.z.string(),
    complianceStatus: exports.LinkComplianceStatusSchema,
    lockedOut: zod_1.z.boolean(),
    lockoutReason: zod_1.z.string().nullable().optional(),
});
