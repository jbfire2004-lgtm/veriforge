export type FieldOsZoneEventType =
  | 'entry'
  | 'exit'
  | 'document_review'
  | 'sign_on'
  | 'permit_activation'
  | 'hazard_update'
  | 'breach';

export type FieldOsZoneEventSource =
  | 'gps'
  | 'ble'
  | 'qr'
  | 'nfc'
  | 'ui'
  | 'system';

export type FieldOsZoneEventSeverity = 'info' | 'warning' | 'critical';

export type FieldOsQueuePriority = 'critical' | 'operational' | 'informational';

export interface FieldOsEventActor {
  userId?: number;
  guestTokenId?: string;
  role?: string;
}

export interface FieldOsEventGeo {
  lat?: number;
  lng?: number;
  confidenceScore?: number;
}

export interface FieldOsEventVersionContext {
  zoneVersion?: number;
  policyVersion?: number;
  documentVersion?: number;
}

export interface FieldOsZoneEventPayload {
  [key: string]: unknown;
}

export interface FieldOsZoneEvent {
  eventId: string;
  companyId: number;
  projectId?: number;
  zoneId?: string;
  deviceId: string;
  actor?: FieldOsEventActor;
  eventType: FieldOsZoneEventType;
  source: FieldOsZoneEventSource;
  severity: FieldOsZoneEventSeverity;
  occurredAt: string;
  ingestedAt?: string;
  permitId?: string;
  documentId?: string;
  dedupeKey: string;
  correlationId?: string;
  geo?: FieldOsEventGeo;
  versions?: FieldOsEventVersionContext;
  payload: FieldOsZoneEventPayload;
  signatureHash?: string;
}

export interface FieldOsOfflineQueueItem {
  queueId: string;
  priority: FieldOsQueuePriority;
  event: FieldOsZoneEvent;
  attemptCount: number;
  firstQueuedAt: string;
  nextAttemptAt?: string;
  lastErrorCode?: string;
}

export interface FieldOsZoneEventBatch {
  batchId: string;
  companyId: number;
  deviceId: string;
  cursor?: string;
  items: FieldOsOfflineQueueItem[];
  createdAt?: string;
}

export interface FieldOsZoneEventIngestResultItem {
  eventId: string;
  queueId: string;
  accepted: boolean;
  reasonCode?: string;
}

export interface FieldOsZoneEventIngestResult {
  batchId: string;
  acceptedCount: number;
  rejectedCount: number;
  nextCursor?: string;
  results: FieldOsZoneEventIngestResultItem[];
  syncedAt: string;
}
