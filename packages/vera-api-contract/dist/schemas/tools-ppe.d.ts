import { z } from 'zod';
export declare const ToolStatusSchema: z.ZodEnum<["ACTIVE", "INSPECTION_DUE", "RETIRED", "LOST"]>;
export declare const PpeStatusSchema: z.ZodEnum<["ACTIVE", "EXPIRED", "RETIRED"]>;
export declare const PpeTypeSchema: z.ZodEnum<["HARD_HAT", "SAFETY_GLASSES", "GLOVES", "HARNESS", "FOOTWEAR", "HEARING", "RESPIRATOR", "COVERALL", "OTHER"]>;
export declare const ToolsPpeDashboardSchema: z.ZodObject<{
    toolCount: z.ZodNumber;
    toolsInspectionDue: z.ZodNumber;
    ppeCount: z.ZodNumber;
    ppeExpired: z.ZodNumber;
    ppeExpiringSoon: z.ZodNumber;
    activeToolAssignments: z.ZodNumber;
    activePpeAssignments: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    toolCount: number;
    toolsInspectionDue: number;
    ppeCount: number;
    ppeExpired: number;
    ppeExpiringSoon: number;
    activeToolAssignments: number;
    activePpeAssignments: number;
}, {
    toolCount: number;
    toolsInspectionDue: number;
    ppeCount: number;
    ppeExpired: number;
    ppeExpiringSoon: number;
    activeToolAssignments: number;
    activePpeAssignments: number;
}>;
export declare const CreateToolBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    name: z.ZodString;
    serialNumber: z.ZodOptional<z.ZodString>;
    assetTag: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    inspectionIntervalDays: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    name: string;
    category?: string | undefined;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    inspectionIntervalDays?: number | undefined;
}, {
    companyId: number;
    name: string;
    category?: string | undefined;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    inspectionIntervalDays?: number | undefined;
}>;
export declare const CreatePpeBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    name: z.ZodString;
    ppeType: z.ZodEnum<["HARD_HAT", "SAFETY_GLASSES", "GLOVES", "HARNESS", "FOOTWEAR", "HEARING", "RESPIRATOR", "COVERALL", "OTHER"]>;
    serialNumber: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    name: string;
    ppeType: "OTHER" | "HARD_HAT" | "SAFETY_GLASSES" | "GLOVES" | "HARNESS" | "FOOTWEAR" | "HEARING" | "RESPIRATOR" | "COVERALL";
    notes?: string | undefined;
    expiresAt?: string | undefined;
    serialNumber?: string | undefined;
    condition?: string | undefined;
    issuedAt?: string | undefined;
}, {
    companyId: number;
    name: string;
    ppeType: "OTHER" | "HARD_HAT" | "SAFETY_GLASSES" | "GLOVES" | "HARNESS" | "FOOTWEAR" | "HEARING" | "RESPIRATOR" | "COVERALL";
    notes?: string | undefined;
    expiresAt?: string | undefined;
    serialNumber?: string | undefined;
    condition?: string | undefined;
    issuedAt?: string | undefined;
}>;
export declare const AssignToolsPpeBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    projectId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    projectId?: number | undefined;
}, {
    workerId: number;
    projectId?: number | undefined;
}>;
export declare const InspectToolBodySchema: z.ZodObject<{
    passed: z.ZodBoolean;
    checklist: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    notes: z.ZodOptional<z.ZodString>;
    workerId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    workerId?: number | undefined;
    checklist?: Record<string, unknown> | undefined;
    notes?: string | undefined;
}, {
    passed: boolean;
    workerId?: number | undefined;
    checklist?: Record<string, unknown> | undefined;
    notes?: string | undefined;
}>;
