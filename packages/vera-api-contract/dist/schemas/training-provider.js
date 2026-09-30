"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderApprovalResponseSchema = exports.ProviderApprovalBodySchema = exports.ProviderComplianceResponseSchema = exports.ValidateCertificateResponseSchema = exports.IssueCertificateResponseSchema = exports.IssueCertificateBodySchema = exports.UploadTrainingResponseSchema = exports.UploadTrainingBodySchema = exports.AddInstructorResponseSchema = exports.AddInstructorBodySchema = exports.AddCourseResponseSchema = exports.AddCourseBodySchema = exports.CourseStandardBodySchema = exports.CreateTrainingProviderBodySchema = exports.TrainingProviderDashboardSchema = exports.ProviderComplianceLevelSchema = exports.ProviderApprovalStatusSchema = void 0;
const zod_1 = require("zod");
exports.ProviderApprovalStatusSchema = zod_1.z.enum([
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED',
]);
exports.ProviderComplianceLevelSchema = zod_1.z.enum([
    'COMPLIANT',
    'NEEDS_ATTENTION',
    'NON_COMPLIANT',
    'PENDING_REVIEW',
]);
exports.TrainingProviderDashboardSchema = zod_1.z.object({
    provider: zod_1.z.unknown(),
    stats: zod_1.z.object({
        activeCourses: zod_1.z.number(),
        activeInstructors: zod_1.z.number(),
        trainingRecordsIssued: zod_1.z.number(),
    }),
    compliance: zod_1.z.unknown().nullable(),
    recentRecords: zod_1.z.array(zod_1.z.unknown()),
});
exports.CreateTrainingProviderBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    code: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    address: zod_1.z.string().optional(),
});
exports.CourseStandardBodySchema = zod_1.z.object({
    standardKey: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    required: zod_1.z.boolean().optional(),
    minScore: zod_1.z.number().int().optional(),
});
exports.AddCourseBodySchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    certificationId: zod_1.z.number().int().optional(),
    durationHours: zod_1.z.number().optional(),
    validityDays: zod_1.z.number().int().optional(),
    contentText: zod_1.z.string().optional(),
    standards: zod_1.z.array(exports.CourseStandardBodySchema).optional(),
    instructorIds: zod_1.z.array(zod_1.z.number().int()).optional(),
});
exports.AddCourseResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    providerId: zod_1.z.number(),
    code: zod_1.z.string(),
    name: zod_1.z.string(),
    standards: zod_1.z.array(zod_1.z.unknown()).optional(),
});
exports.AddInstructorBodySchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    licenseNumber: zod_1.z.string().optional(),
    qualifiedCourseCodes: zod_1.z.array(zod_1.z.string()).optional(),
    qualificationExpiresAt: zod_1.z.string().datetime().optional(),
    courseIds: zod_1.z.array(zod_1.z.number().int()).optional(),
});
exports.AddInstructorResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    providerId: zod_1.z.number(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    qualificationStatus: zod_1.z.string(),
});
exports.UploadTrainingBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int(),
    courseId: zod_1.z.number().int(),
    instructorId: zod_1.z.number().int().optional(),
    companyId: zod_1.z.number().int().optional(),
    projectId: zod_1.z.number().int().optional(),
    equipmentId: zod_1.z.number().int().optional(),
    issuedAt: zod_1.z.string().datetime().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    certificateNumber: zod_1.z.string().optional(),
});
exports.UploadTrainingResponseSchema = zod_1.z.object({
    record: zod_1.z.unknown(),
    verificationPath: zod_1.z.string(),
});
exports.IssueCertificateBodySchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number().int(),
    certificateUrl: zod_1.z.string().url().optional(),
});
exports.IssueCertificateResponseSchema = zod_1.z.object({
    digitalCertificate: zod_1.z.object({
        recordId: zod_1.z.number(),
        workerId: zod_1.z.number(),
        workerName: zod_1.z.string(),
        certificationName: zod_1.z.string(),
        courseName: zod_1.z.string().optional(),
        providerName: zod_1.z.string(),
        issuedAt: zod_1.z.string(),
        expiresAt: zod_1.z.string().optional(),
        certificateNumber: zod_1.z.string().optional(),
        verificationUrl: zod_1.z.string(),
    }).nullable(),
    qrDataUrl: zod_1.z.string().nullable(),
});
exports.ValidateCertificateResponseSchema = zod_1.z.object({
    valid: zod_1.z.boolean(),
    expired: zod_1.z.boolean().optional(),
    reason: zod_1.z.string().optional(),
    record: zod_1.z
        .object({
        id: zod_1.z.number(),
        workerId: zod_1.z.number(),
        workerName: zod_1.z.string(),
        certification: zod_1.z.string(),
        course: zod_1.z.string().nullable().optional(),
        provider: zod_1.z.string().nullable().optional(),
        issuedAt: zod_1.z.coerce.date(),
        expiresAt: zod_1.z.coerce.date().nullable().optional(),
    })
        .optional(),
});
exports.ProviderComplianceResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    providerId: zod_1.z.number(),
    status: exports.ProviderComplianceLevelSchema,
    score: zod_1.z.number().nullable(),
    gaps: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.unknown()]).optional(),
    assessedAt: zod_1.z.coerce.date(),
    notes: zod_1.z.string().nullable().optional(),
});
exports.ProviderApprovalBodySchema = zod_1.z.object({
    status: exports.ProviderApprovalStatusSchema,
    notes: zod_1.z.string().optional(),
});
exports.ProviderApprovalResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    providerId: zod_1.z.number(),
    status: exports.ProviderApprovalStatusSchema,
    reviewedBy: zod_1.z.number().nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.coerce.date(),
});
