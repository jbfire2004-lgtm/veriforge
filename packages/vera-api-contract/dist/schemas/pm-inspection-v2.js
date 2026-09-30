"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmInspectionContractorDispatchSchema = exports.PmContractorDispatchStatusSchema = exports.PmInspectionPhotoFindingSchema = exports.PmInspectionPhotoCaptureBodySchema = exports.PmInspectionResponsiblePartySchema = exports.PmInspectionFindingCategorySchema = void 0;
const zod_1 = require("zod");
exports.PmInspectionFindingCategorySchema = zod_1.z.enum([
    'unsafe_condition',
    'missing_ppe',
    'equipment_defect',
    'housekeeping',
    'environmental',
    'other',
]);
exports.PmInspectionResponsiblePartySchema = zod_1.z.enum([
    'contractor',
    'supervisor',
    'company',
    'worker',
]);
exports.PmInspectionPhotoCaptureBodySchema = zod_1.z.object({
    dataUrl: zod_1.z.string().optional(),
    coreFileId: zod_1.z.number().int().optional(),
    fileName: zod_1.z.string().optional(),
    mimeType: zod_1.z.string().optional(),
    caption: zod_1.z.string().optional(),
    clientSyncId: zod_1.z.string().optional(),
    offline: zod_1.z.boolean().optional(),
    defaultSubcontractorCompanyId: zod_1.z.number().int().optional(),
});
exports.PmInspectionPhotoFindingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    inspectionId: zod_1.z.string(),
    category: exports.PmInspectionFindingCategorySchema,
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    severity: zod_1.z.string(),
    confidence: zod_1.z.number(),
    responsibleParty: exports.PmInspectionResponsiblePartySchema,
    evidenceRequired: zod_1.z.array(zod_1.z.string()),
    deficiencyId: zod_1.z.string().nullable().optional(),
    correctiveActionId: zod_1.z.string().nullable().optional(),
});
exports.PmContractorDispatchStatusSchema = zod_1.z.enum([
    'pending',
    'sent',
    'acknowledged',
    'in_progress',
    'completed',
    'overdue',
    'cancelled',
]);
exports.PmInspectionContractorDispatchSchema = zod_1.z.object({
    id: zod_1.z.string(),
    correctiveActionId: zod_1.z.string(),
    subcontractorCompanyId: zod_1.z.number(),
    status: exports.PmContractorDispatchStatusSchema,
    sentAt: zod_1.z.string().nullable().optional(),
    acknowledgedAt: zod_1.z.string().nullable().optional(),
    completedAt: zod_1.z.string().nullable().optional(),
});
