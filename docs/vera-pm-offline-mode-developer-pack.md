# Offline Mode Engine — Developer-Ready Pack

Central orchestration for field offline sync: unified queue cache, conflict resolution, delta bundles, module routing, audit trail, and CAIL offline risk scoring across all PM safety modules.

**Primary API:** `/api/v1/pm/offline-mode`  
**Spec alias API:** `/api/v1/pm/offline`  
**Legacy field API:** `/api/v1/field/sync-batch`, `/api/v1/field/delta`  
**UI:** `/pm/offline-mode`  
**Field handler:** `pmOffline.sync`  
**Backend:** `backend/src/pm-offline-mode/`  
**Migration:** `20260521330000_pm_offline_mode_engine`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| offline-sync-service | `PmOfflineModeService.sync` |
| conflict-resolution-service | `resolveConflict` + `ConflictResolutionEngine` |
| offline-storage-service | `PmOfflineCache` upsert/read |
| delta-engine-service | `fetchDelta` → `FieldSyncDeltaService` |
| audit-service | `PmOfflineAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Offline Data Cache Engine | `PmOfflineCache` + `upsertCache` | Per-device module record cache |
| Delta Sync Engine | `FieldSyncDeltaService` | Workers, equipment, projects delta |
| Conflict Resolution Engine | `conflict-resolution.engine.ts` | prefer_local / prefer_server / merge |
| Offline Queue Engine | `sync` workflow + status transitions | pending → syncing → synced/conflict |
| Offline Attachment Engine | Routes `pmAttachments.sync` | Delegates to attachments module |
| Offline Validation Engine | `offline-validation.engine.ts` | Required fields per action type |
| Offline Batch Router | `offline-batch.router.ts` | Routes to all PM module sync handlers |

### Module wiring

- `FieldSyncModule` — core field actions (worker link, inspection submit, etc.)
- All PM safety modules — JHA, inspections, incidents, CAPA, training, SDS, equipment, emergency, site access, attachments, stations, PM, SIF/HECA, meetings, safety forms

---

## 2. Database schema

### `offline_cache` → `PmOfflineCache`

| Field | Spec alias |
|-------|------------|
| deviceId | device_id |
| moduleType | module_type (action type, e.g. `jhaFlha.sync`) |
| recordId | record_id |
| payload | payload (jsonb) |
| lastModified | last_modified |
| syncStatus | sync_status |

**Status enum (`PmOfflineSyncStatus`):**

| Spec | Vera |
|------|------|
| Pending Sync | `pending_sync` |
| Syncing | `syncing` |
| Synced | `synced` |
| Conflict | `conflict` |
| Resolved | `resolved` |

### `offline_conflicts` → `PmOfflineConflict`

| Field | Spec |
|-------|------|
| recordId | record_id |
| moduleType | module_type |
| localValue | local_value (jsonb) |
| serverValue | server_value (jsonb) |
| resolvedValue | resolved_value (jsonb) |
| resolvedByUserId | resolved_by |
| resolvedAt | resolved_at |

### `offline_audit` → `PmOfflineAuditLog`

| Field | Spec |
|-------|------|
| deviceId | device_id |
| eventType | event_type |
| eventData | event_data (jsonb) |
| createdAt | timestamp |

---

## 3. API contract

### Spec paths (`/api/v1/pm/offline`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sync` | Process offline action batch |
| POST | `/conflict/resolve` | Resolve conflict + optional retry |
| GET | `/device/:id` | Device queue + conflicts + CAIL |

### Full API (`/api/v1/pm/offline-mode`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sync` | Same as spec |
| POST | `/conflict/resolve` | Same as spec |
| GET | `/device/:id` | Device status dashboard |
| GET | `/delta?companyId=&since=` | Field delta bundle |
| GET | `/analytics/project/:id` | 30d usage analytics |

### Sync body

```json
{
  "deviceId": "tablet-42",
  "companyId": 1,
  "projectId": 1,
  "batchId": "batch-2026-05-19-001",
  "actions": [
    {
      "type": "jhaFlha.sync",
      "recordId": "flha-client-1",
      "clientVersion": 1,
      "payload": {
        "clientSyncId": "flha-client-1",
        "companyId": 1,
        "projectId": 1,
        "kind": "FLHA",
        "taskDescription": "Excavation — north trench"
      }
    }
  ]
}
```

### Sync response

```json
{
  "processed": 1,
  "synced": 1,
  "failed": 0,
  "conflicts": 0,
  "canComplete": true,
  "results": [
    {
      "type": "jhaFlha.sync",
      "recordId": "flha-client-1",
      "ok": true,
      "workflowState": "synced"
    }
  ]
}
```

### Conflict resolve body

```json
{
  "conflictId": "uuid",
  "strategy": "prefer_local",
  "retrySync": true
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/offline-mode` | Offline status dashboard | `offline-mode/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-offline-mode.ts` — primary API
- `vera-frontend/lib/pm-offline.ts` — spec paths
- `vera-frontend/lib/field/sync-handlers.ts` — per-module handlers + `pmOffline.sync`

| Spec screen | Vera |
|-------------|------|
| Offline Queue Viewer | Device status `queue` array |
| Conflict Resolution Screen | `openConflicts` + resolve API |
| Offline Status Dashboard | Main dashboard + analytics |

### Spec components

| Component | Data |
|-----------|------|
| OfflineStatusBadge | `workflowState` per queue item |
| ConflictResolver | `POST /conflict/resolve` |
| SyncProgressBar | `synced / processed` from sync response |

---

## 5. Workflow logic

### Transitions

```
pending_sync → syncing (on batch item start)
syncing → synced (module handler success)
syncing → conflict (version mismatch or conflict error)
syncing → pending_sync (transient failure)
conflict → resolved (conflict/resolve + optional retry)
```

### Validation

| Rule | Enforcement |
|------|-------------|
| Offline actions must pass local validation | `OfflineValidationEngine` per action type |
| Conflicts must be resolved before sync completes | `canComplete: false` when open conflicts exist |

---

## 6. CAIL intelligence logic

**Device scores (`GET /device/:id` → `cail`)**

| Output | Description |
|--------|-------------|
| offlineRiskScore | Queue depth + conflicts weighted |
| queuePressure | low / medium / high |
| offlineHazardScore | Conflict rate on hazard-related actions |
| offlineEquipmentScore | Equipment sync conflict pressure |
| offlineAccessScore | Site access offline conflict pressure |
| syncSuccessRate | Batch complete audit ratio |

---

## 7. Offline mode — supported modules

| Module | Sync action type |
|--------|------------------|
| JHA / FLHA | `jhaFlha.sync` |
| Inspections | `pmInspections.sync` |
| Incidents | `pmIncidents.sync` |
| Corrective Actions | `pmCapa.sync` |
| Training | `pmTraining.sync` |
| SDS / Documents | `pmDocuments.sync` |
| Equipment | `pmEquipment.sync` |
| Emergency | `pmEmergency.sync` |
| Site Access | `pmSiteAccess.sync` |
| Attachments | `pmAttachments.sync` |
| Safety Stations | `pmSafetyStations.sync` |
| PM Module | `pmProjectManagement.sync` |
| SIF / HECA | `sifHeca.sync` |
| Safety Meetings | `pmSafetyMeetings.sync` |
| Safety Forms | `safetyFormV2.submit` |
| Core field | `worker.link`, `inspection.submit`, etc. |

**Field handler:** `pmOffline.sync` — pass `actions[]` for upload; omit for status-only pull.

---

## 8. Integration map

| System | Integration |
|--------|-------------|
| All PM modules | `OfflineBatchRouter` delegates to module `syncOffline` / `applyOfflineSync` |
| Field sync | `FieldSyncBatchProcessor` for legacy core actions |
| Safety Stations | `pmSafetyStations.sync` |
| CAIL Engine | `PmOfflineCailIntelligenceService` device scores |
| Attachments | `pmAttachments.sync` routed via router |
| Module-specific caches | `pm_project_offline_cache`, `cail_offline_cache`, etc. remain for download bundles |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| cacheEntries30d | Total cache rows |
| synced30d | Successfully synced |
| conflicted30d | Rows in conflict status |
| conflicts30d | Conflict records created |
| syncSuccessRate | synced / total |
| conflictRate | conflicted / total |
| moduleUsage | Count by module_type |

### Leading indicators

- Pending queue depth per device
- Conflict rate trend
- Sync success rate

### Lagging indicators

- Open unresolved conflicts
- Failed retry count (pending_sync with errors)

---

## File index

```
backend/src/pm-offline-mode/
  pm-offline-mode.service.ts
  pm-offline-mode.controller.ts
  pm-offline.controller.ts
  offline-batch.router.ts
  offline-validation.engine.ts
  conflict-resolution.engine.ts
  pm-offline-cail-intelligence.service.ts

vera-frontend/
  lib/pm-offline-mode.ts
  lib/pm-offline.ts
  lib/field/sync-handlers.ts
  src/pages/pm/offline-mode/dashboard.tsx

docs/
  vera-pm-offline-mode-developer-pack.md
  vera-pm-offline-mode-system.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Restart backend to load `PmOfflineModeModule` and `PmOfflineController`.
