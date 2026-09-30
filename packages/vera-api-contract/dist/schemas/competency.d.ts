import { z } from 'zod';
export declare const EvaluateCompetencyBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    equipmentId: z.ZodNumber;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    evaluationDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    evidenceNotes: z.ZodOptional<z.ZodString>;
    evidencePhotos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workerSignature: z.ZodOptional<z.ZodString>;
    evaluatorSignature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    equipmentId: number;
    passed: boolean;
    score: number;
    notes?: string | undefined;
    evaluationDate?: string | undefined;
    evidenceNotes?: string | undefined;
    evidencePhotos?: string[] | undefined;
    workerSignature?: string | undefined;
    evaluatorSignature?: string | undefined;
}, {
    workerId: number;
    equipmentId: number;
    passed: boolean;
    score: number;
    notes?: string | undefined;
    evaluationDate?: string | undefined;
    evidenceNotes?: string | undefined;
    evidencePhotos?: string[] | undefined;
    workerSignature?: string | undefined;
    evaluatorSignature?: string | undefined;
}>;
export declare const CompetencyEvaluationResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    workerId: z.ZodNumber;
    equipmentId: z.ZodNumber;
    evaluatorUserId: z.ZodNullable<z.ZodNumber>;
    equipmentTypeKey: z.ZodString;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    evaluationDate: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    workerSignature: z.ZodNullable<z.ZodString>;
    evaluatorSignature: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    workerId: number;
    createdAt: string;
    equipmentId: number;
    passed: boolean;
    notes: string | null;
    score: number;
    evaluationDate: string;
    workerSignature: string | null;
    evaluatorSignature: string | null;
    evaluatorUserId: number | null;
    equipmentTypeKey: string;
    expiresAt: string | null;
}, {
    id: number;
    workerId: number;
    createdAt: string;
    equipmentId: number;
    passed: boolean;
    notes: string | null;
    score: number;
    evaluationDate: string;
    workerSignature: string | null;
    evaluatorSignature: string | null;
    evaluatorUserId: number | null;
    equipmentTypeKey: string;
    expiresAt: string | null;
}>;
export declare const CheckCompetencyBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    equipmentId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    equipmentId: number;
}, {
    workerId: number;
    equipmentId: number;
}>;
export declare const CompetencyCheckResponseSchema: z.ZodObject<{
    eligible: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    requireEvaluation: z.ZodBoolean;
    minPassingScore: z.ZodNumber;
    latestEvaluation: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        passed: z.ZodBoolean;
        score: z.ZodNumber;
        evaluationDate: z.ZodString;
        expiresAt: z.ZodNullable<z.ZodString>;
        expired: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: number;
        passed: boolean;
        score: number;
        evaluationDate: string;
        expiresAt: string | null;
        expired: boolean;
    }, {
        id: number;
        passed: boolean;
        score: number;
        evaluationDate: string;
        expiresAt: string | null;
        expired: boolean;
    }>>;
    rules: z.ZodObject<{
        minPassingScore: z.ZodNumber;
        expiryDays: z.ZodNullable<z.ZodNumber>;
        requireEvaluation: z.ZodBoolean;
        source: z.ZodEnum<["equipment", "type", "default"]>;
        certificationId: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requireEvaluation: boolean;
        minPassingScore: number;
        expiryDays: number | null;
        source: "type" | "equipment" | "default";
        certificationId: number | null;
    }, {
        requireEvaluation: boolean;
        minPassingScore: number;
        expiryDays: number | null;
        source: "type" | "equipment" | "default";
        certificationId: number | null;
    }>;
}, "strip", z.ZodTypeAny, {
    eligible: boolean;
    requireEvaluation: boolean;
    minPassingScore: number;
    rules: {
        requireEvaluation: boolean;
        minPassingScore: number;
        expiryDays: number | null;
        source: "type" | "equipment" | "default";
        certificationId: number | null;
    };
    reason?: string | undefined;
    latestEvaluation?: {
        id: number;
        passed: boolean;
        score: number;
        evaluationDate: string;
        expiresAt: string | null;
        expired: boolean;
    } | undefined;
}, {
    eligible: boolean;
    requireEvaluation: boolean;
    minPassingScore: number;
    rules: {
        requireEvaluation: boolean;
        minPassingScore: number;
        expiryDays: number | null;
        source: "type" | "equipment" | "default";
        certificationId: number | null;
    };
    reason?: string | undefined;
    latestEvaluation?: {
        id: number;
        passed: boolean;
        score: number;
        evaluationDate: string;
        expiresAt: string | null;
        expired: boolean;
    } | undefined;
}>;
export declare const UpsertCompetencyRequirementBodySchema: z.ZodObject<{
    minPassingScore: z.ZodOptional<z.ZodNumber>;
    expiryDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    requireEvaluation: z.ZodOptional<z.ZodBoolean>;
    certificationId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    requireEvaluation?: boolean | undefined;
    minPassingScore?: number | undefined;
    expiryDays?: number | null | undefined;
    certificationId?: number | null | undefined;
}, {
    requireEvaluation?: boolean | undefined;
    minPassingScore?: number | undefined;
    expiryDays?: number | null | undefined;
    certificationId?: number | null | undefined;
}>;
export declare const CompetencyDashboardSchema: z.ZodObject<{
    totalEvaluations: z.ZodNumber;
    passing: z.ZodNumber;
    expiringSoon: z.ZodNumber;
    expired: z.ZodNumber;
    operatorLinks: z.ZodNumber;
    recent: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    recent: unknown[];
    expired: number;
    totalEvaluations: number;
    passing: number;
    expiringSoon: number;
    operatorLinks: number;
}, {
    recent: unknown[];
    expired: number;
    totalEvaluations: number;
    passing: number;
    expiringSoon: number;
    operatorLinks: number;
}>;
