import { z } from 'zod';
export declare const FieldSyncActionSchema: z.ZodObject<{
    type: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    clientTimestamp: z.ZodOptional<z.ZodString>;
    clientVersion: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    payload: Record<string, unknown>;
    clientTimestamp?: string | undefined;
    clientVersion?: number | undefined;
}, {
    type: string;
    payload: Record<string, unknown>;
    clientTimestamp?: string | undefined;
    clientVersion?: number | undefined;
}>;
export declare const FieldSyncBatchBodySchema: z.ZodObject<{
    actions: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        clientTimestamp: z.ZodOptional<z.ZodString>;
        clientVersion: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string | undefined;
        clientVersion?: number | undefined;
    }, {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string | undefined;
        clientVersion?: number | undefined;
    }>, "many">;
    batchId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    actions: {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string | undefined;
        clientVersion?: number | undefined;
    }[];
    batchId?: string | undefined;
    clientId?: string | undefined;
}, {
    actions: {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string | undefined;
        clientVersion?: number | undefined;
    }[];
    batchId?: string | undefined;
    clientId?: string | undefined;
}>;
export declare const FieldDeltaTombstoneSchema: z.ZodObject<{
    type: z.ZodEnum<["task", "workPackage"]>;
    id: z.ZodString;
    deletedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "task" | "workPackage";
    id: string;
    deletedAt: string;
}, {
    type: "task" | "workPackage";
    id: string;
    deletedAt: string;
}>;
export declare const FieldDeltaBundleSchema: z.ZodObject<{
    syncedAt: z.ZodString;
    since: z.ZodNullable<z.ZodString>;
    workers: z.ZodArray<z.ZodUnknown, "many">;
    equipment: z.ZodArray<z.ZodUnknown, "many">;
    projects: z.ZodArray<z.ZodUnknown, "many">;
    trainingRecords: z.ZodArray<z.ZodUnknown, "many">;
    inspections: z.ZodArray<z.ZodUnknown, "many">;
    safetyForms: z.ZodArray<z.ZodUnknown, "many">;
    workPackages: z.ZodArray<z.ZodUnknown, "many">;
    tasks: z.ZodArray<z.ZodUnknown, "many">;
    safetyFormDefinitions: z.ZodArray<z.ZodUnknown, "many">;
    deleted: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["task", "workPackage"]>;
        id: z.ZodString;
        deletedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "task" | "workPackage";
        id: string;
        deletedAt: string;
    }, {
        type: "task" | "workPackage";
        id: string;
        deletedAt: string;
    }>, "many">;
    versions: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    equipment: unknown[];
    inspections: unknown[];
    workers: unknown[];
    projects: unknown[];
    syncedAt: string;
    since: string | null;
    trainingRecords: unknown[];
    safetyForms: unknown[];
    workPackages: unknown[];
    tasks: unknown[];
    safetyFormDefinitions: unknown[];
    deleted: {
        type: "task" | "workPackage";
        id: string;
        deletedAt: string;
    }[];
    versions: Record<string, number>;
}, {
    equipment: unknown[];
    inspections: unknown[];
    workers: unknown[];
    projects: unknown[];
    syncedAt: string;
    since: string | null;
    trainingRecords: unknown[];
    safetyForms: unknown[];
    workPackages: unknown[];
    tasks: unknown[];
    safetyFormDefinitions: unknown[];
    deleted: {
        type: "task" | "workPackage";
        id: string;
        deletedAt: string;
    }[];
    versions: Record<string, number>;
}>;
export type FieldDeltaBundle = z.infer<typeof FieldDeltaBundleSchema>;
