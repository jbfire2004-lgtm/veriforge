"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldOsZoneEventSyncResponseSchema = exports.FieldOsZoneEventSyncRequestSchema = exports.FieldOsZoneEventIngestResultSchema = exports.FieldOsZoneEventIngestResultItemSchema = exports.FieldOsZoneEventBatchSchema = exports.FieldOsOfflineQueueItemSchema = exports.FieldOsZoneEventSchema = exports.FieldOsEventVersionContextSchema = exports.FieldOsEventGeoSchema = exports.FieldOsEventActorSchema = exports.FieldOsQueuePrioritySchema = exports.FieldOsZoneEventSeveritySchema = exports.FieldOsZoneEventSourceSchema = exports.FieldOsZoneEventTypeSchema = void 0;
const zod_1 = require("zod");
exports.FieldOsZoneEventTypeSchema = zod_1.z.enum([
    'entry',
    'exit',
    'document_review',
    'sign_on',
    'permit_activation',
    'hazard_update',
    'breach',
]);
exports.FieldOsZoneEventSourceSchema = zod_1.z.enum([
    'gps',
    'ble',
    'qr',
    'nfc',
    'ui',
    'system',
]);
exports.FieldOsZoneEventSeveritySchema = zod_1.z.enum([
    'info',
    'warning',
    'critical',
]);
exports.FieldOsQueuePrioritySchema = zod_1.z.enum([
    'critical',
    'operational',
    'informational',
]);
exports.FieldOsEventActorSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive().optional(),
    guestTokenId: zod_1.z.string().uuid().optional(),
    role: zod_1.z.string().max(64).optional(),
});
exports.FieldOsEventGeoSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lng: zod_1.z.number().min(-180).max(180).optional(),
    confidenceScore: zod_1.z.number().min(0).max(100).optional(),
});
exports.FieldOsEventVersionContextSchema = zod_1.z.object({
    zoneVersion: zod_1.z.number().int().nonnegative().optional(),
    policyVersion: zod_1.z.number().int().nonnegative().optional(),
    documentVersion: zod_1.z.number().int().nonnegative().optional(),
});
exports.FieldOsZoneEventSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    companyId: zod_1.z.number().int().positive(),
    projectId: zod_1.z.number().int().positive().optional(),
    zoneId: zod_1.z.string().uuid().optional(),
    deviceId: zod_1.z.string().uuid(),
    actor: exports.FieldOsEventActorSchema.optional(),
    eventType: exports.FieldOsZoneEventTypeSchema,
    source: exports.FieldOsZoneEventSourceSchema,
    severity: exports.FieldOsZoneEventSeveritySchema.default('info'),
    occurredAt: zod_1.z.string().datetime(),
    ingestedAt: zod_1.z.string().datetime().optional(),
    permitId: zod_1.z.string().max(128).optional(),
    documentId: zod_1.z.string().max(128).optional(),
    dedupeKey: zod_1.z.string().max(128),
    correlationId: zod_1.z.string().uuid().optional(),
    geo: exports.FieldOsEventGeoSchema.optional(),
    versions: exports.FieldOsEventVersionContextSchema.optional(),
    payload: zod_1.z.record(zod_1.z.unknown()).default({}),
    signatureHash: zod_1.z.string().max(128).optional(),
});
exports.FieldOsOfflineQueueItemSchema = zod_1.z.object({
    queueId: zod_1.z.string().uuid(),
    priority: exports.FieldOsQueuePrioritySchema,
    event: exports.FieldOsZoneEventSchema,
    attemptCount: zod_1.z.number().int().nonnegative().default(0),
    firstQueuedAt: zod_1.z.string().datetime(),
    nextAttemptAt: zod_1.z.string().datetime().optional(),
    lastErrorCode: zod_1.z.string().max(64).optional(),
});
exports.FieldOsZoneEventBatchSchema = zod_1.z.object({
    batchId: zod_1.z.string().uuid(),
    companyId: zod_1.z.number().int().positive(),
    deviceId: zod_1.z.string().uuid(),
    cursor: zod_1.z.string().max(128).optional(),
    items: zod_1.z.array(exports.FieldOsOfflineQueueItemSchema).min(1).max(1000),
    createdAt: zod_1.z.string().datetime().optional(),
});
exports.FieldOsZoneEventIngestResultItemSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    queueId: zod_1.z.string().uuid(),
    accepted: zod_1.z.boolean(),
    reasonCode: zod_1.z.string().max(64).optional(),
});
exports.FieldOsZoneEventIngestResultSchema = zod_1.z.object({
    batchId: zod_1.z.string().uuid(),
    acceptedCount: zod_1.z.number().int().nonnegative(),
    rejectedCount: zod_1.z.number().int().nonnegative(),
    nextCursor: zod_1.z.string().max(128).optional(),
    results: zod_1.z.array(exports.FieldOsZoneEventIngestResultItemSchema),
    syncedAt: zod_1.z.string().datetime(),
});
exports.FieldOsZoneEventSyncRequestSchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    deviceId: zod_1.z.string().uuid(),
    sinceCursor: zod_1.z.string().max(128).optional(),
    maxItems: zod_1.z.number().int().min(1).max(1000).optional(),
});
exports.FieldOsZoneEventSyncResponseSchema = zod_1.z.object({
    syncedAt: zod_1.z.string().datetime(),
    cursor: zod_1.z.string().max(128),
    events: zod_1.z.array(exports.FieldOsZoneEventSchema),
});
