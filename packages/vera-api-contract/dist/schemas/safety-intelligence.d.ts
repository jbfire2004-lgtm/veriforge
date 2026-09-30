import { z } from "zod";
export declare const CailSourceTypeSchema: z.ZodEnum<["inspection", "bbo", "incident", "equipment", "jha", "flha", "heca", "sif", "training", "general"]>;
export declare const CailStatusSchema: z.ZodEnum<["open", "in_progress", "overdue", "resolved", "verified", "cancelled"]>;
export declare const CailSeveritySchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const CailRiskCategorySchema: z.ZodEnum<["behavior", "equipment", "environment", "process", "ppe", "ergonomic", "other"]>;
export declare const CreateCailBodySchema: z.ZodObject<{
    projectId: z.ZodNumber;
    ownerCompanyId: z.ZodNumber;
    sourceType: z.ZodEnum<["inspection", "bbo", "incident", "equipment", "jha", "flha", "heca", "sif", "training", "general"]>;
    sourceId: z.ZodOptional<z.ZodString>;
    sourceItemId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    riskCategory: z.ZodOptional<z.ZodEnum<["behavior", "equipment", "environment", "process", "ppe", "ergonomic", "other"]>>;
    dueDate: z.ZodOptional<z.ZodString>;
    assignedUserId: z.ZodOptional<z.ZodNumber>;
    siteId: z.ZodOptional<z.ZodNumber>;
    locationNote: z.ZodOptional<z.ZodString>;
    equipmentId: z.ZodOptional<z.ZodNumber>;
    workerId: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: number;
    title: string;
    ownerCompanyId: number;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    siteId?: number | undefined;
    description?: string | undefined;
    locationNote?: string | undefined;
    sourceId?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    sourceItemId?: string | undefined;
    riskCategory?: "equipment" | "behavior" | "environment" | "process" | "ppe" | "ergonomic" | "other" | undefined;
    dueDate?: string | undefined;
    assignedUserId?: number | undefined;
    tags?: string[] | undefined;
}, {
    projectId: number;
    title: string;
    ownerCompanyId: number;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    siteId?: number | undefined;
    description?: string | undefined;
    locationNote?: string | undefined;
    sourceId?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    sourceItemId?: string | undefined;
    riskCategory?: "equipment" | "behavior" | "environment" | "process" | "ppe" | "ergonomic" | "other" | undefined;
    dueDate?: string | undefined;
    assignedUserId?: number | undefined;
    tags?: string[] | undefined;
}>;
export declare const UpdateCailBodySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    assignedUserId: z.ZodOptional<z.ZodNumber>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    riskCategory: z.ZodOptional<z.ZodEnum<["behavior", "equipment", "environment", "process", "ppe", "ergonomic", "other"]>>;
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "overdue", "resolved", "verified", "cancelled"]>>;
    rootCauseCategory: z.ZodOptional<z.ZodString>;
    rootCauseNotes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    riskCategory?: "equipment" | "behavior" | "environment" | "process" | "ppe" | "ergonomic" | "other" | undefined;
    dueDate?: string | undefined;
    assignedUserId?: number | undefined;
    tags?: string[] | undefined;
    rootCauseCategory?: string | undefined;
    rootCauseNotes?: string | undefined;
}, {
    status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    riskCategory?: "equipment" | "behavior" | "environment" | "process" | "ppe" | "ergonomic" | "other" | undefined;
    dueDate?: string | undefined;
    assignedUserId?: number | undefined;
    tags?: string[] | undefined;
    rootCauseCategory?: string | undefined;
    rootCauseNotes?: string | undefined;
}>;
export declare const CailEntrySummarySchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodNumber;
    ownerCompanyId: z.ZodNumber;
    sourceType: z.ZodEnum<["inspection", "bbo", "incident", "equipment", "jha", "flha", "heca", "sif", "training", "general"]>;
    sourceId: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["open", "in_progress", "overdue", "resolved", "verified", "cancelled"]>;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved";
    id: string;
    projectId: number;
    createdAt: string;
    updatedAt: string;
    title: string;
    sourceId: string;
    severity: "low" | "medium" | "high" | "critical";
    ownerCompanyId: number;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    dueDate?: string | null | undefined;
}, {
    status: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved";
    id: string;
    projectId: number;
    createdAt: string;
    updatedAt: string;
    title: string;
    sourceId: string;
    severity: "low" | "medium" | "high" | "critical";
    ownerCompanyId: number;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    dueDate?: string | null | undefined;
}>;
export declare const CailProjectDashboardSchema: z.ZodObject<{
    projectId: z.ZodNumber;
    total: z.ZodNumber;
    open: z.ZodNumber;
    resolved: z.ZodNumber;
    verified: z.ZodNumber;
    overdue: z.ZodNumber;
    closureRate: z.ZodNumber;
    byStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    bySeverity: z.ZodRecord<z.ZodString, z.ZodNumber>;
    recent: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodNumber>;
        ownerCompanyId: z.ZodOptional<z.ZodNumber>;
        sourceType: z.ZodOptional<z.ZodEnum<["inspection", "bbo", "incident", "equipment", "jha", "flha", "heca", "sif", "training", "general"]>>;
        sourceId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "overdue", "resolved", "verified", "cancelled"]>>;
        severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        dueDate: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
        id?: string | undefined;
        projectId?: number | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        title?: string | undefined;
        sourceId?: string | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        ownerCompanyId?: number | undefined;
        sourceType?: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general" | undefined;
        dueDate?: string | null | undefined;
    }, {
        status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
        id?: string | undefined;
        projectId?: number | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        title?: string | undefined;
        sourceId?: string | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        ownerCompanyId?: number | undefined;
        sourceType?: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general" | undefined;
        dueDate?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: number;
    recent: {
        status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
        id?: string | undefined;
        projectId?: number | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        title?: string | undefined;
        sourceId?: string | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        ownerCompanyId?: number | undefined;
        sourceType?: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general" | undefined;
        dueDate?: string | null | undefined;
    }[];
    total: number;
    open: number;
    verified: number;
    overdue: number;
    resolved: number;
    closureRate: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
}, {
    projectId: number;
    recent: {
        status?: "in_progress" | "open" | "verified" | "cancelled" | "overdue" | "resolved" | undefined;
        id?: string | undefined;
        projectId?: number | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        title?: string | undefined;
        sourceId?: string | undefined;
        severity?: "low" | "medium" | "high" | "critical" | undefined;
        ownerCompanyId?: number | undefined;
        sourceType?: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general" | undefined;
        dueDate?: string | null | undefined;
    }[];
    total: number;
    open: number;
    verified: number;
    overdue: number;
    resolved: number;
    closureRate: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
}>;
export type CailSourceType = z.infer<typeof CailSourceTypeSchema>;
export type CailStatus = z.infer<typeof CailStatusSchema>;
export type CreateCailBody = z.infer<typeof CreateCailBodySchema>;
export declare const LessonLearnedSummarySchema: z.ZodObject<{
    id: z.ZodString;
    cailId: z.ZodString;
    title: z.ZodString;
    summary: z.ZodString;
    sourceType: z.ZodEnum<["inspection", "bbo", "incident", "equipment", "jha", "flha", "heca", "sif", "training", "general"]>;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    summary: string;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    cailId: string;
    publishedAt: string;
}, {
    id: string;
    title: string;
    summary: string;
    sourceType: "equipment" | "flha" | "jha" | "inspection" | "training" | "bbo" | "incident" | "heca" | "sif" | "general";
    cailId: string;
    publishedAt: string;
}>;
export declare const VsiProjectDashboardSchema: z.ZodObject<{
    projectId: z.ZodNumber;
    total: z.ZodNumber;
    open: z.ZodNumber;
    closureRate: z.ZodNumber;
    bbo: z.ZodOptional<z.ZodObject<{
        total: z.ZodNumber;
        safe: z.ZodNumber;
        positiveRatio: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        safe: number;
        positiveRatio: number;
    }, {
        total: number;
        safe: number;
        positiveRatio: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    projectId: number;
    total: number;
    open: number;
    closureRate: number;
    bbo?: {
        total: number;
        safe: number;
        positiveRatio: number;
    } | undefined;
}, {
    projectId: number;
    total: number;
    open: number;
    closureRate: number;
    bbo?: {
        total: number;
        safe: number;
        positiveRatio: number;
    } | undefined;
}>;
