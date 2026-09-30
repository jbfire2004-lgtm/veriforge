# Unified Hazard & Control Engine — Developer-Ready Pack

Company- and project-scoped unified hazard and control libraries, energy wheel mapping, SIF/HECA scoring, ingestion from JHA/inspections/incidents, control suggestions, hazard→control mapping, enforcement gates, CAIL predictions, and offline field sync.

**Primary API:** `/api/v1/pm/unified-hazard-control`  
**Spec alias API:** `/api/v1/pm/hazard`, `/api/v1/pm/control`  
**UI:** `/pm/unified-hazard-control`  
**Offline sync:** `pmUnifiedHazardControl.sync` (download + upload)  
**Backend:** `backend/src/pm-unified-hazard-control/`  
**Migration:** `20260521270000_pm_unified_hazard_control`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| hazard-service | `createHazard`, `getHazard`, `listHazards`, `publishHazard` |
| control-service | `createControl`, `getControl`, `listControls`, `publishControl` |
| energy-wheel-service | `EnergyWheelEngine` + `getEnergyWheel` |
| sif-heca-service | `SifHecaScoringEngine` + `scoreHazardSifHeca` |
| hazard-ingestion-service | `HazardIngestionEngine` + `ingestBatch` |
| control-suggestion-service | `ControlSuggestionEngine` + `suggestControlsForHazard` |
| hazard-control-mapping-service | `HazardControlMappingEngine` + `linkHazardControl` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmUnifiedHazardControlCailService` |
| audit-service | `hazardAudit`, `controlAudit` → `hazard_audit`, `control_audit` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Unified Hazard Model Engine | `pm-unified-hazard-control.service.ts` | CRUD, scope inheritance, publish workflow |
| Unified Control Model Engine | service + `publish-workflow.engine.ts` | Controls, verification steps, publish |
| Energy Wheel Engine | `energy-wheel.engine.ts` | Map energy types, exposure, high-energy flags |
| SIF/HECA Engine | `sif-heca-scoring.engine.ts` | SIF potential, HECA category, supervisor review |
| Hazard Ingestion Engine | `hazard-ingestion.engine.ts` | Normalize JHA, inspection, incident, SDS, PM sources |
| Control Suggestion Engine | `control-suggestion.engine.ts` | Rank controls by hazard category/energy |
| Hazard→Control Mapping Engine | `hazard-control-mapping.engine.ts` | Link effectiveness, required/verified flags |
| Enforcement Engine | `enforcement.engine.ts` | Published hazard/control gates for tasks/zones |
| Offline Hazard/Control Engine | `applyOfflineSync` | Replay hazards, controls, mappings by `clientSyncId` |

### Module wiring

- Controllers: `PmUnifiedHazardControlController`, `PmHazardController`, `PmControlController`
- Exported: `PmUnifiedHazardControlService`, `PmUnifiedHazardControlCailService`
- Scheduler: periodic CAIL refresh (when enabled in module)

---

## 2. Database schema

### `hazards` → `PmUnifiedHazard` (`hazards`)

| Spec field | Vera column |
|------------|-------------|
| id | `id` (UUID) |
| company_id | `companyId` |
| hazard_type | `hazardType` |
| category | `category` |
| subcategory | `subcategory` |
| energy_type | `energySources[]` on `hazard_energy` |
| severity / likelihood | `severity`, `likelihood`, `riskScore` |
| sif_potential | `sifPotential`, `sifScore` |
| heca_category | `hecaCategoryKey` |
| required_controls | `controlLinks` → `hazard_controls` |
| required_training | `requiredTraining` (jsonb) + `hazard_training` |
| required_equipment | `requiredEquipmentIds` (jsonb) + `hazard_equipment` |
| required_ppe | `requiredPpe` (jsonb) + `hazard_ppe` |
| required_permits | `requiredPermitTypes` (jsonb) |
| version | `version` + `hazard_versions` |

### `controls` → `PmUnifiedControl` (`controls`)

| Spec field | Vera column |
|------------|-------------|
| control_type | `controlType` |
| hierarchy_level | `hierarchyLevel` |
| control_strength | `controlStrength` |
| verification_steps | `control_verification` (`stepOrder`, `description`) |
| required_training / equipment / ppe / permits | JSON + normalized child tables |
| version | `version` + `control_versions` |

### `hazard_energy` → `PmUnifiedHazardEnergy`

| Spec field | Vera column |
|------------|-------------|
| energy_type | `energyType` |
| severity_score | `severityScore` |

### `hazard_controls` → `PmUnifiedHazardControlLink`

| Spec field | Vera column |
|------------|-------------|
| hazard_id / control_id | `hazardId`, `controlId` |
| effectiveness | `effectivenessScore`, `verified` |

### `control_verification` → `PmUnifiedControlVerification`

| Spec field | Vera column |
|------------|-------------|
| step | `stepOrder` |
| description | `description` |

### Supporting tables

- `hazard_audit`, `control_audit` — audit trail
- `pm_hc_attachments` — photos / annotations
- `pm_hc_overrides` — enforcement waivers
- `pm_hc_offline_cache` — last downloaded bundle (`cacheKey: hc_bundle`)

**Scope inheritance:** `scopeLevel`: `company` → `project` → `work_package` → `task` → `worker` via `parentHazardId` / `parentControlId`.

---

## 3. API contract

### Spec paths (`/api/v1/pm/hazard`, `/api/v1/pm/control`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/pm/hazard` | Create hazard (`companyId` in body) |
| POST | `/pm/hazard/ingest` | Batch ingest (`source`, optional `projectId`) |
| POST | `/pm/hazard/map-controls` | Link hazard ↔ control |
| POST | `/pm/hazard/sif-heca` | Score SIF/HECA (`hazardId`) |
| POST | `/pm/hazard/offline/sync` | Upload offline changes; returns `serverState` |
| GET | `/pm/hazard/{id}` | Hazard detail + energy, controls, training, PPE |
| GET | `/pm/hazard/{id}/energy-wheel` | Energy wheel + exposure |
| GET | `/pm/hazard/{id}/suggest-controls` | Control suggestions |
| GET | `/pm/hazard/{id}/cail` | Per-hazard SIF + suggestions + company insights |
| POST | `/pm/hazard/{id}/publish` | Publish hazard (supervisor+) |
| POST | `/pm/control` | Create control |
| GET | `/pm/control/{id}` | Control detail + verifications |
| POST | `/pm/control/{id}/publish` | Publish control (supervisor+) |

### Primary paths (`/api/v1/pm/unified-hazard-control`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Metrics, energy exposure, scores |
| GET | `/analytics` | Hazard/control/energy/SIF trends |
| GET | `/hazards/:id` | Hazard by id |
| GET | `/controls/:id` | Control by id |
| GET/POST | `/hazards` | List / create |
| POST | `/hazards/:id/publish` | Publish hazard |
| POST | `/hazards/:id/sif-heca` | SIF/HECA score |
| GET | `/hazards/:id/energy-wheel` | Energy wheel |
| GET/POST | `/hazards/:id/suggest-controls` | Suggestions / apply |
| GET/POST | `/controls` | List / create |
| POST | `/controls/:id/publish` | Publish control |
| POST | `/mapping` | Link hazard ↔ control |
| POST | `/ingest?source=` | Batch ingestion |
| POST | `/sync/company-to-project` | Copy company library to project |
| POST | `/enforcement/evaluate` | Enforcement simulation |
| GET | `/sync` | Offline download bundle |
| POST | `/sync` | Offline upload (`companyId` query + body) |
| GET | `/cail/bundle` | Full CAIL bundle |
| GET | `/cail/insights` | Explainable insights |

**Ingest sources:** `jha_flha`, `inspection`, `incident`, `equipment_failure`, `sds`, `pm_task`, `company_library`, `project_library`, `manual`.

### Frontend clients

- Spec: `vera-frontend/lib/pm-hazard.ts`
- Primary: `vera-frontend/lib/pm-unified-hazard-control.ts`

---

## 4. Frontend architecture

### Screens (UI route `/pm/unified-hazard-control`)

| Screen | Purpose |
|--------|---------|
| Hazard Library | Draft/publish hazards, SIF/HECA badges |
| Control Library | Engineering/admin/PPE controls, verification |
| Energy Wheel Viewer | Per-hazard energy mapping |
| SIF/HECA Dashboard | SIF scores, supervisor review flags |
| Hazard Ingestion | Batch import from JHA, inspections, incidents |
| Control Suggestion | Ranked controls for selected hazard |
| Offline Hazard/Control Queue | Field sync download/upload |

### Components (recommended / partial in hub)

- `HazardCard`, `ControlCard`, `EnergyWheel`, `SIFScoreBadge`, `HECAIndicator`, `ControlSuggestionList`

Nav: PM module nav → Unified Hazard & Control

---

## 5. Workflow logic

### Hazard flow

1. **Create** — `POST /hazard` or primary `/hazards` (draft, optional energy types)
2. **Map energy** — auto on create or `GET .../energy-wheel`
3. **Map controls** — `POST /hazard/map-controls` or suggestion apply
4. **Score SIF/HECA** — `POST /hazard/sif-heca`
5. **Publish** — `POST .../publish` → version snapshot + enforcement eligibility

### Control flow

1. **Create** — `POST /control` with optional `verificationSteps`
2. **Verify steps** — stored in `control_verification`; verified on publish
3. **Publish** — `POST /control/{id}/publish`

### Ingestion flow

1. **Raw hazard** — external source (JHA, inspection, incident, etc.)
2. **Normalize** — `HazardIngestionEngine` → `NormalizedHazard`
3. **Merge** — dedupe by title/source; update or create
4. **Publish** — optional manual publish after mapping

**States:** `draft` → `published` (archived via `active` / `deletedAt`).

---

## 6. CAIL intelligence logic

`PmUnifiedHazardControlCailService`:

| Capability | Method |
|------------|--------|
| Predictive hazard detection | `predictHazardDetection` (inspection defs, incidents not yet in library) |
| Predictive control suggestions | `ControlSuggestionEngine` + insights |
| Predictive SIF/HECA scoring | `SifHecaScoringEngine` + `scoreHazardSifHeca` |
| Weak control detection | Insights on low `effectivenessScore` / unverified links |
| Chronic hazard detection | `chronicHazardDetection` (repeated titles 180d) |
| Hazard→incident correlation | `hazardIncidentCorrelation` |
| Project hazard score | `projectHazardScore` (0–100) |
| Company hazard score | `companyHazardScoreFromDb` |

Bundle: `GET /cail/bundle` or `GET /hazard/{id}/cail`.

---

## 7. Offline mode

**Download:** `GET /sync?companyId=&projectId=` or field handler without upload payload.

Bundle: published hazards, controls, mappings, energy rows, `syncedAt`. Cached in `pm_hc_offline_cache`.

**Upload:** `POST /hazard/offline/sync` or `POST /sync?companyId=` with:

```json
{
  "companyId": 1,
  "projectId": 1,
  "hazards": [{ "clientSyncId": "local-1", "title": "...", "description": "..." }],
  "controls": [],
  "mappings": [{ "hazardId": "uuid", "controlId": "uuid", "effectivenessScore": 4 }]
}
```

Field action `pmUnifiedHazardControl.sync` — download by default; upload when `hazards`, `controls`, or `mappings` present.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Company Safety Context | `company_library` ingest; company-scope hazards |
| Project Safety Context | `project_library` ingest; project inheritance |
| Worker Safety Profiles | Worker-scope hazards; training/PPE on hazard |
| JHA / FLHA | `jha_flha` ingest source |
| Inspections | `inspection` ingest; CAIL predictions from deficiencies |
| Incidents | `incident` ingest + correlation |
| Corrective Actions | Open CAPA in CAIL insights |
| Equipment Safety | `equipment_failure` ingest |
| SDS | `sds` ingest source |
| PM Module | `pm_task` ingest; task/work-package scope |
| Unified Safety Intelligence | Aggregated hazard scores |

---

## 9. Analytics

`GET /analytics` returns:

| Metric | Source |
|--------|--------|
| Hazard trends | `groupBy status` on `hazards` |
| Control effectiveness trends | `groupBy status` on `controls` + weak link counts |
| Energy exposure trends | `hazard_energy` aggregates |
| SIF/HECA trends | `sifPotential` / `hecaCategoryKey` counts |
| Project hazard score | `projectHazardScore(projectId)` |
| Company hazard score | `companyHazardScoreFromDb` |
| Leading indicators | Unmapped published hazards, chronic repeats, CAIL insights |

---

## Quick start

```bash
# Create hazard
POST /api/v1/pm/hazard
{ "companyId": 1, "title": "Struck-by", "description": "...", "energyTypes": ["mechanical"] }

# Map control + score SIF
POST /api/v1/pm/hazard/map-controls
{ "hazardId": "<uuid>", "controlId": "<uuid>" }
POST /api/v1/pm/hazard/sif-heca
{ "hazardId": "<uuid>" }

# Offline sync (field)
# action: pmUnifiedHazardControl.sync
# payload: { companyId: 1, projectId: 1 }  # download
# payload: { companyId: 1, hazards: [...] }  # upload
```

See also: `docs/vera-pm-unified-hazard-control-system.md`
