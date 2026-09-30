/** Vera Field / Offline mode — shared types (§2–§5). */

export const FIELD_DB_NAME = "vera-field-cache";
export const FIELD_DB_VERSION = 4;
export const FIELD_SCHEMA_VERSION = 4;

export type SyncEngineStatus = "IDLE" | "SYNCING" | "ERROR";

export type CacheEntityType =
  | "worker"
  | "equipment"
  | "trainingRecord"
  | "projectAssignment"
  | "inspectionChecklist"
  | "inspection"
  | "competencyRequirement"
  | "companyLink"
  | "equipmentLink"
  | "qrScan"
  | "dashboardSummary"
  | "provider"
  | "project"
  | "task"
  | "workPackage"
  | "safetyFormDefinition"
  | "userProfile"
  | "workerWalletBundle"
  | "safetyFormTemplate"
  | "safetyFormDraft";

export type SafetyFormKind = "JHA" | "FLHA" | "SIF" | "HECA";

export type SyncActionType =
  | "worker.link"
  | "equipment.link"
  | "project.assignWorker"
  | "project.assignEquipment"
  | "inspection.submit"
  | "training.upload"
  | "qr.tempRecord"
  | "safetyForm.submit"
  | "safetyFormV2.submit"
  | "jhaFlha.sync"
  | "sifHeca.sync"
  | "pmInspections.sync"
  | "pmInspectionPhoto.capture"
  | "pmIncidents.sync"
  | "pmCapa.sync"
  | "pmSafetyMeetings.sync"
  | "pmDocuments.sync"
  | "pmEquipment.sync"
  | "pmEmergency.sync"
  | "pmSiteAccess.sync"
  | "pmAttachments.sync"
  | "pmOffline.sync"
  | "pmSafetyStations.sync"
  | "pmProjectSafetyContext.sync"
  | "pmCompanySafetyContext.sync"
  | "pmWorkerSafetyProfile.sync"
  | "pmTraining.sync"
  | "pmProjectManagement.sync"
  | "pmUnifiedHazardControl.sync"
  | "pmUnifiedCorrectiveAction.sync"
  | "pmUnifiedSafetyIntelligence.sync"
  | "wallet.sync";

export type FormDraftRecord = {
  id: string;
  kind: SafetyFormKind;
  companyId?: number;
  siteId?: number;
  title: string;
  fields: Record<string, unknown>;
  signatureDataUrl?: string;
  updatedAt: string;
  clientVersion: number;
};

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type ConflictResolutionMode = "auto" | "user" | "admin";

export type SyncQueueItem = {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  status: SyncStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError?: string;
  conflictId?: string;
  /** Optimistic version for delta merge */
  clientVersion: number;
};

export type ConflictRecord = {
  id: string;
  queueItemId: string;
  entityType: string;
  entityId: string | number;
  rule: string;
  message: string;
  serverSnapshot?: unknown;
  clientSnapshot?: unknown;
  resolution: ConflictResolutionMode;
  resolved: boolean;
  resolvedAt?: string;
};

export type CacheEntryMeta = {
  key: string;
  type: CacheEntityType;
  version: number;
  updatedAt: string;
  expiresAt?: string;
  etag?: string;
};

export type CachedEntity<T = unknown> = CacheEntryMeta & {
  data: T;
};

export type QrRegistryEntry = {
  id: string;
  kind: "worker" | "equipment" | "credential";
  entityId?: number;
  label?: string;
  tempOfflineId?: string;
  cachedAt: string;
};

export type FieldModeState = {
  isOnline: boolean;
  fieldModeEnabled: boolean;
  fieldModeManual: boolean | null;
  lastSyncAt: string | null;
  pendingCount: number;
  failedCount: number;
  syncing: boolean;
  syncStatus: SyncEngineStatus;
  lastSyncError: string | null;
};

export type SyncTrigger = "connectivity" | "foreground" | "manual";

export type PreloadScope = {
  companyId?: number;
  unionHallId?: number;
  includeProviders?: boolean;
  workerId?: number;
  projectId?: number;
};
