"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanEquipmentQrResponseSchema = exports.EquipmentWalletFullSchema = exports.EquipmentWalletComplianceSchema = exports.EquipmentWalletInspectionSchema = exports.EquipmentWalletQrSchema = void 0;
const zod_1 = require("zod");
const equipment_1 = require("./equipment");
const inspection_1 = require("./inspection");
const maintenance_calibration_1 = require("./maintenance-calibration");
exports.EquipmentWalletQrSchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    equipmentName: zod_1.z.string(),
    serialNumber: zod_1.z.string().nullable(),
    assetTag: zod_1.z.string().nullable(),
    qrToken: zod_1.z.string(),
    qrContent: zod_1.z.string(),
    scanUrl: zod_1.z.string(),
    verifyUrl: zod_1.z.string(),
    walletUrl: zod_1.z.string(),
});
exports.EquipmentWalletInspectionSchema = zod_1.z.object({
    id: zod_1.z.number(),
    inspectionType: inspection_1.InspectionTypeSchema,
    kind: zod_1.z.enum(['PRE_USE', 'FORMAL']),
    passed: zod_1.z.boolean().nullable(),
    status: zod_1.z.string(),
    lockoutTriggered: zod_1.z.boolean(),
    completedAt: zod_1.z.string().datetime().nullable(),
    nextInspectionDate: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    worker: zod_1.z
        .object({ id: zod_1.z.number(), firstName: zod_1.z.string(), lastName: zod_1.z.string() })
        .nullable()
        .optional(),
    inspectorId: zod_1.z.number().nullable().optional(),
    checklistName: zod_1.z.string().optional(),
});
exports.EquipmentWalletComplianceSchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    complianceStatus: equipment_1.LinkComplianceStatusSchema,
    linkComplianceStatus: equipment_1.LinkComplianceStatusSchema.nullable(),
    lastInspectionAt: zod_1.z.string().datetime().nullable(),
    nextInspectionAt: zod_1.z.string().datetime().nullable(),
    lockoutStatus: zod_1.z.enum(['CLEAR', 'LOCKED_OUT']),
    lockedOut: zod_1.z.boolean(),
    lockoutReason: zod_1.z.string().nullable(),
    safetyStatus: zod_1.z.string(),
    competencyRequired: zod_1.z.boolean(),
    trainingRequired: zod_1.z.boolean(),
    complianceUpdatedAt: zod_1.z.string().datetime().nullable(),
});
exports.EquipmentWalletFullSchema = zod_1.z.object({
    type: zod_1.z.literal('equipment'),
    equipment: zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        serialNumber: zod_1.z.string().nullable(),
        assetTag: zod_1.z.string().nullable(),
        catalogTypeKey: zod_1.z.string().nullable(),
        photoUrl: zod_1.z.string().nullable(),
    }),
    qr: exports.EquipmentWalletQrSchema,
    inspections: zod_1.z.array(exports.EquipmentWalletInspectionSchema),
    competency: zod_1.z.unknown(),
    assignedWorkers: zod_1.z.array(zod_1.z.unknown()),
    assignedProjects: zod_1.z.array(zod_1.z.unknown()),
    compliance: exports.EquipmentWalletComplianceSchema,
    trainingRequirements: zod_1.z.array(zod_1.z.unknown()),
    maintenance: maintenance_calibration_1.EquipmentMaintenanceCalibrationSummarySchema.optional(),
});
exports.ScanEquipmentQrResponseSchema = zod_1.z.object({
    linked: zod_1.z.boolean(),
    equipmentId: zod_1.z.number(),
    companyId: zod_1.z.number(),
    linkId: zod_1.z.number(),
    complianceStatus: equipment_1.LinkComplianceStatusSchema,
    equipmentName: zod_1.z.string().nullable(),
    walletUrl: zod_1.z.string(),
});
