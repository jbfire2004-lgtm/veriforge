"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSummarySchema = void 0;
const zod_1 = require("zod");
exports.PlatformSummarySchema = zod_1.z.object({
    companyId: zod_1.z.number().nullable(),
    generatedAt: zod_1.z.string(),
    modules: zod_1.z.object({
        reporting: zod_1.z.unknown(),
        equipment: zod_1.z.object({
            total: zod_1.z.number(),
            compliant: zod_1.z.number(),
            needsAttention: zod_1.z.number(),
            nonCompliant: zod_1.z.number(),
            lockedOut: zod_1.z.number(),
            overdueInspection: zod_1.z.number(),
        }),
        inspections: zod_1.z.object({
            total: zod_1.z.number(),
            passed: zod_1.z.number(),
            failed: zod_1.z.number(),
            dueWithin7Days: zod_1.z.number(),
        }),
        competency: zod_1.z.object({
            totalEvaluations: zod_1.z.number(),
            passing: zod_1.z.number(),
            expiringSoon: zod_1.z.number(),
            expired: zod_1.z.number(),
        }),
        toolsPpe: zod_1.z.unknown(),
        maintenanceCalibration: zod_1.z.unknown(),
    }),
    links: zod_1.z.record(zod_1.z.string()),
});
