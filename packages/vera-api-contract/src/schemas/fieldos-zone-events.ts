import { z } from 'zod';

export const FieldOsZoneEventTypeSchema = z.enum([
  'entry',
  'exit',
  'document_review',
  'sign_on',
  'permit_activation',
  'hazard_update',
  'breach',
]);

export const FieldOsZoneEventSourceSchema = z.enum([
  'gps',
  'ble',
  'qr',
  'nfc',
  'ui',
  'system',
]);

export const FieldOsZoneEventSeveritySchema = z.enum([
  'info',
  'warning',
  'critical',
]);

export const FieldOsQueuePrioritySchema = z.enum([
  'critical',
  'operational',
  'informational',
]);

export const FieldOsEventActorSchema = z.object({
  userId: z.number().int().positive().optional(),
  guestTokenId: z.string().uuid().optional(),
  role: z.string().max(64).optional(),
});

export const FieldOsEventGeoSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
});

export const FieldOsEventVersionContextSchema = z.object({
  zoneVersion: z.number().int().nonnegative().optional(),
  policyVersion: z.number().int().nonnegative().optional(),
  documentVersion: z.number().int().nonnegative().optional(),
});

export const FieldOsZoneEventSchema = z.object({
  eventId: z.string().uuid(),
  companyId: z.number().int().positive(),
  projectId: z.number().int().positive().optional(),
  zoneId: z.string().uuid().optional(),
  deviceId: z.string().uuid(),
  actor: FieldOsEventActorSchema.optional(),
  eventType: FieldOsZoneEventTypeSchema,
  source: FieldOsZoneEventSourceSchema,
  severity: FieldOsZoneEventSeveritySchema.default('info'),
  occurredAt: z.string().datetime(),
  ingestedAt: z.string().datetime().optional(),
  permitId: z.string().max(128).optional(),
  documentId: z.string().max(128).optional(),
  dedupeKey: z.string().max(128),
  correlationId: z.string().uuid().optional(),
  geo: FieldOsEventGeoSchema.optional(),
  versions: FieldOsEventVersionContextSchema.optional(),
  payload: z.record(z.unknown()).default({}),
  signatureHash: z.string().max(128).optional(),
});

export const FieldOsOfflineQueueItemSchema = z.object({
  queueId: z.string().uuid(),
  priority: FieldOsQueuePrioritySchema,
  event: FieldOsZoneEventSchema,
  attemptCount: z.number().int().nonnegative().default(0),
  firstQueuedAt: z.string().datetime(),
  nextAttemptAt: z.string().datetime().optional(),
  lastErrorCode: z.string().max(64).optional(),
});

export const FieldOsZoneEventBatchSchema = z.object({
  batchId: z.string().uuid(),
  companyId: z.number().int().positive(),
  deviceId: z.string().uuid(),
  cursor: z.string().max(128).optional(),
  items: z.array(FieldOsOfflineQueueItemSchema).min(1).max(1000),
  createdAt: z.string().datetime().optional(),
});

export const FieldOsZoneEventIngestResultItemSchema = z.object({
  eventId: z.string().uuid(),
  queueId: z.string().uuid(),
  accepted: z.boolean(),
  reasonCode: z.string().max(64).optional(),
});

export const FieldOsZoneEventIngestResultSchema = z.object({
  batchId: z.string().uuid(),
  acceptedCount: z.number().int().nonnegative(),
  rejectedCount: z.number().int().nonnegative(),
  nextCursor: z.string().max(128).optional(),
  results: z.array(FieldOsZoneEventIngestResultItemSchema),
  syncedAt: z.string().datetime(),
});

export const FieldOsZoneEventSyncRequestSchema = z.object({
  companyId: z.number().int().positive(),
  deviceId: z.string().uuid(),
  sinceCursor: z.string().max(128).optional(),
  maxItems: z.number().int().min(1).max(1000).optional(),
});

export const FieldOsZoneEventSyncResponseSchema = z.object({
  syncedAt: z.string().datetime(),
  cursor: z.string().max(128),
  events: z.array(FieldOsZoneEventSchema),
});

export type FieldOsZoneEventType = z.infer<typeof FieldOsZoneEventTypeSchema>;
export type FieldOsZoneEventSource = z.infer<typeof FieldOsZoneEventSourceSchema>;
export type FieldOsZoneEventSeverity = z.infer<typeof FieldOsZoneEventSeveritySchema>;
export type FieldOsQueuePriority = z.infer<typeof FieldOsQueuePrioritySchema>;
export type FieldOsZoneEvent = z.infer<typeof FieldOsZoneEventSchema>;
export type FieldOsOfflineQueueItem = z.infer<typeof FieldOsOfflineQueueItemSchema>;
export type FieldOsZoneEventBatch = z.infer<typeof FieldOsZoneEventBatchSchema>;
export type FieldOsZoneEventIngestResult = z.infer<typeof FieldOsZoneEventIngestResultSchema>;
export type FieldOsZoneEventSyncRequest = z.infer<typeof FieldOsZoneEventSyncRequestSchema>;
export type FieldOsZoneEventSyncResponse = z.infer<typeof FieldOsZoneEventSyncResponseSchema>;
