import { z } from 'zod';

export const InspectionTypeSchema = z.enum([
  'PRE_USE',
  'SCHEDULED',
  'PME',
  'CRANE_LIFT',
  'LIFTING_GEAR',
  'VEHICLE',
  'TOOL',
  'HYDRAULIC_PNEUMATIC',
]);

export const InspectionChecklistCategorySchema = z.enum([
  'MOBILE_EQUIPMENT',
  'LIFTING_GEAR',
  'VEHICLE',
  'TOOL',
  'PME',
  'CRANE',
  'GENERAL',
]);

export const ChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
});

export const InspectionChecklistSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: InspectionChecklistCategorySchema,
  inspectionType: InspectionTypeSchema,
  items: z.array(ChecklistItemSchema),
  intervalDays: z.number().nullable(),
  intervalHours: z.number().nullable(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateChecklistBodySchema = z.object({
  name: z.string().min(1),
  category: InspectionChecklistCategorySchema,
  inspectionType: InspectionTypeSchema,
  items: z.array(ChecklistItemSchema).min(1),
  intervalDays: z.number().int().positive().optional(),
  intervalHours: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export const UpdateChecklistBodySchema = CreateChecklistBodySchema.partial();

export const SubmitInspectionBodySchema = z.object({
  equipmentId: z.number().int().positive(),
  workerId: z.number().int().positive().optional(),
  siteId: z.number().int().positive().optional(),
  checklistId: z.number().int().positive().optional(),
  inspectionType: InspectionTypeSchema.optional(),
  kind: z.enum(['PRE_USE', 'FORMAL']).optional(),
  checklist: z.record(z.unknown()),
  passed: z.boolean(),
  photos: z.array(z.string()).optional(),
  correctiveActions: z.string().optional(),
  notes: z.string().optional(),
  meterReading: z.number().optional(),
  signature: z.string().optional(),
});

export const InspectorSummarySchema = z.object({
  id: z.number(),
  email: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
});

export const InspectionResponseSchema = z.object({
  id: z.number(),
  equipmentId: z.number().nullable(),
  workerId: z.number().nullable(),
  siteId: z.number().nullable(),
  /** User who performed / signed the inspection (alias of supervisorId). */
  inspectorId: z.number().nullable(),
  inspector: InspectorSummarySchema.nullable().optional(),
  supervisorId: z.number().nullable(),
  supervisor: InspectorSummarySchema.nullable().optional(),
  checklistId: z.number().nullable(),
  kind: z.enum(['PRE_USE', 'FORMAL']),
  inspectionType: InspectionTypeSchema,
  checklist: z.record(z.unknown()).nullable(),
  passed: z.boolean().nullable(),
  status: z.string(),
  photos: z.array(z.string()).nullable().optional(),
  correctiveActions: z.string().nullable(),
  lockoutTriggered: z.boolean(),
  nextInspectionDate: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  meterReading: z.number().nullable(),
  signature: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  equipment: z
    .object({ id: z.number(), name: z.string(), catalogTypeKey: z.string().nullable() })
    .optional(),
  worker: z
    .object({ id: z.number(), firstName: z.string(), lastName: z.string() })
    .optional(),
  checklistTemplate: InspectionChecklistSchema.optional(),
});

export const InspectionDashboardSchema = z.object({
  totalInspections: z.number(),
  passed: z.number(),
  failed: z.number(),
  lockedOutEquipment: z.number(),
  dueWithin7Days: z.number(),
  recent: z.array(InspectionResponseSchema),
});

export const UnlockEquipmentBodySchema = z.object({
  notes: z.string().optional(),
});

export const UnlockEquipmentResponseSchema = z.object({
  equipmentId: z.number(),
  unlocked: z.boolean(),
});

export const NotifyDueResponseSchema = z.object({
  notified: z.number(),
  equipmentCount: z.number(),
});

export const DueInspectionListSchema = z.array(InspectionResponseSchema);
