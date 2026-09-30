"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectToolBodySchema = exports.AssignToolsPpeBodySchema = exports.CreatePpeBodySchema = exports.CreateToolBodySchema = exports.ToolsPpeDashboardSchema = exports.PpeTypeSchema = exports.PpeStatusSchema = exports.ToolStatusSchema = void 0;
const zod_1 = require("zod");
exports.ToolStatusSchema = zod_1.z.enum([
    'ACTIVE',
    'INSPECTION_DUE',
    'RETIRED',
    'LOST',
]);
exports.PpeStatusSchema = zod_1.z.enum(['ACTIVE', 'EXPIRED', 'RETIRED']);
exports.PpeTypeSchema = zod_1.z.enum([
    'HARD_HAT',
    'SAFETY_GLASSES',
    'GLOVES',
    'HARNESS',
    'FOOTWEAR',
    'HEARING',
    'RESPIRATOR',
    'COVERALL',
    'OTHER',
]);
exports.ToolsPpeDashboardSchema = zod_1.z.object({
    toolCount: zod_1.z.number(),
    toolsInspectionDue: zod_1.z.number(),
    ppeCount: zod_1.z.number(),
    ppeExpired: zod_1.z.number(),
    ppeExpiringSoon: zod_1.z.number(),
    activeToolAssignments: zod_1.z.number(),
    activePpeAssignments: zod_1.z.number(),
});
exports.CreateToolBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1),
    serialNumber: zod_1.z.string().optional(),
    assetTag: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    inspectionIntervalDays: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().optional(),
});
exports.CreatePpeBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1),
    ppeType: exports.PpeTypeSchema,
    serialNumber: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    issuedAt: zod_1.z.string().datetime().optional(),
});
exports.AssignToolsPpeBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive(),
    projectId: zod_1.z.number().int().positive().optional(),
});
exports.InspectToolBodySchema = zod_1.z.object({
    passed: zod_1.z.boolean(),
    checklist: zod_1.z.record(zod_1.z.unknown()).optional(),
    notes: zod_1.z.string().optional(),
    workerId: zod_1.z.number().int().positive().optional(),
});
