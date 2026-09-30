import { z } from 'zod';
export declare const TrainingValidationOutcomeSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>;
export declare const ValidationIssueSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    code: string;
}, {
    message: string;
    code: string;
}>;
export declare const ValidationReportSchema: z.ZodObject<{
    outcome: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>;
    score: z.ZodNumber;
    jurisdictionCode: z.ZodString;
    matchedStandardCodes: z.ZodArray<z.ZodString, "many">;
    missingStandardCodes: z.ZodArray<z.ZodString, "many">;
    issues: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code: string;
    }, {
        message: string;
        code: string;
    }>, "many">;
    validationResultId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    issues: {
        message: string;
        code: string;
    }[];
    score: number;
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    jurisdictionCode: string;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    validationResultId?: number | undefined;
}, {
    issues: {
        message: string;
        code: string;
    }[];
    score: number;
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    jurisdictionCode: string;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    validationResultId?: number | undefined;
}>;
export declare const ValidateTrainingBodySchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    jurisdictionCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId: number;
    jurisdictionCode?: string | undefined;
}, {
    trainingRecordId: number;
    jurisdictionCode?: string | undefined;
}>;
export declare const ValidateProviderBodySchema: z.ZodObject<{
    trainingProviderId: z.ZodNumber;
    jurisdictionCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingProviderId: number;
    jurisdictionCode?: string | undefined;
}, {
    trainingProviderId: number;
    jurisdictionCode?: string | undefined;
}>;
export declare const ValidateInstructorBodySchema: z.ZodObject<{
    instructorId: z.ZodNumber;
    courseCode: z.ZodOptional<z.ZodString>;
    jurisdictionCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    instructorId: number;
    jurisdictionCode?: string | undefined;
    courseCode?: string | undefined;
}, {
    instructorId: number;
    jurisdictionCode?: string | undefined;
    courseCode?: string | undefined;
}>;
export declare const ValidateCertificateBodySchema: z.ZodObject<{
    certificateQrToken: z.ZodOptional<z.ZodString>;
    trainingRecordId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId?: number | undefined;
    certificateQrToken?: string | undefined;
}, {
    trainingRecordId?: number | undefined;
    certificateQrToken?: string | undefined;
}>;
export declare const TrainingStandardsDashboardSchema: z.ZodObject<{
    pending: z.ZodNumber;
    approved: z.ZodNumber;
    rejected: z.ZodNumber;
    needsReview: z.ZodNumber;
    recent: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    recent: unknown[];
    approved: number;
    rejected: number;
    pending: number;
    needsReview: number;
}, {
    recent: unknown[];
    approved: number;
    rejected: number;
    pending: number;
    needsReview: number;
}>;
export declare const ApprovalWorkflowBodySchema: z.ZodObject<{
    validationResultId: z.ZodNumber;
    outcome: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    validationResultId: number;
    notes?: string | undefined;
}, {
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    validationResultId: number;
    notes?: string | undefined;
}>;
export declare const RejectionWorkflowBodySchema: z.ZodObject<{
    validationResultId: z.ZodNumber;
    rejectionCodes: z.ZodArray<z.ZodString, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    validationResultId: number;
    rejectionCodes: string[];
    notes?: string | undefined;
}, {
    validationResultId: number;
    rejectionCodes: string[];
    notes?: string | undefined;
}>;
export declare const TrainingValidationResultSchema: z.ZodObject<{
    id: z.ZodNumber;
    subjectType: z.ZodString;
    outcome: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>;
    score: z.ZodNullable<z.ZodNumber>;
    jurisdictionCode: z.ZodNullable<z.ZodString>;
    matchedStandardCodes: z.ZodArray<z.ZodString, "many">;
    missingStandardCodes: z.ZodArray<z.ZodString, "many">;
    validatedAt: z.ZodDate;
    rejections: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    score: number | null;
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    jurisdictionCode: string | null;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    subjectType: string;
    validatedAt: Date;
    rejections?: unknown[] | undefined;
}, {
    id: number;
    score: number | null;
    outcome: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
    jurisdictionCode: string | null;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    subjectType: string;
    validatedAt: Date;
    rejections?: unknown[] | undefined;
}>;
