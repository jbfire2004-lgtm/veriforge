# Vera PM — Offline Mode Engine

Production API: `/api/v1/pm/offline-mode` · Spec alias: `/api/v1/pm/offline` · UI: `/pm/offline-mode`

Legacy field sync: `/api/v1/field/sync-batch`, `/api/v1/field/delta`

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-offline-mode/` |
| Cache | `offline_cache` |
| Conflicts | `offline_conflicts` |
| Audit | `offline_audit` |
| Router | `offline-batch.router.ts` |
| Migration | `20260521330000_pm_offline_mode_engine` |

## Workflow

`pending_sync` → `syncing` → `synced` | `conflict` → `resolved`

## Field integration

`pmOffline.sync` in `vera-frontend/lib/field/sync-handlers.ts` — unified batch upload or device status pull.

See `docs/vera-pm-offline-mode-developer-pack.md` for full API, module action map, and CAIL scoring.
