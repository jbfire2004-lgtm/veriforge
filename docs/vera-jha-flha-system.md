# Vera JHA / FLHA System — Production Architecture

**Version:** 1.0 · **Implementation:** `backend/src/jha-flha/` · **UI:** `/pm/jha-flha`

---

## 1. Backend architecture

```
JhaFlhaModule
├── JhaFlhaController          # REST /api/v1/pm/jha-flha
├── JhaFlhaService             # Workflow: draft → submit → review → lock
├── JhaLibraryService          # Hazard/control/task libraries + energy wheel
├── JhaScoringService          # Hazard, control, energy, SIF, quality scoring
└── JhaCailBridgeService       # CAIL emit on missing controls / SIF
```

**Integrations:** `SafetyIntelligenceModule` (CAIL), `SiteAccessService` (FLHA gate), field sync `jhaFlha.sync`.

---

## 2. Database schema (LIVE)

| Table | Purpose |
|-------|---------|
| `jha_flha` | Master record (kind FLHA/JHA, status, scores, environment JSON) |
| `jha_flha_version` | Immutable snapshots on submit/review |
| `jha_flha_hazard` | Hazard rows with severity × likelihood risk |
| `jha_flha_control` | Controls linked to hazards |
| `jha_flha_energy_source` | Energy wheel exposures per type |
| `jha_flha_worker` | Crew + signoff flags |
| `jha_flha_equipment` | Equipment authorization |
| `jha_flha_signature` | Worker / supervisor / authorizer signatures |
| `jha_flha_attachment` | Photos, PDFs, annotated media |
| `jha_flha_corrective_action` | Local CAPA + `cailEntryId` link |
| `hazard_library` | Company/project hazard templates |
| `control_library` | Company/project control templates |
| `jha_task_library` | Task codes with default hazards |
| `jha_flha_audit_log` | Append-only audit |

**Isolation:** `companyId` + `projectId` on every `jha_flha` row. Soft delete via `deletedAt`.

---

## 3. API contract

Base: `/api/v1/pm/jha-flha` · Auth: JWT · Roles: WORKER, SUPERVISOR, PROJECT_MANAGER, COMPANY_ADMIN, ADMIN

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | query projectId, status, kind | `JhaFlha[]` |
| POST | `/` | CreateJhaFlhaDto | Full record |
| GET | `/:id` | — | Full include (hazards, controls, crew, …) |
| PUT | `/:id` | draft fields | Updated record |
| POST | `/:id/hazards` | hazard dto | Hazard row |
| POST | `/:id/controls` | control dto | Control row |
| POST | `/:id/energy-sources` | `{ sources[] }` | Full record |
| POST | `/:id/crew` | `{ workers[] }` | Full record |
| POST | `/:id/equipment` | `{ items[] }` | Full record |
| POST | `/:id/evaluate` | — | `JhaEvaluation` |
| POST | `/:id/submit` | — | Record (403 if blockReasons) |
| POST | `/:id/review` | `{ action, reviewNotes }` | Record |
| POST | `/:id/sign` | signature dto | Record |
| POST | `/:id/lock` | — | LOCKED record |
| POST | `/sync` | offline payload | Record |
| GET | `/library/hazards` | companyId, projectId | Library entries |
| GET | `/library/controls` | companyId, projectId | Library entries |
| GET | `/library/energy-wheel` | — | Energy definitions |
| GET | `/compliance/worker` | workerId, projectId | `{ compliant, jhaFlhaId }` |

**Errors:** 400 validation/block, 403 role, 404 not found, 409 clientSyncId conflict.

---

## 4. Frontend architecture

| Route | Screen |
|-------|--------|
| `/pm/jha-flha` | List by project |
| `/pm/jha-flha/new` | Create FLHA wizard |
| `/pm/jha-flha/[id]` | Editor: scope, hazards, energy, evaluate, submit, approve |

**Client:** `vera-frontend/lib/jha-flha.ts`  
**Offline:** `jhaFlha.sync` in `sync-handlers.ts`

---

## 5. Workflow logic

```
DRAFT ──submit──► SUBMITTED or UNDER_REVIEW (if SIF/high-energy)
       │
       ├── review approve ──► APPROVED (requires supervisor sig + all crew signed)
       ├── review reject ──► REJECTED
       └── request_changes ──► DRAFT

APPROVED ──lock──► LOCKED
```

| Transition | Validation | Permission |
|------------|------------|------------|
| submit | ≥1 hazard; no missingControls | creator / crew |
| approve | supervisor signature; all crew signed | SUPERVISOR+ |
| lock | status APPROVED | supervisor |

---

## 6. CAIL intelligence

**Triggers on submit when:** `!controlsAdequate` or `sifPotential`

- `sourceType`: `flha` | `jha` | `sif`
- Idempotent `(sourceType, sourceId, sourceItemId)`
- Copilot enrichment via existing `cail.created` pipeline

**Scoring (deterministic):**

- `riskScore` = sum(hazard severity × likelihood)
- `sifScore` = weighted SIF indicators (max risk, high energy, missing controls, …)
- `sifPotential` = sifScore ≥ 40
- `qualityScore` = 100 − penalties

---

## 7. Offline mode

`POST /sync` with `clientSyncId`, hazards[], workers[], `submit: true`  
Field queue action: `jhaFlha.sync`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Site Access | FLHA check uses `jha_flha` APPROVED/LOCKED within `requiresFlhaHours` |
| CAIL | Auto-emit missing controls / SIF |
| Safety Forms | Parallel path via `daily-flha` form definition |
| Safety Stations | `GET /compliance/worker` for station sign-in |
| Training | Library `requiredTraining` on tasks; site access training codes |

---

## 9. Analytics & scoring models

Exposed on each record: `riskScore`, `taskRiskScore`, `sifScore`, `qualityScore`, `aiAnalysis` (evaluation JSON).

Project dashboards can aggregate via existing VSI dashboards + `jha_flha` counts by status.

---

## Quick start

```http
POST /api/v1/pm/jha-flha
{ "companyId": 1, "projectId": 1, "taskDescription": "Excavation north trench" }

POST /api/v1/pm/jha-flha/{id}/hazards
{ "description": "Collapse hazard", "category": "Fall", "severity": 4, "likelihood": 4, "energyTypes": ["gravity"] }

POST /api/v1/pm/jha-flha/{id}/controls
{ "hazardId": "...", "controlType": "engineering", "description": "Shoring installed", "adequate": true }

POST /api/v1/pm/jha-flha/{id}/evaluate
POST /api/v1/pm/jha-flha/{id}/submit
```

UI: **Project management → JHA / FLHA** or `/pm/jha-flha?projectId=1&companyId=1`
