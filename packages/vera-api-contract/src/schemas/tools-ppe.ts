import { z } from 'zod';

export const ToolStatusSchema = z.enum([
  'ACTIVE',
  'INSPECTION_DUE',
  'RETIRED',
  'LOST',
]);

export const PpeStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'RETIRED']);

export const PpeTypeSchema = z.enum([
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

export const ToolsPpeDashboardSchema = z.object({
  toolCount: z.number(),
  toolsInspectionDue: z.number(),
  ppeCount: z.number(),
  ppeExpired: z.number(),
  ppeExpiringSoon: z.number(),
  activeToolAssignments: z.number(),
  activePpeAssignments: z.number(),
});

export const CreateToolBodySchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1),
  serialNumber: z.string().optional(),
  assetTag: z.string().optional(),
  category: z.string().optional(),
  inspectionIntervalDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const CreatePpeBodySchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1),
  ppeType: PpeTypeSchema,
  serialNumber: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  issuedAt: z.string().datetime().optional(),
});

export const AssignToolsPpeBodySchema = z.object({
  workerId: z.number().int().positive(),
  projectId: z.number().int().positive().optional(),
});

export const InspectToolBodySchema = z.object({
  passed: z.boolean(),
  checklist: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  workerId: z.number().int().positive().optional(),
});
