# Vera Offline Mode — Complete

Local-first architecture for full offline operation with automatic sync when online.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (vera-frontend/lib/field + lib/offline)             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ IndexedDB   │  │ Sync Queue   │  │ Service Worker    │  │
│  │ AES-256-GCM │  │ FIFO + retry │  │ background sync   │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          ▼                                  │
│              SyncEngine → offline-batch-sync                │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/v1/pm/offline-mode/sync (unified batch)          │
│  OfflineBatchRouter → domain syncOffline handlers           │
│  PmOfflineCache + PmOfflineConflict + audit log             │
│  PmOfflineSyncWorker (@Cron every 5 min — retry pending)    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  GET /api/v1/field/delta?companyId=&since= (incremental)    │
│  workers, equipment, projects, training, tasks, forms…    │
└─────────────────────────────────────────────────────────────┘
```

## Local database (IndexedDB)

| Store | Purpose |
|-------|---------|
| `cache` | Encrypted entity cache (AES-256-GCM) |
| `sync_queue` | FIFO outbound sync queue |
| `conflicts` | Client + server conflict records |
| `form_drafts` | Offline safety form drafts |
| `blobs` | Photo/attachment blobs pending upload |
| `meta` | `lastDeltaSyncAt`, `lastPreloadAt` |

**Schema version:** 4 (`vera-field-cache`)

### Cached entity types

| Type | Source |
|------|--------|
| `worker` | Preload + delta |
| `equipment` | Preload + delta |
| `trainingRecord` | Delta |
| `project` | Preload + delta |
| `task` | Delta |
| `workPackage` | Delta |
| `safetyFormDefinition` | Delta |
| `safetyFormTemplate` | Delta (pmSafetyWorkflow) |
| `inspection` | Delta |
| `inspectionChecklist` | Preload |

## Sync queue

Actions enqueued locally via `SyncQueue.enqueue()` or `enqueueOfflineAction()`:

- `jhaFlha.sync`, `sifHeca.sync`, `safetyFormV2.submit`
- `training.upload`, `inspection.submit`
- `pmProjectManagement.sync` (tasks, work packages, assignments)
- 30+ PM module sync actions

**Upload path:** `SyncEngine` → `syncQueueBatch()` → `POST /api/v1/pm/offline-mode/sync`  
Falls back to per-action handlers if batch fails.

## Delta updates

`GET /api/v1/field/delta?companyId=&since=` returns incremental changes:

- Filters by `updatedAt` / `issuedAt` / `createdAt` when `since` is provided
- Includes `workPackages`, `tasks`, `safetyFormDefinitions`
- Returns `deleted` tombstones for removed tasks/work packages
- Client merges via `applyDeltaSync()`

## Conflict resolution

| Layer | Mechanism |
|-------|-----------|
| Client pre-flight | `conflict-resolver.ts` — project closed, lockout, worker removed |
| Server version | `PmOfflineConflict` + `ConflictResolutionEngine` |
| UI | `ConflictResolverPanel` — keep mine / use server |
| Server resolve | `POST /api/v1/pm/offline-mode/conflict/resolve` |

Strategies: `prefer_local`, `prefer_server`, `merge`

## Background sync

| Worker | Interval | Role |
|--------|----------|------|
| Client `SyncEngine` | 60s + connectivity/foreground | Drain local queue |
| Service worker | `sync` event | Notify tabs to sync |
| Server `PmOfflineSyncWorker` | 5 min cron | Retry `pending_sync` cache rows |

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/pm/offline-mode/sync` | Unified batch upload |
| `POST /api/v1/pm/offline-mode/conflict/resolve` | Resolve server conflict |
| `GET /api/v1/pm/offline-mode/device/:id` | Device queue + conflicts |
| `GET /api/v1/pm/offline-mode/delta` | Delta bundle (delegates to field delta) |
| `GET /api/v1/field/delta` | Incremental entity pull |
| `POST /api/v1/field/sync-batch` | Legacy core field batch (9 actions) |

## Frontend usage

```typescript
import {
  enqueueOfflineAction,
  applyDeltaSync,
  preloadFieldCache,
  getOfflineDeviceId,
} from "@/lib/offline";

// Enqueue offline form submission
await enqueueOfflineAction("safetyFormV2.submit", {
  clientSyncId: "form_123",
  definitionId: "jha-v2",
  formData: { ... },
  submit: true,
});

// Preload + delta (via FieldModeProvider)
await field.preload(companyId, projectId);
await field.syncNow();
```

## UI

- **Dashboard:** `/pm/offline-mode?projectId=1&companyId=1`
- **Field components:** `FieldModeProvider`, `OfflineBanner`, `SyncStatusBar`, `ConflictResolverPanel`
- **PM layout:** Field mode provider wraps PM routes

## Key files

**Backend**

- `backend/src/pm-offline-mode/pm-offline-mode.service.ts`
- `backend/src/pm-offline-mode/offline-batch.router.ts`
- `backend/src/pm-offline-mode/conflict-resolution.engine.ts`
- `backend/src/pm-offline-mode/pm-offline-sync.worker.ts`
- `backend/src/modules/field-sync/field-sync-delta.service.ts`

**Frontend**

- `vera-frontend/lib/field/` — core offline stack
- `vera-frontend/lib/offline/index.ts` — public API
- `vera-frontend/public/vera-offline-sw.js` — service worker
- `vera-frontend/components/field/FieldModeProvider.tsx`

## Idempotency

Domain models use `clientSyncId @unique` for upsert-safe offline writes (JHA, SafetyForm, PmPmTask, PmWorkPackage, etc.).
