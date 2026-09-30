# Vera PM Unified Hazard & Control Engine

Single hazard and control model for JHA/FLHA, SIF/HECA, inspections, incidents, equipment, SDS, PM module, and company/project safety context.

- **Primary API:** `/api/v1/pm/unified-hazard-control`
- **Spec alias API:** `/api/v1/pm/hazard`, `/api/v1/pm/control`
- **UI:** `/pm/unified-hazard-control`
- **Developer pack:** `docs/vera-pm-unified-hazard-control-developer-pack.md`

## 1. Backend architecture

```
pm-unified-hazard-control/
├── pm-unified-hazard-control.module.ts
├── pm-unified-hazard-control.controller.ts
├── pm-hazard.controller.ts          # spec alias /pm/hazard
├── pm-control.controller.ts         # spec alias /pm/control
├── pm-unified-hazard-control.service.ts
├── pm-unified-hazard-control-cail.service.ts
├── energy-wheel.engine.ts
├── sif-heca-scoring.engine.ts
├── hazard-ingestion.engine.ts
├── control-suggestion.engine.ts
├── hazard-control-mapping.engine.ts
├── publish-workflow.engine.ts
└── enforcement.engine.ts
```

## 2. Database schema

| Table | Model | Purpose |
|-------|-------|---------|
| `hazards` | `PmUnifiedHazard` | Unified hazard with scope inheritance |
| `hazard_versions` | `PmUnifiedHazardVersion` | Publish snapshots |
| `hazard_energy` | `PmUnifiedHazardEnergy` | Energy wheel mapping |
| `hazard_controls` | `PmUnifiedHazardControlLink` | Hazard ↔ control mapping |
| `hazard_training` | `PmUnifiedHazardTraining` | Required training |
| `hazard_equipment` | `PmUnifiedHazardEquipment` | Equipment requirements |
| `hazard_ppe` | `PmUnifiedHazardPpe` | PPE requirements |
| `controls` | `PmUnifiedControl` | Unified controls |
| `control_versions` | `PmUnifiedControlVersion` | Publish snapshots |
| `control_training` | `PmUnifiedControlTraining` | Training on controls |
| `control_equipment` | `PmUnifiedControlEquipment` | Equipment on controls |
| `control_ppe` | `PmUnifiedControlPpe` | PPE on controls |
| `control_verification` | `PmUnifiedControlVerification` | Verification steps |
| `hazard_audit` | `PmUnifiedHazardAudit` | Hazard audit trail |
| `control_audit` | `PmUnifiedControlAudit` | Control audit trail |
| `pm_hc_attachments` | `PmUnifiedHcAttachment` | Media |
| `pm_hc_overrides` | `PmUnifiedHcOverride` | Enforcement overrides |
| `pm_hc_offline_cache` | `PmUnifiedHcOfflineCache` | Offline bundles |

**Inheritance:** `parentHazardId` / `parentControlId` with `scopeLevel`: `company` → `project` → `work_package` → `task` → `worker`.

Migration: `prisma/migrations/20260521270000_pm_unified_hazard_control/migration.sql`

## 3. API contract

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/dashboard` | PM | Metrics, energy exposure, CAIL score |
| GET | `/analytics` | PM | Trends and leading indicators |
| GET/POST | `/hazards` | POST: Supervisor+ | Library CRUD |
| POST | `/hazards/:id/publish` | Supervisor+ | Versioned publish |
| POST | `/hazards/:id/sif-heca` | PM | SIF/HECA scoring |
| GET | `/hazards/:id/energy-wheel` | PM | Energy + suggested controls |
| GET/POST | `/hazards/:id/suggest-controls` | Apply: Supervisor+ | Control suggestion engine |
| GET/POST | `/controls` | POST: Supervisor+ | Control library |
| POST | `/controls/:id/publish` | Supervisor+ | Publish with verification |
| POST | `/mapping` | Supervisor+ | Link hazard ↔ control |
| POST | `/ingest?source=` | Supervisor+ | Batch ingestion |
| POST | `/sync/company-to-project` | Supervisor+ | Inheritance sync |
| POST | `/enforcement/evaluate` | PM | Gate evaluation |
| POST | `/workers/:id/exposure/:hazardId` | PM | Worker exposure log |
| POST | `/attachments` | PM | Media |
| GET | `/hazards/:id` | PM | Hazard detail |
| GET | `/controls/:id` | PM | Control detail |
| GET | `/sync` | PM | Offline download bundle |
| POST | `/sync` | PM | Offline upload (hazards, controls, mappings) |
| GET | `/cail/bundle` | PM | CAIL predictions + scores |
| GET | `/cail/insights` | PM | Explainable insights |

**Spec alias (`/api/v1/pm/hazard`, `/api/v1/pm/control`):** `POST /`, `POST /ingest`, `POST /map-controls`, `POST /sif-heca`, `POST /offline/sync`, `GET /{id}`; control `POST /`, `GET /{id}`.

**Ingest sources:** `jha_flha`, `inspection`, `incident`, `equipment_failure`, `sds`, `pm_task`, `company_library`, `project_library`, `manual`.

## 4. Frontend

- Route: `/pm/unified-hazard-control?companyId=1&projectId=1`
- Dashboard tabs: Hazards, Controls, Energy wheel, Ingestion, CAIL
- Clients: `lib/pm-unified-hazard-control.ts` (primary), `lib/pm-hazard.ts` (spec paths)
- Offline: `pmUnifiedHazardControl.sync` (download + upload when `hazards`/`controls`/`mappings` present)

## 5. Workflow logic

**Hazard:** `draft` → map controls + energy → SIF score → `published` (version snapshot).

**Control:** `draft` → verification steps → `published`.

**Ingestion:** source pull → normalize → dedupe → create draft hazards → optional auto-suggest controls.

**Enforcement:** unmapped published hazards, SDS ack (chemical), training, emergency lock → block worker/task/zone/equipment per `EnforcementEngine`.

**Overrides:** `pm_hc_overrides` with expiry → waive rules in enforcement.

## 6. CAIL intelligence

- Company hazard score (0–100)
- Insights: unmapped hazards, SIF-potential, weak controls, chronic incident hazards, open CAPA
- Inputs/outputs documented in `PmUnifiedHazardControlCailService`

## 7. Offline mode

Cache key `company:{id}:hc_bundle` or `project:{id}:hc_bundle` — hazards, controls, energy wheel, project safety bundle.

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Company safety context | Ingest `company_library`; policy/SDS ack in enforcement |
| Project safety context | Ingest `project_library`; sync triggers `autoGenerateProfile` |
| Worker safety profile | `recordWorkerExposure`; `rebuildProfile` on exposure |
| JHA/FLHA | Ingest `jha_flha` hazards |
| Inspections | Ingest deficiencies |
| PM module | Ingest blocked `pm_task` hazards |
| SIF/HECA | `SifHecaScoringEngine` on every hazard create/update |
| Emergency | `pm_site_emergency_lock` in enforcement |

## 9. Analytics

- Hazard/control counts, SIF count, unmapped published
- Energy exposure `groupBy` energyType
- Hazard status trend `groupBy` status
- Leading indicators: unmapped, SIF, company hazard score

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```
