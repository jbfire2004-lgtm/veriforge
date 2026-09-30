import { z } from 'zod';
/** Enriched training row on worker wallet (provider integration). */
export declare const WalletTrainingRecordSchema: z.ZodObject<{
    id: z.ZodNumber;
    issuedAt: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    certification: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string | null;
        id: number;
        name: string;
    }, {
        code: string | null;
        id: number;
        name: string;
    }>>;
    providerName: z.ZodNullable<z.ZodString>;
    instructorName: z.ZodNullable<z.ZodString>;
    courseName: z.ZodNullable<z.ZodString>;
    courseCode: z.ZodNullable<z.ZodString>;
    courseStandards: z.ZodArray<z.ZodString, "many">;
    jurisdictionCode: z.ZodNullable<z.ZodString>;
    jurisdictionValid: z.ZodNullable<z.ZodBoolean>;
    certificateQrToken: z.ZodNullable<z.ZodString>;
    certificateQrUrl: z.ZodNullable<z.ZodString>;
    certificateNumber: z.ZodNullable<z.ZodString>;
    complianceStatus: z.ZodString;
    companyId: z.ZodNullable<z.ZodNumber>;
    projectId: z.ZodNullable<z.ZodNumber>;
    projectName: z.ZodNullable<z.ZodString>;
    companyName: z.ZodNullable<z.ZodString>;
    verifiedByVeraStatus: z.ZodOptional<z.ZodEnum<["UNVERIFIED", "PENDING", "VERIFIED", "VERIFIED_WITH_NFT"]>>;
    jurisdictionCoverage: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    regulatorySummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nftTokenId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nftChain: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    companyId: number | null;
    id: number;
    projectId: number | null;
    completedAt: string | null;
    expiresAt: string | null;
    complianceStatus: string;
    certificateNumber: string | null;
    issuedAt: string;
    companyName: string | null;
    projectName: string | null;
    courseName: string | null;
    providerName: string | null;
    certification: {
        code: string | null;
        id: number;
        name: string;
    } | null;
    jurisdictionCode: string | null;
    courseCode: string | null;
    certificateQrToken: string | null;
    instructorName: string | null;
    courseStandards: string[];
    jurisdictionValid: boolean | null;
    certificateQrUrl: string | null;
    jurisdictionCoverage?: string[] | undefined;
    verifiedByVeraStatus?: "PENDING" | "UNVERIFIED" | "VERIFIED" | "VERIFIED_WITH_NFT" | undefined;
    regulatorySummary?: string | null | undefined;
    nftTokenId?: string | null | undefined;
    nftChain?: string | null | undefined;
}, {
    companyId: number | null;
    id: number;
    projectId: number | null;
    completedAt: string | null;
    expiresAt: string | null;
    complianceStatus: string;
    certificateNumber: string | null;
    issuedAt: string;
    companyName: string | null;
    projectName: string | null;
    courseName: string | null;
    providerName: string | null;
    certification: {
        code: string | null;
        id: number;
        name: string;
    } | null;
    jurisdictionCode: string | null;
    courseCode: string | null;
    certificateQrToken: string | null;
    instructorName: string | null;
    courseStandards: string[];
    jurisdictionValid: boolean | null;
    certificateQrUrl: string | null;
    jurisdictionCoverage?: string[] | undefined;
    verifiedByVeraStatus?: "PENDING" | "UNVERIFIED" | "VERIFIED" | "VERIFIED_WITH_NFT" | undefined;
    regulatorySummary?: string | null | undefined;
    nftTokenId?: string | null | undefined;
    nftChain?: string | null | undefined;
}>;
export declare const TrainingComplianceBucketSchema: z.ZodEnum<["verified", "pending", "rejected", "expiring"]>;
export declare const TrainingComplianceRowSchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    workerId: z.ZodNumber;
    workerName: z.ZodString;
    courseName: z.ZodString;
    providerName: z.ZodNullable<z.ZodString>;
    issuedAt: z.ZodNullable<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodString>;
    validationOutcome: z.ZodNullable<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>>;
    projectId: z.ZodNullable<z.ZodNumber>;
    projectName: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: number | null;
    workerId: number;
    expiresAt: string | null;
    issuedAt: string | null;
    workerName: string;
    projectName: string | null;
    trainingRecordId: number;
    courseName: string;
    providerName: string | null;
    validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
}, {
    projectId: number | null;
    workerId: number;
    expiresAt: string | null;
    issuedAt: string | null;
    workerName: string;
    projectName: string | null;
    trainingRecordId: number;
    courseName: string;
    providerName: string | null;
    validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
}>;
export declare const CompanyTrainingComplianceDashboardSchema: z.ZodObject<{
    companyId: z.ZodNumber;
    companyName: z.ZodString;
    updatedAt: z.ZodString;
    status: z.ZodEnum<["COMPLIANT", "NON_COMPLIANT"]>;
    counts: z.ZodObject<{
        verified: z.ZodNumber;
        pending: z.ZodNumber;
        rejected: z.ZodNumber;
        expiring: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rejected: number;
        verified: number;
        pending: number;
        expiring: number;
    }, {
        rejected: number;
        verified: number;
        pending: number;
        expiring: number;
    }>;
    records: z.ZodRecord<z.ZodEnum<["verified", "pending", "rejected", "expiring"]>, z.ZodArray<z.ZodObject<{
        trainingRecordId: z.ZodNumber;
        workerId: z.ZodNumber;
        workerName: z.ZodString;
        courseName: z.ZodString;
        providerName: z.ZodNullable<z.ZodString>;
        issuedAt: z.ZodNullable<z.ZodString>;
        expiresAt: z.ZodNullable<z.ZodString>;
        validationOutcome: z.ZodNullable<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>>;
        projectId: z.ZodNullable<z.ZodNumber>;
        projectName: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        projectId: number | null;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string | null;
        workerName: string;
        projectName: string | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
    }, {
        projectId: number | null;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string | null;
        workerName: string;
        projectName: string | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
    }>, "many">>;
    flaggedWorkers: z.ZodArray<z.ZodObject<{
        workerId: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        flags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        workerId: number;
        flags: string[];
    }, {
        firstName: string;
        lastName: string;
        workerId: number;
        flags: string[];
    }>, "many">;
    projects: z.ZodArray<z.ZodObject<{
        projectId: z.ZodNumber;
        projectName: z.ZodString;
        counts: z.ZodObject<{
            verified: z.ZodNumber;
            pending: z.ZodNumber;
            rejected: z.ZodNumber;
            expiring: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        }, {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        }>;
        flaggedWorkerCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        projectId: number;
        projectName: string;
        counts: {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        };
        flaggedWorkerCount: number;
    }, {
        projectId: number;
        projectName: string;
        counts: {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        };
        flaggedWorkerCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "COMPLIANT" | "NON_COMPLIANT";
    companyId: number;
    updatedAt: string;
    projects: {
        projectId: number;
        projectName: string;
        counts: {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        };
        flaggedWorkerCount: number;
    }[];
    companyName: string;
    counts: {
        rejected: number;
        verified: number;
        pending: number;
        expiring: number;
    };
    records: Partial<Record<"rejected" | "verified" | "pending" | "expiring", {
        projectId: number | null;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string | null;
        workerName: string;
        projectName: string | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
    }[]>>;
    flaggedWorkers: {
        firstName: string;
        lastName: string;
        workerId: number;
        flags: string[];
    }[];
}, {
    status: "COMPLIANT" | "NON_COMPLIANT";
    companyId: number;
    updatedAt: string;
    projects: {
        projectId: number;
        projectName: string;
        counts: {
            rejected: number;
            verified: number;
            pending: number;
            expiring: number;
        };
        flaggedWorkerCount: number;
    }[];
    companyName: string;
    counts: {
        rejected: number;
        verified: number;
        pending: number;
        expiring: number;
    };
    records: Partial<Record<"rejected" | "verified" | "pending" | "expiring", {
        projectId: number | null;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string | null;
        workerName: string;
        projectName: string | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        validationOutcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | null;
    }[]>>;
    flaggedWorkers: {
        firstName: string;
        lastName: string;
        workerId: number;
        flags: string[];
    }[];
}>;
export declare const UnionHallTrainingReceiptSchema: z.ZodObject<{
    receiptId: z.ZodNumber;
    status: z.ZodString;
    trainingRecordId: z.ZodNumber;
    workerId: z.ZodNumber;
    workerName: z.ZodString;
    courseName: z.ZodString;
    providerName: z.ZodNullable<z.ZodString>;
    providerId: z.ZodNullable<z.ZodNumber>;
    instructorName: z.ZodNullable<z.ZodString>;
    instructorQualificationStatus: z.ZodNullable<z.ZodString>;
    issuedAt: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodString>;
    validationOutcome: z.ZodNullable<z.ZodString>;
    certificateQrToken: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    workerId: number;
    expiresAt: string | null;
    issuedAt: string;
    workerName: string;
    providerId: number | null;
    trainingRecordId: number;
    courseName: string;
    providerName: string | null;
    certificateQrToken: string | null;
    instructorName: string | null;
    validationOutcome: string | null;
    receiptId: number;
    instructorQualificationStatus: string | null;
}, {
    status: string;
    workerId: number;
    expiresAt: string | null;
    issuedAt: string;
    workerName: string;
    providerId: number | null;
    trainingRecordId: number;
    courseName: string;
    providerName: string | null;
    certificateQrToken: string | null;
    instructorName: string | null;
    validationOutcome: string | null;
    receiptId: number;
    instructorQualificationStatus: string | null;
}>;
export declare const UnionHallProviderSummarySchema: z.ZodObject<{
    providerId: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    approvalStatus: z.ZodString;
    active: z.ZodBoolean;
    complianceStatus: z.ZodNullable<z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "PENDING_REVIEW"]>>;
    complianceScore: z.ZodNullable<z.ZodNumber>;
    complianceAssessedAt: z.ZodNullable<z.ZodString>;
    gaps: z.ZodNullable<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    code: string | null;
    name: string;
    active: boolean;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
    providerId: number;
    complianceScore: number | null;
    approvalStatus: string;
    complianceAssessedAt: string | null;
    gaps?: unknown;
}, {
    code: string | null;
    name: string;
    active: boolean;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
    providerId: number;
    complianceScore: number | null;
    approvalStatus: string;
    complianceAssessedAt: string | null;
    gaps?: unknown;
}>;
export declare const UnionHallTrainingDashboardSchema: z.ZodObject<{
    unionHallId: z.ZodNumber;
    unionHallName: z.ZodString;
    counts: z.ZodObject<{
        pending: z.ZodNumber;
        accepted: z.ZodNumber;
        pushed: z.ZodNumber;
        rejected: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rejected: number;
        pending: number;
        accepted: number;
        pushed: number;
    }, {
        rejected: number;
        pending: number;
        accepted: number;
        pushed: number;
    }>;
    providerTrainingHistory: z.ZodArray<z.ZodObject<{
        receiptId: z.ZodNumber;
        status: z.ZodString;
        trainingRecordId: z.ZodNumber;
        workerId: z.ZodNumber;
        workerName: z.ZodString;
        courseName: z.ZodString;
        providerName: z.ZodNullable<z.ZodString>;
        providerId: z.ZodNullable<z.ZodNumber>;
        instructorName: z.ZodNullable<z.ZodString>;
        instructorQualificationStatus: z.ZodNullable<z.ZodString>;
        issuedAt: z.ZodString;
        expiresAt: z.ZodNullable<z.ZodString>;
        validationOutcome: z.ZodNullable<z.ZodString>;
        certificateQrToken: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string;
        workerName: string;
        providerId: number | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        certificateQrToken: string | null;
        instructorName: string | null;
        validationOutcome: string | null;
        receiptId: number;
        instructorQualificationStatus: string | null;
    }, {
        status: string;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string;
        workerName: string;
        providerId: number | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        certificateQrToken: string | null;
        instructorName: string | null;
        validationOutcome: string | null;
        receiptId: number;
        instructorQualificationStatus: string | null;
    }>, "many">;
    providers: z.ZodArray<z.ZodObject<{
        providerId: z.ZodNumber;
        name: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        approvalStatus: z.ZodString;
        active: z.ZodBoolean;
        complianceStatus: z.ZodNullable<z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "PENDING_REVIEW"]>>;
        complianceScore: z.ZodNullable<z.ZodNumber>;
        complianceAssessedAt: z.ZodNullable<z.ZodString>;
        gaps: z.ZodNullable<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string | null;
        name: string;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
        providerId: number;
        complianceScore: number | null;
        approvalStatus: string;
        complianceAssessedAt: string | null;
        gaps?: unknown;
    }, {
        code: string | null;
        name: string;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
        providerId: number;
        complianceScore: number | null;
        approvalStatus: string;
        complianceAssessedAt: string | null;
        gaps?: unknown;
    }>, "many">;
    instructors: z.ZodArray<z.ZodObject<{
        instructorId: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        providerId: z.ZodNumber;
        providerName: z.ZodString;
        qualificationStatus: z.ZodString;
        qualificationExpiresAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        providerId: number;
        qualificationExpiresAt: string | null;
        qualificationStatus: string;
        instructorId: number;
        providerName: string;
    }, {
        firstName: string;
        lastName: string;
        providerId: number;
        qualificationExpiresAt: string | null;
        qualificationStatus: string;
        instructorId: number;
        providerName: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    unionHallId: number;
    unionHallName: string;
    counts: {
        rejected: number;
        pending: number;
        accepted: number;
        pushed: number;
    };
    providerTrainingHistory: {
        status: string;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string;
        workerName: string;
        providerId: number | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        certificateQrToken: string | null;
        instructorName: string | null;
        validationOutcome: string | null;
        receiptId: number;
        instructorQualificationStatus: string | null;
    }[];
    providers: {
        code: string | null;
        name: string;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
        providerId: number;
        complianceScore: number | null;
        approvalStatus: string;
        complianceAssessedAt: string | null;
        gaps?: unknown;
    }[];
    instructors: {
        firstName: string;
        lastName: string;
        providerId: number;
        qualificationExpiresAt: string | null;
        qualificationStatus: string;
        instructorId: number;
        providerName: string;
    }[];
}, {
    unionHallId: number;
    unionHallName: string;
    counts: {
        rejected: number;
        pending: number;
        accepted: number;
        pushed: number;
    };
    providerTrainingHistory: {
        status: string;
        workerId: number;
        expiresAt: string | null;
        issuedAt: string;
        workerName: string;
        providerId: number | null;
        trainingRecordId: number;
        courseName: string;
        providerName: string | null;
        certificateQrToken: string | null;
        instructorName: string | null;
        validationOutcome: string | null;
        receiptId: number;
        instructorQualificationStatus: string | null;
    }[];
    providers: {
        code: string | null;
        name: string;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW" | null;
        providerId: number;
        complianceScore: number | null;
        approvalStatus: string;
        complianceAssessedAt: string | null;
        gaps?: unknown;
    }[];
    instructors: {
        firstName: string;
        lastName: string;
        providerId: number;
        qualificationExpiresAt: string | null;
        qualificationStatus: string;
        instructorId: number;
        providerName: string;
    }[];
}>;
export declare const EquipmentTrainingRequirementSchema: z.ZodObject<{
    certification: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        code?: string | null | undefined;
    }, {
        id: number;
        name: string;
        code?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    certification: {
        id: number;
        name: string;
        code?: string | null | undefined;
    };
}, {
    certification: {
        id: number;
        name: string;
        code?: string | null | undefined;
    };
}>;
export declare const ValidateCertificatePublicResponseSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    expired: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    record: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        workerId: z.ZodNumber;
        workerName: z.ZodString;
        certification: z.ZodString;
        course: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        instructor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        issuedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        certificateNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        certificateNumber?: string | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
        instructor?: string | null | undefined;
    }, {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        certificateNumber?: string | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
        instructor?: string | null | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    reason?: string | undefined;
    expired?: boolean | undefined;
    record?: {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        certificateNumber?: string | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
        instructor?: string | null | undefined;
    } | undefined;
}, {
    valid: boolean;
    reason?: string | undefined;
    expired?: boolean | undefined;
    record?: {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        certificateNumber?: string | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
        instructor?: string | null | undefined;
    } | undefined;
}>;
