"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentComplianceDashboardSchema = void 0;
const zod_1 = require("zod");
const equipment_1 = require("./equipment");
exports.EquipmentComplianceDashboardSchema = zod_1.z.object({
    total: zod_1.z.number(),
    compliant: zod_1.z.number(),
    needsAttention: zod_1.z.number(),
    nonCompliant: zod_1.z.number(),
    lockedOut: zod_1.z.number(),
    overdueInspection: zod_1.z.number(),
    recent: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        complianceStatus: equipment_1.LinkComplianceStatusSchema,
        lockoutStatus: zod_1.z.enum(['CLEAR', 'LOCKED_OUT']),
        lastInspectionAt: zod_1.z.string().datetime().nullable(),
        nextInspectionAt: zod_1.z.string().datetime().nullable(),
        competencyRequired: zod_1.z.boolean(),
        trainingRequired: zod_1.z.boolean(),
        safetyStatus: zod_1.z.string(),
        company: zod_1.z.object({ id: zod_1.z.number(), name: zod_1.z.string() }).nullable().optional(),
    })),
});
