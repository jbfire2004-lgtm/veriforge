import { z } from "zod";
export declare const AdoptionCompanyAnalyticsSchema: z.ZodObject<{
    lastLogin: z.ZodNullable<z.ZodString>;
    activeUsers30d: z.ZodNumber;
    modulesUsed: z.ZodRecord<z.ZodString, z.ZodNumber>;
    totalWorkers: z.ZodNumber;
    totalEquipment: z.ZodNumber;
    totalProjects: z.ZodNumber;
    churnRiskScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalWorkers: number;
    totalProjects: number;
    totalEquipment: number;
    lastLogin: string | null;
    activeUsers30d: number;
    modulesUsed: Record<string, number>;
    churnRiskScore: number;
}, {
    totalWorkers: number;
    totalProjects: number;
    totalEquipment: number;
    lastLogin: string | null;
    activeUsers30d: number;
    modulesUsed: Record<string, number>;
    churnRiskScore: number;
}>;
export declare const AdoptionMapCompanySchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    city: z.ZodNullable<z.ZodString>;
    province: z.ZodNullable<z.ZodString>;
    lat: z.ZodNullable<z.ZodNumber>;
    lng: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    analytics: z.ZodNullable<z.ZodObject<{
        lastLogin: z.ZodNullable<z.ZodString>;
        activeUsers30d: z.ZodNumber;
        modulesUsed: z.ZodRecord<z.ZodString, z.ZodNumber>;
        totalWorkers: z.ZodNumber;
        totalEquipment: z.ZodNumber;
        totalProjects: z.ZodNumber;
        churnRiskScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }, {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    createdAt: string;
    lat: number | null;
    lng: number | null;
    city: string | null;
    province: string | null;
    analytics: {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    } | null;
}, {
    id: number;
    name: string;
    createdAt: string;
    lat: number | null;
    lng: number | null;
    city: string | null;
    province: string | null;
    analytics: {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    } | null;
}>;
export declare const AdoptionMapResponseSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    city: z.ZodNullable<z.ZodString>;
    province: z.ZodNullable<z.ZodString>;
    lat: z.ZodNullable<z.ZodNumber>;
    lng: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    analytics: z.ZodNullable<z.ZodObject<{
        lastLogin: z.ZodNullable<z.ZodString>;
        activeUsers30d: z.ZodNumber;
        modulesUsed: z.ZodRecord<z.ZodString, z.ZodNumber>;
        totalWorkers: z.ZodNumber;
        totalEquipment: z.ZodNumber;
        totalProjects: z.ZodNumber;
        churnRiskScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }, {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    createdAt: string;
    lat: number | null;
    lng: number | null;
    city: string | null;
    province: string | null;
    analytics: {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    } | null;
}, {
    id: number;
    name: string;
    createdAt: string;
    lat: number | null;
    lng: number | null;
    city: string | null;
    province: string | null;
    analytics: {
        totalWorkers: number;
        totalProjects: number;
        totalEquipment: number;
        lastLogin: string | null;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    } | null;
}>, "many">;
export declare const GrowthMonthBucketSchema: z.ZodObject<{
    month: z.ZodString;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
    month: string;
}, {
    count: number;
    month: string;
}>;
export declare const GrowthStatsResponseSchema: z.ZodObject<{
    newCompaniesByMonth: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        month: string;
    }, {
        count: number;
        month: string;
    }>, "many">;
    newWorkersByMonth: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        month: string;
    }, {
        count: number;
        month: string;
    }>, "many">;
    newProjectsByMonth: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        month: string;
    }, {
        count: number;
        month: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    newCompaniesByMonth: {
        count: number;
        month: string;
    }[];
    newWorkersByMonth: {
        count: number;
        month: string;
    }[];
    newProjectsByMonth: {
        count: number;
        month: string;
    }[];
}, {
    newCompaniesByMonth: {
        count: number;
        month: string;
    }[];
    newWorkersByMonth: {
        count: number;
        month: string;
    }[];
    newProjectsByMonth: {
        count: number;
        month: string;
    }[];
}>;
export declare const ModuleUsageResponseSchema: z.ZodObject<{
    globalTotals: z.ZodRecord<z.ZodString, z.ZodNumber>;
    companiesUsingModule: z.ZodRecord<z.ZodString, z.ZodNumber>;
    totalCompanies: z.ZodNumber;
    moduleAdoptionPercent: z.ZodRecord<z.ZodString, z.ZodNumber>;
    companies: z.ZodArray<z.ZodObject<{
        companyId: z.ZodNumber;
        companyName: z.ZodString;
        modulesUsed: z.ZodRecord<z.ZodString, z.ZodNumber>;
        activeUsers30d: z.ZodNumber;
        churnRiskScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        companyName: string;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }, {
        companyId: number;
        companyName: string;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    companies: {
        companyId: number;
        companyName: string;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }[];
    globalTotals: Record<string, number>;
    companiesUsingModule: Record<string, number>;
    totalCompanies: number;
    moduleAdoptionPercent: Record<string, number>;
}, {
    companies: {
        companyId: number;
        companyName: string;
        activeUsers30d: number;
        modulesUsed: Record<string, number>;
        churnRiskScore: number;
    }[];
    globalTotals: Record<string, number>;
    companiesUsingModule: Record<string, number>;
    totalCompanies: number;
    moduleAdoptionPercent: Record<string, number>;
}>;
export declare const FeedbackRequestStatusSchema: z.ZodEnum<["NEW", "PLANNED", "IN_PROGRESS", "COMPLETED", "DECLINED"]>;
export declare const FeedbackRequestSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    status: z.ZodEnum<["NEW", "PLANNED", "IN_PROGRESS", "COMPLETED", "DECLINED"]>;
    upvotes: z.ZodNumber;
    internalNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "COMPLETED" | "NEW" | "PLANNED" | "IN_PROGRESS" | "DECLINED";
    id: number;
    category: string;
    createdAt: string;
    description: string;
    title: string;
    upvotes: number;
    updatedAt?: string | undefined;
    internalNotes?: string | null | undefined;
}, {
    status: "COMPLETED" | "NEW" | "PLANNED" | "IN_PROGRESS" | "DECLINED";
    id: number;
    category: string;
    createdAt: string;
    description: string;
    title: string;
    upvotes: number;
    updatedAt?: string | undefined;
    internalNotes?: string | null | undefined;
}>;
export type AdoptionMapCompany = z.infer<typeof AdoptionMapCompanySchema>;
export type GrowthStatsResponse = z.infer<typeof GrowthStatsResponseSchema>;
export type ModuleUsageResponse = z.infer<typeof ModuleUsageResponseSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
