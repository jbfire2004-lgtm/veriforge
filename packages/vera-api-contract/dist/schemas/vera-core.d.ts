import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["SUPER_ADMIN", "UNION_HALL_ADMIN", "COMPANY_ADMIN", "ADMIN", "SUPERVISOR", "PROJECT_MANAGER", "WORKER", "TRAINING_PROVIDER_ADMIN", "TRAINING_INSTRUCTOR"]>;
export declare const ProjectStatusSchema: z.ZodEnum<["ACTIVE", "CLOSED"]>;
export declare const AssignmentStatusSchema: z.ZodEnum<["ACTIVE", "REMOVED", "COMPLETED"]>;
export declare const LinkComplianceStatusSchema: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
export declare const CompanyLinkSchema: z.ZodObject<{
    id: z.ZodNumber;
    workerId: z.ZodNumber;
    companyId: z.ZodNumber;
    active: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodNullable<z.ZodString>;
    role: z.ZodNullable<z.ZodString>;
    trade: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    id: number;
    role: string | null;
    trade: string | null;
    workerId: number;
    active: boolean;
    startDate: string;
    endDate: string | null;
}, {
    companyId: number;
    id: number;
    role: string | null;
    trade: string | null;
    workerId: number;
    active: boolean;
    startDate: string;
    endDate: string | null;
}>;
export declare const EquipmentLinkSchema: z.ZodObject<{
    id: z.ZodNumber;
    equipmentId: z.ZodNumber;
    companyId: z.ZodNumber;
    active: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodNullable<z.ZodString>;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    id: number;
    active: boolean;
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    startDate: string;
    endDate: string | null;
}, {
    companyId: number;
    id: number;
    active: boolean;
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    startDate: string;
    endDate: string | null;
}>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodNumber;
    companyId: z.ZodNumber;
    siteId: z.ZodNullable<z.ZodNumber>;
    name: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["ACTIVE", "CLOSED"]>;
    startDate: z.ZodNullable<z.ZodString>;
    endDate: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string | null;
    status: "ACTIVE" | "CLOSED";
    companyId: number;
    id: number;
    name: string;
    siteId: number | null;
    startDate: string | null;
    endDate: string | null;
}, {
    code: string | null;
    status: "ACTIVE" | "CLOSED";
    companyId: number;
    id: number;
    name: string;
    siteId: number | null;
    startDate: string | null;
    endDate: string | null;
}>;
export declare const WorkerWalletSchema: z.ZodObject<{
    type: z.ZodLiteral<"worker">;
    workerId: z.ZodNumber;
    qrToken: z.ZodString;
    qrContent: z.ZodString;
    qrJson: z.ZodObject<{
        type: z.ZodLiteral<"worker">;
        id: z.ZodNumber;
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "worker";
        id: number;
        token: string;
    }, {
        type: "worker";
        id: number;
        token: string;
    }>;
    /** Enriched provider training (GET /api/v1/core/wallets/worker/:id). */
    training: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    companyHistory: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    projectHistory: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    walletItems: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "worker";
    workerId: number;
    qrToken: string;
    qrContent: string;
    qrJson: {
        type: "worker";
        id: number;
        token: string;
    };
    training?: unknown[] | undefined;
    companyHistory?: unknown[] | undefined;
    projectHistory?: unknown[] | undefined;
    walletItems?: unknown[] | undefined;
}, {
    type: "worker";
    workerId: number;
    qrToken: string;
    qrContent: string;
    qrJson: {
        type: "worker";
        id: number;
        token: string;
    };
    training?: unknown[] | undefined;
    companyHistory?: unknown[] | undefined;
    projectHistory?: unknown[] | undefined;
    walletItems?: unknown[] | undefined;
}>;
export declare const EquipmentWalletSchema: z.ZodObject<{
    type: z.ZodLiteral<"equipment">;
    equipmentId: z.ZodNumber;
    qrToken: z.ZodString;
    qrContent: z.ZodString;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    lastInspectionAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextInspectionAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lockoutStatus: z.ZodOptional<z.ZodEnum<["CLEAR", "LOCKED_OUT"]>>;
    competencyRequired: z.ZodOptional<z.ZodBoolean>;
    trainingRequired: z.ZodOptional<z.ZodBoolean>;
    complianceUpdatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lockedOut: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "equipment";
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    qrToken: string;
    lockedOut: boolean;
    qrContent: string;
    lastInspectionAt?: string | null | undefined;
    nextInspectionAt?: string | null | undefined;
    lockoutStatus?: "LOCKED_OUT" | "CLEAR" | undefined;
    competencyRequired?: boolean | undefined;
    trainingRequired?: boolean | undefined;
    complianceUpdatedAt?: string | null | undefined;
}, {
    type: "equipment";
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    qrToken: string;
    lockedOut: boolean;
    qrContent: string;
    lastInspectionAt?: string | null | undefined;
    nextInspectionAt?: string | null | undefined;
    lockoutStatus?: "LOCKED_OUT" | "CLEAR" | undefined;
    competencyRequired?: boolean | undefined;
    trainingRequired?: boolean | undefined;
    complianceUpdatedAt?: string | null | undefined;
}>;
export declare const LinkWorkerBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    companyId: z.ZodNumber;
    role: z.ZodOptional<z.ZodString>;
    trade: z.ZodOptional<z.ZodString>;
    deactivateOtherCompanies: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    workerId: number;
    role?: string | undefined;
    trade?: string | undefined;
    deactivateOtherCompanies?: boolean | undefined;
}, {
    companyId: number;
    workerId: number;
    role?: string | undefined;
    trade?: string | undefined;
    deactivateOtherCompanies?: boolean | undefined;
}>;
export declare const LinkByQrBodySchema: z.ZodObject<{
    qrToken: z.ZodString;
    companyId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    qrToken: string;
}, {
    companyId: number;
    qrToken: string;
}>;
export declare const TrainingIngestBodySchema: z.ZodObject<{
    workerId: z.ZodOptional<z.ZodNumber>;
    workerEmail: z.ZodOptional<z.ZodString>;
    workerPhone: z.ZodOptional<z.ZodString>;
    equipmentId: z.ZodOptional<z.ZodNumber>;
    companyId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodOptional<z.ZodNumber>;
    certificationId: z.ZodNumber;
    providerId: z.ZodOptional<z.ZodNumber>;
    trainingProviderId: z.ZodOptional<z.ZodNumber>;
    courseId: z.ZodOptional<z.ZodNumber>;
    instructorId: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    certificationId: number;
    companyId?: number | undefined;
    projectId?: number | undefined;
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    providerId?: number | undefined;
    courseId?: number | undefined;
    instructorId?: number | undefined;
    trainingProviderId?: number | undefined;
    workerEmail?: string | undefined;
    workerPhone?: string | undefined;
}, {
    certificationId: number;
    companyId?: number | undefined;
    projectId?: number | undefined;
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    providerId?: number | undefined;
    courseId?: number | undefined;
    instructorId?: number | undefined;
    trainingProviderId?: number | undefined;
    workerEmail?: string | undefined;
    workerPhone?: string | undefined;
}>;
export declare const MergeWorkerBodySchema: z.ZodObject<{
    survivorId: z.ZodNumber;
    mergedId: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    survivorId: number;
    mergedId: number;
    reason?: string | undefined;
}, {
    survivorId: number;
    mergedId: number;
    reason?: string | undefined;
}>;
export declare const CreateProjectBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    siteId: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    name: string;
    code?: string | undefined;
    siteId?: number | undefined;
    startDate?: string | undefined;
}, {
    companyId: number;
    name: string;
    code?: string | undefined;
    siteId?: number | undefined;
    startDate?: string | undefined;
}>;
export declare const DispatchWorkerBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    companyId: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    workerId: number;
    notes?: string | undefined;
}, {
    companyId: number;
    workerId: number;
    notes?: string | undefined;
}>;
export declare const CompetencyEvaluateBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    equipmentId: z.ZodNumber;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    evidenceNotes: z.ZodOptional<z.ZodString>;
    evidencePhotos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workerSignature: z.ZodOptional<z.ZodString>;
    evaluatorSignature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    equipmentId: number;
    passed: boolean;
    score: number;
    evidenceNotes?: string | undefined;
    evidencePhotos?: string[] | undefined;
    workerSignature?: string | undefined;
    evaluatorSignature?: string | undefined;
}, {
    workerId: number;
    equipmentId: number;
    passed: boolean;
    score: number;
    evidenceNotes?: string | undefined;
    evidencePhotos?: string[] | undefined;
    workerSignature?: string | undefined;
    evaluatorSignature?: string | undefined;
}>;
export declare const CreateInspectionBodySchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    siteId: z.ZodOptional<z.ZodNumber>;
    kind: z.ZodOptional<z.ZodEnum<["PRE_USE", "FORMAL"]>>;
    checklist: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    passed: z.ZodBoolean;
    notes: z.ZodOptional<z.ZodString>;
    correctiveActions: z.ZodOptional<z.ZodString>;
    meterReading: z.ZodOptional<z.ZodNumber>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    checklist: Record<string, unknown>;
    passed: boolean;
    siteId?: number | undefined;
    kind?: "PRE_USE" | "FORMAL" | undefined;
    correctiveActions?: string | undefined;
    notes?: string | undefined;
    meterReading?: number | undefined;
    signature?: string | undefined;
}, {
    equipmentId: number;
    checklist: Record<string, unknown>;
    passed: boolean;
    siteId?: number | undefined;
    kind?: "PRE_USE" | "FORMAL" | undefined;
    correctiveActions?: string | undefined;
    notes?: string | undefined;
    meterReading?: number | undefined;
    signature?: string | undefined;
}>;
