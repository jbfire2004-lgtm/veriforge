"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldDeltaBundleSchema = exports.FieldDeltaTombstoneSchema = exports.FieldSyncBatchBodySchema = exports.FieldSyncActionSchema = void 0;
const zod_1 = require("zod");
exports.FieldSyncActionSchema = zod_1.z.object({
    type: zod_1.z.string(),
    payload: zod_1.z.record(zod_1.z.unknown()),
    clientTimestamp: zod_1.z.string().optional(),
    clientVersion: zod_1.z.number().optional(),
});
exports.FieldSyncBatchBodySchema = zod_1.z.object({
    actions: zod_1.z.array(exports.FieldSyncActionSchema),
    batchId: zod_1.z.string().optional(),
    clientId: zod_1.z.string().optional(),
});
exports.FieldDeltaTombstoneSchema = zod_1.z.object({
    type: zod_1.z.enum(['task', 'workPackage']),
    id: zod_1.z.string(),
    deletedAt: zod_1.z.string(),
});
exports.FieldDeltaBundleSchema = zod_1.z.object({
    syncedAt: zod_1.z.string(),
    since: zod_1.z.string().nullable(),
    workers: zod_1.z.array(zod_1.z.unknown()),
    equipment: zod_1.z.array(zod_1.z.unknown()),
    projects: zod_1.z.array(zod_1.z.unknown()),
    trainingRecords: zod_1.z.array(zod_1.z.unknown()),
    inspections: zod_1.z.array(zod_1.z.unknown()),
    safetyForms: zod_1.z.array(zod_1.z.unknown()),
    workPackages: zod_1.z.array(zod_1.z.unknown()),
    tasks: zod_1.z.array(zod_1.z.unknown()),
    safetyFormDefinitions: zod_1.z.array(zod_1.z.unknown()),
    deleted: zod_1.z.array(exports.FieldDeltaTombstoneSchema),
    versions: zod_1.z.record(zod_1.z.number()),
});
