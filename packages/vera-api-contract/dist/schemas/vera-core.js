"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInspectionBodySchema = exports.CompetencyEvaluateBodySchema = exports.DispatchWorkerBodySchema = exports.CreateProjectBodySchema = exports.MergeWorkerBodySchema = exports.TrainingIngestBodySchema = exports.LinkByQrBodySchema = exports.LinkWorkerBodySchema = exports.EquipmentWalletSchema = exports.WorkerWalletSchema = exports.ProjectSchema = exports.EquipmentLinkSchema = exports.CompanyLinkSchema = exports.LinkComplianceStatusSchema = exports.AssignmentStatusSchema = exports.ProjectStatusSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum([
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
exports.ProjectStatusSchema = zod_1.z.enum(['ACTIVE', 'CLOSED']);
exports.AssignmentStatusSchema = zod_1.z.enum(['ACTIVE', 'REMOVED', 'COMPLETED']);
exports.LinkComplianceStatusSchema = zod_1.z.enum([
    'COMPLIANT',
    'NEEDS_ATTENTION',
    'NON_COMPLIANT',
    'LOCKED_OUT',
]);
exports.CompanyLinkSchema = zod_1.z.object({
    id: zod_1.z.number(),
    workerId: zod_1.z.number(),
    companyId: zod_1.z.number(),
    active: zod_1.z.boolean(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().nullable(),
    role: zod_1.z.string().nullable(),
    trade: zod_1.z.string().nullable(),
});
exports.EquipmentLinkSchema = zod_1.z.object({
    id: zod_1.z.number(),
    equipmentId: zod_1.z.number(),
    companyId: zod_1.z.number(),
    active: zod_1.z.boolean(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().nullable(),
    complianceStatus: exports.LinkComplianceStatusSchema,
});
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.number(),
    companyId: zod_1.z.number(),
    siteId: zod_1.z.number().nullable(),
    name: zod_1.z.string(),
    code: zod_1.z.string().nullable(),
    status: exports.ProjectStatusSchema,
    startDate: zod_1.z.string().datetime().nullable(),
    endDate: zod_1.z.string().datetime().nullable(),
});
exports.WorkerWalletSchema = zod_1.z.object({
    type: zod_1.z.literal('worker'),
    workerId: zod_1.z.number(),
    qrToken: zod_1.z.string(),
    qrContent: zod_1.z.string(),
    qrJson: zod_1.z.object({
        type: zod_1.z.literal('worker'),
        id: zod_1.z.number(),
        token: zod_1.z.string(),
    }),
    /** Enriched provider training (GET /api/v1/core/wallets/worker/:id). */
    training: zod_1.z.array(zod_1.z.unknown()).optional(),
    companyHistory: zod_1.z.array(zod_1.z.unknown()).optional(),
    projectHistory: zod_1.z.array(zod_1.z.unknown()).optional(),
    walletItems: zod_1.z.array(zod_1.z.unknown()).optional(),
});
exports.EquipmentWalletSchema = zod_1.z.object({
    type: zod_1.z.literal('equipment'),
    equipmentId: zod_1.z.number(),
    qrToken: zod_1.z.string(),
    qrContent: zod_1.z.string(),
    complianceStatus: exports.LinkComplianceStatusSchema,
    lastInspectionAt: zod_1.z.string().datetime().nullable().optional(),
    nextInspectionAt: zod_1.z.string().datetime().nullable().optional(),
    lockoutStatus: zod_1.z.enum(['CLEAR', 'LOCKED_OUT']).optional(),
    competencyRequired: zod_1.z.boolean().optional(),
    trainingRequired: zod_1.z.boolean().optional(),
    complianceUpdatedAt: zod_1.z.string().datetime().nullable().optional(),
    lockedOut: zod_1.z.boolean(),
});
exports.LinkWorkerBodySchema = zod_1.z.object({
    workerId: zod_1.z.number(),
    companyId: zod_1.z.number(),
    role: zod_1.z.string().optional(),
    trade: zod_1.z.string().optional(),
    deactivateOtherCompanies: zod_1.z.boolean().optional(),
});
exports.LinkByQrBodySchema = zod_1.z.object({
    qrToken: zod_1.z.string(),
    companyId: zod_1.z.number(),
});
exports.TrainingIngestBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().optional(),
    workerEmail: zod_1.z.string().email().optional(),
    workerPhone: zod_1.z.string().optional(),
    equipmentId: zod_1.z.number().optional(),
    companyId: zod_1.z.number().optional(),
    projectId: zod_1.z.number().optional(),
    certificationId: zod_1.z.number(),
    providerId: zod_1.z.number().optional(),
    trainingProviderId: zod_1.z.number().optional(),
    courseId: zod_1.z.number().optional(),
    instructorId: zod_1.z.number().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    issuedAt: zod_1.z.string().datetime().optional(),
    certificateNumber: zod_1.z.string().optional(),
});
exports.MergeWorkerBodySchema = zod_1.z.object({
    survivorId: zod_1.z.number(),
    mergedId: zod_1.z.number(),
    reason: zod_1.z.string().optional(),
});
exports.CreateProjectBodySchema = zod_1.z.object({
    companyId: zod_1.z.number(),
    name: zod_1.z.string().min(1),
    code: zod_1.z.string().optional(),
    siteId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime().optional(),
});
exports.DispatchWorkerBodySchema = zod_1.z.object({
    workerId: zod_1.z.number(),
    companyId: zod_1.z.number(),
    notes: zod_1.z.string().optional(),
});
exports.CompetencyEvaluateBodySchema = zod_1.z.object({
    workerId: zod_1.z.number(),
    equipmentId: zod_1.z.number(),
    score: zod_1.z.number().min(0).max(100),
    passed: zod_1.z.boolean(),
    evidenceNotes: zod_1.z.string().optional(),
    evidencePhotos: zod_1.z.array(zod_1.z.string()).optional(),
    workerSignature: zod_1.z.string().optional(),
    evaluatorSignature: zod_1.z.string().optional(),
});
exports.CreateInspectionBodySchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    siteId: zod_1.z.number().optional(),
    kind: zod_1.z.enum(['PRE_USE', 'FORMAL']).optional(),
    checklist: zod_1.z.record(zod_1.z.unknown()),
    passed: zod_1.z.boolean(),
    notes: zod_1.z.string().optional(),
    correctiveActions: zod_1.z.string().optional(),
    meterReading: zod_1.z.number().optional(),
    signature: zod_1.z.string().optional(),
});
