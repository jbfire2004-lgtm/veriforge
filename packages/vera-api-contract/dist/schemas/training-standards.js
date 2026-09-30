"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingValidationResultSchema = exports.RejectionWorkflowBodySchema = exports.ApprovalWorkflowBodySchema = exports.TrainingStandardsDashboardSchema = exports.ValidateCertificateBodySchema = exports.ValidateInstructorBodySchema = exports.ValidateProviderBodySchema = exports.ValidateTrainingBodySchema = exports.ValidationReportSchema = exports.ValidationIssueSchema = exports.TrainingValidationOutcomeSchema = void 0;
const zod_1 = require("zod");
exports.TrainingValidationOutcomeSchema = zod_1.z.enum([
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_REVIEW',
]);
exports.ValidationIssueSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
});
exports.ValidationReportSchema = zod_1.z.object({
    outcome: exports.TrainingValidationOutcomeSchema,
    score: zod_1.z.number(),
    jurisdictionCode: zod_1.z.string(),
    matchedStandardCodes: zod_1.z.array(zod_1.z.string()),
    missingStandardCodes: zod_1.z.array(zod_1.z.string()),
    issues: zod_1.z.array(exports.ValidationIssueSchema),
    validationResultId: zod_1.z.number().optional(),
});
exports.ValidateTrainingBodySchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number().int(),
    jurisdictionCode: zod_1.z.string().optional(),
});
exports.ValidateProviderBodySchema = zod_1.z.object({
    trainingProviderId: zod_1.z.number().int(),
    jurisdictionCode: zod_1.z.string().optional(),
});
exports.ValidateInstructorBodySchema = zod_1.z.object({
    instructorId: zod_1.z.number().int(),
    courseCode: zod_1.z.string().optional(),
    jurisdictionCode: zod_1.z.string().optional(),
});
exports.ValidateCertificateBodySchema = zod_1.z.object({
    certificateQrToken: zod_1.z.string().optional(),
    trainingRecordId: zod_1.z.number().int().optional(),
});
exports.TrainingStandardsDashboardSchema = zod_1.z.object({
    pending: zod_1.z.number(),
    approved: zod_1.z.number(),
    rejected: zod_1.z.number(),
    needsReview: zod_1.z.number(),
    recent: zod_1.z.array(zod_1.z.unknown()),
});
exports.ApprovalWorkflowBodySchema = zod_1.z.object({
    validationResultId: zod_1.z.number().int(),
    outcome: exports.TrainingValidationOutcomeSchema,
    notes: zod_1.z.string().optional(),
});
exports.RejectionWorkflowBodySchema = zod_1.z.object({
    validationResultId: zod_1.z.number().int(),
    rejectionCodes: zod_1.z.array(zod_1.z.string()),
    notes: zod_1.z.string().optional(),
});
exports.TrainingValidationResultSchema = zod_1.z.object({
    id: zod_1.z.number(),
    subjectType: zod_1.z.string(),
    outcome: exports.TrainingValidationOutcomeSchema,
    score: zod_1.z.number().nullable(),
    jurisdictionCode: zod_1.z.string().nullable(),
    matchedStandardCodes: zod_1.z.array(zod_1.z.string()),
    missingStandardCodes: zod_1.z.array(zod_1.z.string()),
    validatedAt: zod_1.z.coerce.date(),
    rejections: zod_1.z.array(zod_1.z.unknown()).optional(),
});
