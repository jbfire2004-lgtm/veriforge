import { z } from 'zod';
export declare const ProviderApprovalStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]>;
export declare const ProviderComplianceLevelSchema: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "PENDING_REVIEW"]>;
export declare const TrainingProviderDashboardSchema: z.ZodObject<{
    provider: z.ZodUnknown;
    stats: z.ZodObject<{
        activeCourses: z.ZodNumber;
        activeInstructors: z.ZodNumber;
        trainingRecordsIssued: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        activeCourses: number;
        activeInstructors: number;
        trainingRecordsIssued: number;
    }, {
        activeCourses: number;
        activeInstructors: number;
        trainingRecordsIssued: number;
    }>;
    compliance: z.ZodNullable<z.ZodUnknown>;
    recentRecords: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    stats: {
        activeCourses: number;
        activeInstructors: number;
        trainingRecordsIssued: number;
    };
    recentRecords: unknown[];
    compliance?: unknown;
    provider?: unknown;
}, {
    stats: {
        activeCourses: number;
        activeInstructors: number;
        trainingRecordsIssued: number;
    };
    recentRecords: unknown[];
    compliance?: unknown;
    provider?: unknown;
}>;
export declare const CreateTrainingProviderBodySchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    address?: string | undefined;
}, {
    name: string;
    code?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    address?: string | undefined;
}>;
export declare const CourseStandardBodySchema: z.ZodObject<{
    standardKey: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
    minScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    standardKey: string;
    required?: boolean | undefined;
    description?: string | undefined;
    minScore?: number | undefined;
}, {
    title: string;
    standardKey: string;
    required?: boolean | undefined;
    description?: string | undefined;
    minScore?: number | undefined;
}>;
export declare const AddCourseBodySchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    certificationId: z.ZodOptional<z.ZodNumber>;
    durationHours: z.ZodOptional<z.ZodNumber>;
    validityDays: z.ZodOptional<z.ZodNumber>;
    contentText: z.ZodOptional<z.ZodString>;
    standards: z.ZodOptional<z.ZodArray<z.ZodObject<{
        standardKey: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
        minScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        standardKey: string;
        required?: boolean | undefined;
        description?: string | undefined;
        minScore?: number | undefined;
    }, {
        title: string;
        standardKey: string;
        required?: boolean | undefined;
        description?: string | undefined;
        minScore?: number | undefined;
    }>, "many">>;
    instructorIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    certificationId?: number | undefined;
    description?: string | undefined;
    durationHours?: number | undefined;
    validityDays?: number | undefined;
    contentText?: string | undefined;
    standards?: {
        title: string;
        standardKey: string;
        required?: boolean | undefined;
        description?: string | undefined;
        minScore?: number | undefined;
    }[] | undefined;
    instructorIds?: number[] | undefined;
}, {
    code: string;
    name: string;
    certificationId?: number | undefined;
    description?: string | undefined;
    durationHours?: number | undefined;
    validityDays?: number | undefined;
    contentText?: string | undefined;
    standards?: {
        title: string;
        standardKey: string;
        required?: boolean | undefined;
        description?: string | undefined;
        minScore?: number | undefined;
    }[] | undefined;
    instructorIds?: number[] | undefined;
}>;
export declare const AddCourseResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    providerId: z.ZodNumber;
    code: z.ZodString;
    name: z.ZodString;
    standards: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: number;
    name: string;
    providerId: number;
    standards?: unknown[] | undefined;
}, {
    code: string;
    id: number;
    name: string;
    providerId: number;
    standards?: unknown[] | undefined;
}>;
export declare const AddInstructorBodySchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    qualifiedCourseCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    qualificationExpiresAt: z.ZodOptional<z.ZodString>;
    courseIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email?: string | undefined;
    licenseNumber?: string | undefined;
    qualifiedCourseCodes?: string[] | undefined;
    qualificationExpiresAt?: string | undefined;
    courseIds?: number[] | undefined;
}, {
    firstName: string;
    lastName: string;
    email?: string | undefined;
    licenseNumber?: string | undefined;
    qualifiedCourseCodes?: string[] | undefined;
    qualificationExpiresAt?: string | undefined;
    courseIds?: number[] | undefined;
}>;
export declare const AddInstructorResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    providerId: z.ZodNumber;
    firstName: z.ZodString;
    lastName: z.ZodString;
    qualificationStatus: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    id: number;
    providerId: number;
    qualificationStatus: string;
}, {
    firstName: string;
    lastName: string;
    id: number;
    providerId: number;
    qualificationStatus: string;
}>;
export declare const UploadTrainingBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    courseId: z.ZodNumber;
    instructorId: z.ZodOptional<z.ZodNumber>;
    companyId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodOptional<z.ZodNumber>;
    equipmentId: z.ZodOptional<z.ZodNumber>;
    issuedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    courseId: number;
    companyId?: number | undefined;
    projectId?: number | undefined;
    equipmentId?: number | undefined;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    instructorId?: number | undefined;
}, {
    workerId: number;
    courseId: number;
    companyId?: number | undefined;
    projectId?: number | undefined;
    equipmentId?: number | undefined;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    instructorId?: number | undefined;
}>;
export declare const UploadTrainingResponseSchema: z.ZodObject<{
    record: z.ZodUnknown;
    verificationPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    verificationPath: string;
    record?: unknown;
}, {
    verificationPath: string;
    record?: unknown;
}>;
export declare const IssueCertificateBodySchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    certificateUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId: number;
    certificateUrl?: string | undefined;
}, {
    trainingRecordId: number;
    certificateUrl?: string | undefined;
}>;
export declare const IssueCertificateResponseSchema: z.ZodObject<{
    digitalCertificate: z.ZodNullable<z.ZodObject<{
        recordId: z.ZodNumber;
        workerId: z.ZodNumber;
        workerName: z.ZodString;
        certificationName: z.ZodString;
        courseName: z.ZodOptional<z.ZodString>;
        providerName: z.ZodString;
        issuedAt: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodString>;
        certificateNumber: z.ZodOptional<z.ZodString>;
        verificationUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workerId: number;
        issuedAt: string;
        workerName: string;
        recordId: number;
        certificationName: string;
        providerName: string;
        verificationUrl: string;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        courseName?: string | undefined;
    }, {
        workerId: number;
        issuedAt: string;
        workerName: string;
        recordId: number;
        certificationName: string;
        providerName: string;
        verificationUrl: string;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        courseName?: string | undefined;
    }>>;
    qrDataUrl: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    digitalCertificate: {
        workerId: number;
        issuedAt: string;
        workerName: string;
        recordId: number;
        certificationName: string;
        providerName: string;
        verificationUrl: string;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        courseName?: string | undefined;
    } | null;
    qrDataUrl: string | null;
}, {
    digitalCertificate: {
        workerId: number;
        issuedAt: string;
        workerName: string;
        recordId: number;
        certificationName: string;
        providerName: string;
        verificationUrl: string;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        courseName?: string | undefined;
    } | null;
    qrDataUrl: string | null;
}>;
export declare const ValidateCertificateResponseSchema: z.ZodObject<{
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
        issuedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
    }, {
        id: number;
        workerId: number;
        issuedAt: Date;
        workerName: string;
        certification: string;
        expiresAt?: Date | null | undefined;
        provider?: string | null | undefined;
        course?: string | null | undefined;
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
        provider?: string | null | undefined;
        course?: string | null | undefined;
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
        provider?: string | null | undefined;
        course?: string | null | undefined;
    } | undefined;
}>;
export declare const ProviderComplianceResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    providerId: z.ZodNumber;
    status: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "PENDING_REVIEW"]>;
    score: z.ZodNullable<z.ZodNumber>;
    gaps: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodUnknown]>>;
    assessedAt: z.ZodDate;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW";
    id: number;
    score: number | null;
    providerId: number;
    assessedAt: Date;
    notes?: string | null | undefined;
    gaps?: unknown;
}, {
    status: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "PENDING_REVIEW";
    id: number;
    score: number | null;
    providerId: number;
    assessedAt: Date;
    notes?: string | null | undefined;
    gaps?: unknown;
}>;
export declare const ProviderApprovalBodySchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    notes?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    notes?: string | undefined;
}>;
export declare const ProviderApprovalResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    providerId: z.ZodNumber;
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]>;
    reviewedBy: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    id: number;
    createdAt: Date;
    providerId: number;
    notes?: string | null | undefined;
    reviewedBy?: number | null | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    id: number;
    createdAt: Date;
    providerId: number;
    notes?: string | null | undefined;
    reviewedBy?: number | null | undefined;
}>;
