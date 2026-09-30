"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DueInspectionListSchema = exports.NotifyDueResponseSchema = exports.UnlockEquipmentResponseSchema = exports.UnlockEquipmentBodySchema = exports.InspectionDashboardSchema = exports.InspectionResponseSchema = exports.InspectorSummarySchema = exports.SubmitInspectionBodySchema = exports.UpdateChecklistBodySchema = exports.CreateChecklistBodySchema = exports.InspectionChecklistSchema = exports.ChecklistItemSchema = exports.InspectionChecklistCategorySchema = exports.InspectionTypeSchema = void 0;
const zod_1 = require("zod");
exports.InspectionTypeSchema = zod_1.z.enum([
    'PRE_USE',
    'SCHEDULED',
    'PME',
    'CRANE_LIFT',
    'LIFTING_GEAR',
    'VEHICLE',
    'TOOL',
    'HYDRAULIC_PNEUMATIC',
]);
exports.InspectionChecklistCategorySchema = zod_1.z.enum([
    'MOBILE_EQUIPMENT',
    'LIFTING_GEAR',
    'VEHICLE',
    'TOOL',
    'PME',
    'CRANE',
    'GENERAL',
]);
exports.ChecklistItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    required: zod_1.z.boolean().optional(),
});
exports.InspectionChecklistSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    category: exports.InspectionChecklistCategorySchema,
    inspectionType: exports.InspectionTypeSchema,
    items: zod_1.z.array(exports.ChecklistItemSchema),
    intervalDays: zod_1.z.number().nullable(),
    intervalHours: zod_1.z.number().nullable(),
    active: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateChecklistBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: exports.InspectionChecklistCategorySchema,
    inspectionType: exports.InspectionTypeSchema,
    items: zod_1.z.array(exports.ChecklistItemSchema).min(1),
    intervalDays: zod_1.z.number().int().positive().optional(),
    intervalHours: zod_1.z.number().int().positive().optional(),
    active: zod_1.z.boolean().optional(),
});
exports.UpdateChecklistBodySchema = exports.CreateChecklistBodySchema.partial();
exports.SubmitInspectionBodySchema = zod_1.z.object({
    equipmentId: zod_1.z.number().int().positive(),
    workerId: zod_1.z.number().int().positive().optional(),
    siteId: zod_1.z.number().int().positive().optional(),
    checklistId: zod_1.z.number().int().positive().optional(),
    inspectionType: exports.InspectionTypeSchema.optional(),
    kind: zod_1.z.enum(['PRE_USE', 'FORMAL']).optional(),
    checklist: zod_1.z.record(zod_1.z.unknown()),
    passed: zod_1.z.boolean(),
    photos: zod_1.z.array(zod_1.z.string()).optional(),
    correctiveActions: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    meterReading: zod_1.z.number().optional(),
    signature: zod_1.z.string().optional(),
});
exports.InspectorSummarySchema = zod_1.z.object({
    id: zod_1.z.number(),
    email: zod_1.z.string().nullable().optional(),
    username: zod_1.z.string().nullable().optional(),
});
exports.InspectionResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    equipmentId: zod_1.z.number().nullable(),
    workerId: zod_1.z.number().nullable(),
    siteId: zod_1.z.number().nullable(),
    /** User who performed / signed the inspection (alias of supervisorId). */
    inspectorId: zod_1.z.number().nullable(),
    inspector: exports.InspectorSummarySchema.nullable().optional(),
    supervisorId: zod_1.z.number().nullable(),
    supervisor: exports.InspectorSummarySchema.nullable().optional(),
    checklistId: zod_1.z.number().nullable(),
    kind: zod_1.z.enum(['PRE_USE', 'FORMAL']),
    inspectionType: exports.InspectionTypeSchema,
    checklist: zod_1.z.record(zod_1.z.unknown()).nullable(),
    passed: zod_1.z.boolean().nullable(),
    status: zod_1.z.string(),
    photos: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    correctiveActions: zod_1.z.string().nullable(),
    lockoutTriggered: zod_1.z.boolean(),
    nextInspectionDate: zod_1.z.string().datetime().nullable(),
    notes: zod_1.z.string().nullable(),
    meterReading: zod_1.z.number().nullable(),
    signature: zod_1.z.string().nullable(),
    completedAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    equipment: zod_1.z
        .object({ id: zod_1.z.number(), name: zod_1.z.string(), catalogTypeKey: zod_1.z.string().nullable() })
        .optional(),
    worker: zod_1.z
        .object({ id: zod_1.z.number(), firstName: zod_1.z.string(), lastName: zod_1.z.string() })
        .optional(),
    checklistTemplate: exports.InspectionChecklistSchema.optional(),
});
exports.InspectionDashboardSchema = zod_1.z.object({
    totalInspections: zod_1.z.number(),
    passed: zod_1.z.number(),
    failed: zod_1.z.number(),
    lockedOutEquipment: zod_1.z.number(),
    dueWithin7Days: zod_1.z.number(),
    recent: zod_1.z.array(exports.InspectionResponseSchema),
});
exports.UnlockEquipmentBodySchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
exports.UnlockEquipmentResponseSchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    unlocked: zod_1.z.boolean(),
});
exports.NotifyDueResponseSchema = zod_1.z.object({
    notified: zod_1.z.number(),
    equipmentCount: zod_1.z.number(),
});
exports.DueInspectionListSchema = zod_1.z.array(exports.InspectionResponseSchema);
