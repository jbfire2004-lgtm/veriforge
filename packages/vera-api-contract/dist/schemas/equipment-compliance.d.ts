import { z } from 'zod';
export declare const EquipmentComplianceDashboardSchema: z.ZodObject<{
    total: z.ZodNumber;
    compliant: z.ZodNumber;
    needsAttention: z.ZodNumber;
    nonCompliant: z.ZodNumber;
    lockedOut: z.ZodNumber;
    overdueInspection: z.ZodNumber;
    recent: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
        lockoutStatus: z.ZodEnum<["CLEAR", "LOCKED_OUT"]>;
        lastInspectionAt: z.ZodNullable<z.ZodString>;
        nextInspectionAt: z.ZodNullable<z.ZodString>;
        competencyRequired: z.ZodBoolean;
        trainingRequired: z.ZodBoolean;
        safetyStatus: z.ZodString;
        company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
        }, {
            id: number;
            name: string;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        company?: {
            id: number;
            name: string;
        } | null | undefined;
    }, {
        id: number;
        name: string;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        company?: {
            id: number;
            name: string;
        } | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recent: {
        id: number;
        name: string;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        company?: {
            id: number;
            name: string;
        } | null | undefined;
    }[];
    total: number;
    lockedOut: number;
    nonCompliant: number;
    compliant: number;
    needsAttention: number;
    overdueInspection: number;
}, {
    recent: {
        id: number;
        name: string;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        company?: {
            id: number;
            name: string;
        } | null | undefined;
    }[];
    total: number;
    lockedOut: number;
    nonCompliant: number;
    compliant: number;
    needsAttention: number;
    overdueInspection: number;
}>;
