import { z } from 'zod';
export declare const PlatformSummarySchema: z.ZodObject<{
    companyId: z.ZodNullable<z.ZodNumber>;
    generatedAt: z.ZodString;
    modules: z.ZodObject<{
        reporting: z.ZodUnknown;
        equipment: z.ZodObject<{
            total: z.ZodNumber;
            compliant: z.ZodNumber;
            needsAttention: z.ZodNumber;
            nonCompliant: z.ZodNumber;
            lockedOut: z.ZodNumber;
            overdueInspection: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        }, {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        }>;
        inspections: z.ZodObject<{
            total: z.ZodNumber;
            passed: z.ZodNumber;
            failed: z.ZodNumber;
            dueWithin7Days: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        }, {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        }>;
        competency: z.ZodObject<{
            totalEvaluations: z.ZodNumber;
            passing: z.ZodNumber;
            expiringSoon: z.ZodNumber;
            expired: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        }, {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        }>;
        toolsPpe: z.ZodUnknown;
        maintenanceCalibration: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        equipment: {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        };
        inspections: {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        };
        competency: {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        };
        reporting?: unknown;
        toolsPpe?: unknown;
        maintenanceCalibration?: unknown;
    }, {
        equipment: {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        };
        inspections: {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        };
        competency: {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        };
        reporting?: unknown;
        toolsPpe?: unknown;
        maintenanceCalibration?: unknown;
    }>;
    links: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number | null;
    generatedAt: string;
    modules: {
        equipment: {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        };
        inspections: {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        };
        competency: {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        };
        reporting?: unknown;
        toolsPpe?: unknown;
        maintenanceCalibration?: unknown;
    };
    links: Record<string, string>;
}, {
    companyId: number | null;
    generatedAt: string;
    modules: {
        equipment: {
            total: number;
            lockedOut: number;
            nonCompliant: number;
            compliant: number;
            needsAttention: number;
            overdueInspection: number;
        };
        inspections: {
            passed: number;
            failed: number;
            dueWithin7Days: number;
            total: number;
        };
        competency: {
            expired: number;
            totalEvaluations: number;
            passing: number;
            expiringSoon: number;
        };
        reporting?: unknown;
        toolsPpe?: unknown;
        maintenanceCalibration?: unknown;
    };
    links: Record<string, string>;
}>;
