"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCertificatePublicResponseSchema = exports.EquipmentTrainingRequirementSchema = exports.UnionHallTrainingDashboardSchema = exports.UnionHallProviderSummarySchema = exports.UnionHallTrainingReceiptSchema = exports.CompanyTrainingComplianceDashboardSchema = exports.TrainingComplianceRowSchema = exports.TrainingComplianceBucketSchema = exports.WalletTrainingRecordSchema = void 0;
const zod_1 = require("zod");
const training_standards_1 = require("./training-standards");
const training_provider_1 = require("./training-provider");
/** Enriched training row on worker wallet (provider integration). */
exports.WalletTrainingRecordSchema = zod_1.z.object({
    id: zod_1.z.number(),
    issuedAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime().nullable(),
    completedAt: zod_1.z.string().datetime().nullable(),
    certification: zod_1.z
        .object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        code: zod_1.z.string().nullable(),
    })
        .nullable(),
    providerName: zod_1.z.string().nullable(),
    instructorName: zod_1.z.string().nullable(),
    courseName: zod_1.z.string().nullable(),
    courseCode: zod_1.z.string().nullable(),
    courseStandards: zod_1.z.array(zod_1.z.string()),
    jurisdictionCode: zod_1.z.string().nullable(),
    jurisdictionValid: zod_1.z.boolean().nullable(),
    certificateQrToken: zod_1.z.string().nullable(),
    certificateQrUrl: zod_1.z.string().nullable(),
    certificateNumber: zod_1.z.string().nullable(),
    complianceStatus: zod_1.z.string(),
    companyId: zod_1.z.number().nullable(),
    projectId: zod_1.z.number().nullable(),
    projectName: zod_1.z.string().nullable(),
    companyName: zod_1.z.string().nullable(),
    verifiedByVeraStatus: zod_1.z
        .enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'VERIFIED_WITH_NFT'])
        .optional(),
    jurisdictionCoverage: zod_1.z.array(zod_1.z.string()).optional(),
    regulatorySummary: zod_1.z.string().nullable().optional(),
    nftTokenId: zod_1.z.string().nullable().optional(),
    nftChain: zod_1.z.string().nullable().optional(),
});
exports.TrainingComplianceBucketSchema = zod_1.z.enum([
    'verified',
    'pending',
    'rejected',
    'expiring',
]);
exports.TrainingComplianceRowSchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number(),
    workerId: zod_1.z.number(),
    workerName: zod_1.z.string(),
    courseName: zod_1.z.string(),
    providerName: zod_1.z.string().nullable(),
    issuedAt: zod_1.z.string().nullable(),
    expiresAt: zod_1.z.string().nullable(),
    validationOutcome: training_standards_1.TrainingValidationOutcomeSchema.nullable(),
    projectId: zod_1.z.number().nullable(),
    projectName: zod_1.z.string().nullable(),
});
exports.CompanyTrainingComplianceDashboardSchema = zod_1.z.object({
    companyId: zod_1.z.number(),
    companyName: zod_1.z.string(),
    updatedAt: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['COMPLIANT', 'NON_COMPLIANT']),
    counts: zod_1.z.object({
        verified: zod_1.z.number(),
        pending: zod_1.z.number(),
        rejected: zod_1.z.number(),
        expiring: zod_1.z.number(),
    }),
    records: zod_1.z.record(exports.TrainingComplianceBucketSchema, zod_1.z.array(exports.TrainingComplianceRowSchema)),
    flaggedWorkers: zod_1.z.array(zod_1.z.object({
        workerId: zod_1.z.number(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        flags: zod_1.z.array(zod_1.z.string()),
    })),
    projects: zod_1.z.array(zod_1.z.object({
        projectId: zod_1.z.number(),
        projectName: zod_1.z.string(),
        counts: zod_1.z.object({
            verified: zod_1.z.number(),
            pending: zod_1.z.number(),
            rejected: zod_1.z.number(),
            expiring: zod_1.z.number(),
        }),
        flaggedWorkerCount: zod_1.z.number(),
    })),
});
exports.UnionHallTrainingReceiptSchema = zod_1.z.object({
    receiptId: zod_1.z.number(),
    status: zod_1.z.string(),
    trainingRecordId: zod_1.z.number(),
    workerId: zod_1.z.number(),
    workerName: zod_1.z.string(),
    courseName: zod_1.z.string(),
    providerName: zod_1.z.string().nullable(),
    providerId: zod_1.z.number().nullable(),
    instructorName: zod_1.z.string().nullable(),
    instructorQualificationStatus: zod_1.z.string().nullable(),
    issuedAt: zod_1.z.string(),
    expiresAt: zod_1.z.string().nullable(),
    validationOutcome: zod_1.z.string().nullable(),
    certificateQrToken: zod_1.z.string().nullable(),
});
exports.UnionHallProviderSummarySchema = zod_1.z.object({
    providerId: zod_1.z.number(),
    name: zod_1.z.string(),
    code: zod_1.z.string().nullable(),
    approvalStatus: zod_1.z.string(),
    active: zod_1.z.boolean(),
    complianceStatus: training_provider_1.ProviderComplianceLevelSchema.nullable(),
    complianceScore: zod_1.z.number().nullable(),
    complianceAssessedAt: zod_1.z.string().datetime().nullable(),
    gaps: zod_1.z.unknown().nullable(),
});
exports.UnionHallTrainingDashboardSchema = zod_1.z.object({
    unionHallId: zod_1.z.number(),
    unionHallName: zod_1.z.string(),
    counts: zod_1.z.object({
        pending: zod_1.z.number(),
        accepted: zod_1.z.number(),
        pushed: zod_1.z.number(),
        rejected: zod_1.z.number(),
    }),
    providerTrainingHistory: zod_1.z.array(exports.UnionHallTrainingReceiptSchema),
    providers: zod_1.z.array(exports.UnionHallProviderSummarySchema),
    instructors: zod_1.z.array(zod_1.z.object({
        instructorId: zod_1.z.number(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        providerId: zod_1.z.number(),
        providerName: zod_1.z.string(),
        qualificationStatus: zod_1.z.string(),
        qualificationExpiresAt: zod_1.z.string().nullable(),
    })),
});
exports.EquipmentTrainingRequirementSchema = zod_1.z.object({
    certification: zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        code: zod_1.z.string().nullable().optional(),
    }),
});
exports.ValidateCertificatePublicResponseSchema = zod_1.z.object({
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
        instructor: zod_1.z.string().nullable().optional(),
        issuedAt: zod_1.z.coerce.date(),
        expiresAt: zod_1.z.coerce.date().nullable().optional(),
        certificateNumber: zod_1.z.string().nullable().optional(),
    })
        .optional(),
});
