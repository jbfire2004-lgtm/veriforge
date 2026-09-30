import { z } from 'zod';
export declare const PmInspectionFindingCategorySchema: z.ZodEnum<["unsafe_condition", "missing_ppe", "equipment_defect", "housekeeping", "environmental", "other"]>;
export declare const PmInspectionResponsiblePartySchema: z.ZodEnum<["contractor", "supervisor", "company", "worker"]>;
export declare const PmInspectionPhotoCaptureBodySchema: z.ZodObject<{
    dataUrl: z.ZodOptional<z.ZodString>;
    coreFileId: z.ZodOptional<z.ZodNumber>;
    fileName: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodString>;
    clientSyncId: z.ZodOptional<z.ZodString>;
    offline: z.ZodOptional<z.ZodBoolean>;
    defaultSubcontractorCompanyId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    clientSyncId?: string | undefined;
    mimeType?: string | undefined;
    fileName?: string | undefined;
    caption?: string | undefined;
    dataUrl?: string | undefined;
    coreFileId?: number | undefined;
    offline?: boolean | undefined;
    defaultSubcontractorCompanyId?: number | undefined;
}, {
    clientSyncId?: string | undefined;
    mimeType?: string | undefined;
    fileName?: string | undefined;
    caption?: string | undefined;
    dataUrl?: string | undefined;
    coreFileId?: number | undefined;
    offline?: boolean | undefined;
    defaultSubcontractorCompanyId?: number | undefined;
}>;
export declare const PmInspectionPhotoFindingSchema: z.ZodObject<{
    id: z.ZodString;
    inspectionId: z.ZodString;
    category: z.ZodEnum<["unsafe_condition", "missing_ppe", "equipment_defect", "housekeeping", "environmental", "other"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    severity: z.ZodString;
    confidence: z.ZodNumber;
    responsibleParty: z.ZodEnum<["contractor", "supervisor", "company", "worker"]>;
    evidenceRequired: z.ZodArray<z.ZodString, "many">;
    deficiencyId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    correctiveActionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: "other" | "unsafe_condition" | "missing_ppe" | "equipment_defect" | "housekeeping" | "environmental";
    title: string;
    severity: string;
    confidence: number;
    inspectionId: string;
    responsibleParty: "supervisor" | "worker" | "company" | "contractor";
    evidenceRequired: string[];
    description?: string | null | undefined;
    deficiencyId?: string | null | undefined;
    correctiveActionId?: string | null | undefined;
}, {
    id: string;
    category: "other" | "unsafe_condition" | "missing_ppe" | "equipment_defect" | "housekeeping" | "environmental";
    title: string;
    severity: string;
    confidence: number;
    inspectionId: string;
    responsibleParty: "supervisor" | "worker" | "company" | "contractor";
    evidenceRequired: string[];
    description?: string | null | undefined;
    deficiencyId?: string | null | undefined;
    correctiveActionId?: string | null | undefined;
}>;
export declare const PmContractorDispatchStatusSchema: z.ZodEnum<["pending", "sent", "acknowledged", "in_progress", "completed", "overdue", "cancelled"]>;
export declare const PmInspectionContractorDispatchSchema: z.ZodObject<{
    id: z.ZodString;
    correctiveActionId: z.ZodString;
    subcontractorCompanyId: z.ZodNumber;
    status: z.ZodEnum<["pending", "sent", "acknowledged", "in_progress", "completed", "overdue", "cancelled"]>;
    sentAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    acknowledgedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "in_progress" | "cancelled" | "pending" | "overdue" | "sent" | "acknowledged" | "completed";
    id: string;
    correctiveActionId: string;
    subcontractorCompanyId: number;
    completedAt?: string | null | undefined;
    sentAt?: string | null | undefined;
    acknowledgedAt?: string | null | undefined;
}, {
    status: "in_progress" | "cancelled" | "pending" | "overdue" | "sent" | "acknowledged" | "completed";
    id: string;
    correctiveActionId: string;
    subcontractorCompanyId: number;
    completedAt?: string | null | undefined;
    sentAt?: string | null | undefined;
    acknowledgedAt?: string | null | undefined;
}>;
export type PmInspectionPhotoCaptureBody = z.infer<typeof PmInspectionPhotoCaptureBodySchema>;
