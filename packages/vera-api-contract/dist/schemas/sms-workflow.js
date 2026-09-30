"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsWorkflowUpdateBodySchema = exports.SmsWorkflowCreateBodySchema = exports.SmsWorkflowListQuerySchema = exports.SmsWorkflowSectionSchema = exports.PmInvestigationStatusSchema = exports.PmCorrectiveActionStatusSchema = exports.PmInspectionStatusSchema = exports.JhaFlhaStatusSchema = exports.SmsWorkflowEntitySchema = void 0;
const zod_1 = require("zod");
/** Unified SMS workflow entity slugs (`/api/v1/pm/sms/workflows/:entity`). */
exports.SmsWorkflowEntitySchema = zod_1.z.enum([
    'flha',
    'jha',
    'inspection',
    'audit',
    'corrective-action',
    'investigation',
]);
exports.JhaFlhaStatusSchema = zod_1.z.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'LOCKED',
    'REJECTED',
]);
exports.PmInspectionStatusSchema = zod_1.z.enum([
    'draft',
    'in_progress',
    'submitted',
    'review_required',
    'approved',
    'rejected',
    'closed',
]);
exports.PmCorrectiveActionStatusSchema = zod_1.z.enum([
    'draft',
    'open',
    'assigned',
    'in_progress',
    'verification_pending',
    'verified',
    'closed',
    'cancelled',
]);
exports.PmInvestigationStatusSchema = zod_1.z.enum([
    'not_started',
    'evidence_gathering',
    'analysis',
    'root_cause',
    'capa_planning',
    'review',
    'closed',
]);
exports.SmsWorkflowSectionSchema = zod_1.z.enum([
    'overview',
    'hazards',
    'findings',
    'controls',
    'actions',
    'signatures',
    'attachments',
]);
exports.SmsWorkflowListQuerySchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive().optional(),
    projectId: zod_1.z.coerce.number().int().positive().optional(),
    status: zod_1.z.string().optional(),
    kind: zod_1.z.string().optional(),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(200).optional(),
});
exports.SmsWorkflowCreateBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    projectId: zod_1.z.number().int().positive(),
    clientSyncId: zod_1.z.string().max(128).optional(),
    /** FLHA / JHA */
    kind: zod_1.z.enum(['FLHA', 'JHA']).optional(),
    taskDescription: zod_1.z.string().min(1).max(4000).optional(),
    workScope: zod_1.z.string().max(8000).optional(),
    locationNote: zod_1.z.string().max(2000).optional(),
    /** Inspection / audit */
    templateId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().max(500).optional(),
    siteId: zod_1.z.coerce.number().int().optional(),
    equipmentId: zod_1.z.coerce.number().int().optional(),
    workerId: zod_1.z.coerce.number().int().optional(),
    /** Corrective action */
    sourceModule: zod_1.z.string().max(64).optional(),
    sourceId: zod_1.z.string().max(128).optional(),
    description: zod_1.z.string().max(8000).optional(),
    actionType: zod_1.z.string().max(64).optional(),
    severity: zod_1.z.string().max(32).optional(),
    assignUserId: zod_1.z.coerce.number().int().optional(),
    publish: zod_1.z.boolean().optional(),
    /** Investigation (requires parent incident event) */
    eventId: zod_1.z.string().uuid().optional(),
    leadInvestigatorId: zod_1.z.coerce.number().int().optional(),
});
exports.SmsWorkflowUpdateBodySchema = zod_1.z.object({
    overview: zod_1.z.record(zod_1.z.unknown()).optional(),
    hazards: zod_1.z.array(zod_1.z.unknown()).optional(),
    findings: zod_1.z.array(zod_1.z.unknown()).optional(),
    controls: zod_1.z.array(zod_1.z.unknown()).optional(),
    actions: zod_1.z.array(zod_1.z.unknown()).optional(),
    signatures: zod_1.z.array(zod_1.z.unknown()).optional(),
    attachments: zod_1.z.array(zod_1.z.unknown()).optional(),
    answers: zod_1.z.record(zod_1.z.unknown()).optional(),
    taskDescription: zod_1.z.string().max(4000).optional(),
    workScope: zod_1.z.string().max(8000).optional(),
    locationNote: zod_1.z.string().max(2000).optional(),
    environmentalJson: zod_1.z.record(zod_1.z.unknown()).optional(),
    title: zod_1.z.string().max(500).optional(),
    narrative: zod_1.z.string().max(16000).optional(),
    immediateActions: zod_1.z.string().max(8000).optional(),
    status: zod_1.z.string().max(64).optional(),
    currentStep: zod_1.z.coerce.number().int().min(0).optional(),
    guidedAnswersJson: zod_1.z.record(zod_1.z.unknown()).optional(),
});
