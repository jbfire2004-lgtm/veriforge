/**
 * Vera Offline Mode — unified public API for local-first field operation.
 */
export {
  FIELD_DB_NAME,
  FIELD_DB_VERSION,
  FIELD_SCHEMA_VERSION,
  type CacheEntityType,
  type SyncActionType,
  type SyncQueueItem,
  type ConflictRecord,
  type FieldModeState,
  type FormDraftRecord,
} from "../field/types";

export { getFieldDb, clearFieldDb } from "../field/db";
export { LocalCacheStore } from "../field/cache-store";
export {
  ensureFieldCryptoKey,
  clearFieldCryptoSession,
} from "../field/crypto";
export { SyncQueue } from "../field/sync-queue";
export { SyncEngine } from "../field/sync-engine";
export { applyDeltaSync } from "../field/delta-sync";
export { preloadFieldCache } from "../field/preload";
export {
  getOfflineDeviceId,
  getOfflineScope,
  setOfflineScope,
} from "../field/device-id";
export {
  syncQueueBatch,
  resolveServerConflict,
} from "../field/offline-batch-sync";
export {
  registerOfflineServiceWorker,
  requestBackgroundSync,
} from "../field/service-worker-register";
export {
  saveFormDraft,
  listFormDrafts,
  deleteFormDraft,
} from "../field/form-drafts";

import { SyncQueue } from "../field/sync-queue";
import type { SyncActionType } from "../field/types";

export async function enqueueOfflineAction(
  type: SyncActionType,
  payload: Record<string, unknown>,
  clientVersion = 1,
) {
  const queue = new SyncQueue();
  return queue.enqueue(type, payload, clientVersion);
}
