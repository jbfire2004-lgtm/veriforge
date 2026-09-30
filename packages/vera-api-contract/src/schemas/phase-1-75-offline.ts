import { z } from 'zod';

export const FieldSyncActionSchema = z.object({
  type: z.string(),
  payload: z.record(z.unknown()),
  clientTimestamp: z.string().optional(),
  clientVersion: z.number().optional(),
});

export const FieldSyncBatchBodySchema = z.object({
  actions: z.array(FieldSyncActionSchema),
  batchId: z.string().optional(),
  clientId: z.string().optional(),
});

export const FieldDeltaTombstoneSchema = z.object({
  type: z.enum(['task', 'workPackage']),
  id: z.string(),
  deletedAt: z.string(),
});

export const FieldDeltaBundleSchema = z.object({
  syncedAt: z.string(),
  since: z.string().nullable(),
  workers: z.array(z.unknown()),
  equipment: z.array(z.unknown()),
  projects: z.array(z.unknown()),
  trainingRecords: z.array(z.unknown()),
  inspections: z.array(z.unknown()),
  safetyForms: z.array(z.unknown()),
  workPackages: z.array(z.unknown()),
  tasks: z.array(z.unknown()),
  safetyFormDefinitions: z.array(z.unknown()),
  deleted: z.array(FieldDeltaTombstoneSchema),
  versions: z.record(z.number()),
});

export type FieldDeltaBundle = z.infer<typeof FieldDeltaBundleSchema>;
