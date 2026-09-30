# JHA / FLHA — Developer-Ready Pack

Vera PM module for Job Hazard Analysis (JHA) and Field Level Hazard Assessment (FLHA). This document maps the specification to the **implemented** codebase (`backend/src/jha-flha/`, Prisma `jha_flha*`, UI `/pm/jha-flha`).

**API base:** `/api/v1/pm/jha-flha`  
**Offline sync type:** `jhaFlha.sync` (field handlers)

---

## 1. Backend architecture

### Service mapping (spec → implementation)

| Spec service | Implementation |
|--------------|----------------|
| jha-service | `JhaFlhaService` |
| hazard-engine-service | `JhaScoringService` + `JhaLibraryService` (hazard library) |
| control-engine-service | `JhaScoringService` + hazard↔control validation in `evaluate()` |
| signature-service | `JhaFlhaService.sign()` → `jha_flha_signature` + `jha_flha_worker.signedAt` |
| offline-sync-service | `JhaFlhaService.syncOffline()` |
| attachment-service | `JhaFlhaService.addAttachment()` |
| cail-inference-service | `JhaCailBridgeService` + Unified CAIL via CAPA on submit |
| audit-service | `JhaFlhaService.audit()` → `jha_flha_audit` |

### Core engines

| Engine | File | Responsibility |
|--------|------|----------------|
| JHA Builder | `jha-flha.service.ts` | create, updateDraft, crew, equipment, energy |
| Hazard Mapping | `addHazard()`, `jha_flha_hazard` | severity × likelihood → riskScore |
| Control Mapping | `addControl()`, scoring `evaluate()` | hazardId link, adequacy, PPE flag |
| Worker Signature | `sign()` WORKER role | signature blob + worker row |
| Supervisor Approval | `supervisorReview()` | approve / reject / request_changes + unified CAPA gate |
| SIF/HECA Scoring | `jha-scoring.service.ts` + `SifHecaIngestionService` | sifScore, sifPotential, hecaCategoryKey (ingestion) |
| Offline JHA | `syncOffline()` | clientSyncId idempotency |
| JHA Enforcement | submit validation + `workerCompliance()` | block submission; 24h approved FLHA for worker |
| JHA Versioning | `snapshotVersion()` | `jha_flha_version.snapshotJson` |

### Module wiring (`jha-flha.module.ts`)

- `SafetyIntelligenceModule` — CAIL emitter
- `SifHecaModule` — SIF/HECA ingestion on submit
- `PmCorrectiveActionsModule` — auto CAPA from weak/missing controls
- `PmUnifiedCorrectiveActionModule` — JHA approval gate (open CAPA)

---

## 2. Database schema

Prisma models map to spec tables (Postgres `@@map` names).

### `jha_flha` (spec: `jhas`)

| Field | Type | Spec alias |
|-------|------|------------|
| id | UUID PK | id |
| companyId | Int | company_id |
| projectId | Int | project_id |
| workPackageId | String? FK → work_packages | work_package_id |
| taskId | String? @unique FK → tasks | task_id |
| kind | FLHA \| JHA | — |
| status | enum | draft → DRAFT, pending → SUBMITTED/UNDER_REVIEW, approved → APPROVED, rejected → REJECTED, locked → LOCKED |
| taskDescription | Text | title/description |
| workScope, locationNote | Text | description |
| riskScore, taskRiskScore | Int | risk_score |
| sifScore, sifPotential | Int, Bool | sif_score |
| hecaCategoryKey | String? | heca_category |
| qualityScore | Int? | — |
| createdByUserId | Int | created_by |
| approvedAt | DateTime | approved_by (via audit + supervisor sign) |
| clientSyncId | String? unique | offline |
| deletedAt | DateTime? | soft delete |
| createdAt, updatedAt | DateTime | timestamps |

**Indexes:** `(projectId, status)`, `(companyId, createdAt)`, `(workPackageId)`, `(taskId)`

### `jha_flha_hazard` (spec: `jha_hazards`)

| Field | Notes |
|-------|-------|
| jhaFlhaId | FK |
| severity, likelihood, riskScore | risk matrix |
| energyTypes | Json — energy wheel |
| sifIndicator | SIF flag per hazard |
| libraryEntryId | link to hazard_library |
| controls | relation → jha_flha_control |

PPE/training requirements: derived from controls (`ppeRequired`) + library; unified H&C uses separate `PmUnifiedHazard` when ingested.

### `jha_flha_control` (spec: `jha_controls`)

| Field | Notes |
|-------|-------|
| hazardId | maps hazard → control |
| controlType | administrative, engineering, ppe, … |
| effectivenessScore | control_strength |
| verified | verification_required outcome |
| adequate | weak control detection |

### `jha_flha_signature` (spec: `jha_signatures`)

| Field | Notes |
|-------|-------|
| role | WORKER, SUPERVISOR, AUTHORIZER |
| signatureData | signature_blob |
| signedAt | timestamp |
| signerUserId | actor |

Device/location: extend via audit payload on `signed` event (optional client fields in future DTO).

### `jha_flha_attachment` (spec: `jha_attachments`)

fileName, mimeType, storageKey, dataUrl, annotation Json

### `jha_flha_audit` → `jha_flha_audit_log`

eventType, actorId, payload Json, createdAt

### Supporting tables

- `jha_flha_version` — publish snapshots
- `jha_flha_worker` — crew, training/competency flags, signedAt
- `jha_flha_equipment` — equipment authorization
- `jha_flha_energy_source` — energy wheel exposures
- `jha_flha_corrective_action` — inline CAPA links
- `hazard_library`, `control_library`, `jha_task_library` — offline libraries

Migration: `20260521300000_jha_flha_pm_links` (workPackageId, taskId, hecaCategoryKey)

---

## 3. API contract

Base: `/api/v1/pm/jha-flha` — JWT + roles WORKER+.

### CRUD & builder

| Method | Path | Body / query | Response | Errors |
|--------|------|--------------|----------|--------|
| GET | `/` | projectId?, companyId?, status?, kind? | JhaFlha[] summary | 401 |
| POST | `/` | kind, companyId, projectId, taskDescription, workPackageId?, taskId?, … | Full JHA | 404 project |
| GET | `/:id` | — | Full include hazards/controls/crew | 404 |
| PUT | `/:id` | draft fields only | Updated JHA | 400 not editable |

### Hazards & controls (spec paths)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/:id/hazards` | Add hazard (severity, likelihood, energyTypes, sifIndicator) |
| POST | `/:id/controls` | Add control (hazardId?, controlType, adequate, ppeRequired) |
| POST | `/:id/energy-sources` | Energy wheel exposures |
| POST | `/:id/crew` | Worker list |
| POST | `/:id/equipment` | Equipment links |

### Sign & approve (spec paths)

| Method | Path | Body | Validation |
|--------|------|------|------------|
| POST | `/:id/sign` | role, signatureData, workerId? | Locks blocked when LOCKED |
| POST | `/:id/review` | action: approve\|reject\|request_changes, reviewNotes? | Supervisor sig if required; all crew signed; unified CAPA gate on approve |
| POST | `/:id/lock` | — | APPROVED → LOCKED |

Alias: `POST /:id/approve` → use `POST /:id/review` with `action: "approve"`.

### Scoring (spec: GET /jha/{id}/score)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/:id/evaluate` | Recompute and persist scores |
| GET | `/:id/score` | Same evaluation output (read/compute) |

**Evaluation response:**

```json
{
  "riskScore": 24,
  "taskRiskScore": 45,
  "sifScore": 55,
  "sifPotential": true,
  "highEnergyFlag": false,
  "qualityScore": 70,
  "requiresSupervisorReview": true,
  "controlsAdequate": false,
  "missingControls": ["No controls for hazard: …"],
  "weakControls": [],
  "blockSubmission": true,
  "blockReasons": ["Missing required controls"]
}
```

### Workflow

| Method | Path | Description |
|--------|------|-------------|
| POST | `/:id/submit` | Validates → SUBMITTED or UNDER_REVIEW; CAIL + SIF ingest + CAPA |
| GET | `/:id/suggestions` | Library hazards/controls + energy wheel |

### Offline (spec: POST /jha/offline/sync)

| Method | Path | Body |
|--------|------|------|
| POST | `/sync` | clientSyncId, companyId, projectId, taskDescription, hazards[], workers[], submit? |

Idempotent on `clientSyncId`.

### Library & compliance

| Method | Path |
|--------|------|
| GET | `/library/energy-wheel` |
| GET | `/library/hazards?companyId=&projectId=` |
| GET | `/library/controls?companyId=&projectId=` |
| GET | `/library/tasks?companyId=&projectId=` |
| GET | `/compliance/worker?workerId=&projectId=` |
| GET | `/analytics?projectId=` |

### Analytics response (`GET /analytics`)

```json
{
  "projectId": 1,
  "windowDays": 90,
  "totals": { "jhas": 12, "approved": 8, "sifFlagged": 3 },
  "scores": {
    "jhaQualityScore": 78,
    "hazardCoverageScore": 92,
    "controlEffectivenessScore": 65,
    "workerParticipationScore": 88,
    "projectRiskContribution": 34
  },
  "trends": { "sifRatePct": 25, "approvalRatePct": 67 },
  "leadingIndicators": { "avgHazardsPerJha": 4.2, "underReview": 2 },
  "laggingIndicators": { "rejected": 1, "draftOpen": 3 }
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/jha-flha` | JHA List + analytics KPIs | `list.tsx` |
| `/pm/jha-flha/new` | New FLHA | `editor.tsx` |
| `/pm/jha-flha/[id]` | JHA Builder / review | `editor.tsx` |

**Lib:** `vera-frontend/lib/jha-flha.ts`

### Implemented UI flows

- Hazard library picker → `addJhaHazard`
- Evaluate → `evaluateJhaFlha` / `getJhaFlhaScore`
- Submit → `submitJhaFlha`
- Supervisor review → `reviewJhaFlha`
- Worker sign → `signJhaFlha`
- Analytics on list → `fetchJhaFlhaAnalytics`

### Spec components (roadmap / partial)

| Component | Status |
|-----------|--------|
| HazardCard / ControlCard | Inline cards in editor |
| RiskMatrix | severity × likelihood in add hazard |
| SIFScoreBadge | SIF flag in list |
| SignatureCanvas | sign API accepts signatureData string |
| OfflineSyncStatus | `jhaFlha.sync` handler |

---

## 5. Workflow logic

### States (Prisma `JhaFlhaStatus`)

```
DRAFT ──submit──► SUBMITTED (no supervisor required)
                └► UNDER_REVIEW (SIF / high energy / weather / new worker)

UNDER_REVIEW|SUBMITTED ──approve──► APPROVED ──lock──► LOCKED
                        ──reject──► REJECTED ──edit──► DRAFT
                        ──request_changes──► DRAFT
```

### Transitions & permissions

| Transition | Roles | Validations |
|------------|-------|-------------|
| Edit draft | Worker, Supervisor | status ∈ DRAFT, REJECTED |
| Submit | Worker, Supervisor | ≥1 hazard; no missing controls; evaluation.blockSubmission = false |
| Approve | Supervisor+ | Supervisor signature if requiresSupervisorReview; all crew signedAt; unified CAPA gate |
| Reject | Supervisor+ | reviewNotes optional |
| Lock | Supervisor+ | typically from APPROVED |

### SIF/HECA threshold

- `sifScore >= 40` OR any hazard `sifIndicator` OR `riskScore >= 20` → `sifPotential`
- `requiresSupervisorReview` = sifPotential OR highEnergyFlag OR newWorker OR extreme weather
- On submit: `SifHecaIngestionService.ingestFromJhaFlha`, CAPA auto-gen if weak controls

---

## 6. CAIL intelligence logic

### Bridge: `JhaCailBridgeService`

On submit when `!controlsAdequate || sifPotential`:

- Emits `CailEntry` per missing control (source flha/jha)
- Emits SIF CAIL entry when sifPotential

### Unified CAIL (`PmUnifiedSafetyIntelligence`)

- Batch/realtime can score `jha_quality` from project analytics
- JHA approval blocked by `PmUnifiedCorrectiveActionService.jhaApprovalGate`

### Scoring inputs → outputs (`JhaScoringService.evaluate`)

| Inputs | Outputs |
|--------|---------|
| hazards (severity, likelihood, energy, sifIndicator) | riskScore, taskRiskScore, sifScore, sifPotential |
| controls per hazard (type, adequate, effectiveness) | controlsAdequate, missingControls[], weakControls[] |
| energySources + ENERGY_WHEEL constants | highEnergyFlag, missing energy controls |
| environmentalJson.weather | supervisor review, sif boost |
| workersSigned / workersCount | submission readiness (crew sign enforced at approve) |
| equipmentUnauthorized | sifScore +15 |

### Recommended outputs (computed client-side from evaluation)

- missingControls → CAPA + CAIL entries
- weakControls → CAPA generation
- requiresSupervisorReview → UNDER_REVIEW status
- Library suggestions → GET `/:id/suggestions`

---

## 7. Offline mode

### Local storage (field sync)

1. Pull libraries: hazards, controls, tasks, energy wheel (API GET library/*)
2. Create/update via `POST /sync` with `clientSyncId`
3. Optional `submit: true` in sync payload

### Conflict resolution

- Server wins on same `clientSyncId` (returns existing row)
- `clientVersion` incremented on draft updates

### Background sync

- Handler: `jhaFlha.sync` in `vera-frontend/lib/field/sync-handlers.ts`
- Uses `syncJhaFlhaOffline` from `lib/jha-flha.ts`

---

## 8. Integration map

| Module | Integration point |
|--------|-------------------|
| Unified H&C | Ingest hazards/controls from published library; SIF on unified hazards |
| Worker safety profile | `workerCompliance()` — 24h approved JHA |
| Equipment safety | `jha_flha_equipment.authorized`, scoring unauthorized count |
| SDS | Environmental JSON + future chemical hazards in library |
| Training | `jha_flha_worker.trainingVerified` (set by compliance hooks) |
| Site access | FLHA approval gate via worker compliance |
| PM Module | `workPackageId`, `taskId`; `PmPmTask.requiredJhaId` |
| Corrective actions | `PmCapaAutoGenerateService.fromJhaFlha` on submit |
| Unified CAPA | Approval gate on supervisor approve |
| Safety stations | Realtime worker compliance check |
| SIF/HECA | `SifHecaIngestionService` on submit → hecaCategoryKey |
| CAIL entries | `JhaCailBridgeService.emitFromEvaluation` |

---

## 9. Analytics & scoring models

### Project analytics (`GET /analytics?projectId=`)

| Metric | Formula |
|--------|---------|
| jhaQualityScore | avg(qualityScore) over 90d |
| hazardCoverageScore | % JHAs with ≥1 hazard |
| controlEffectivenessScore | min(100, (controls/hazards)×50) |
| workerParticipationScore | % crew with signedAt |
| projectRiskContribution | min(100, avg(taskRiskScore)) |
| sifRatePct | % sifPotential |
| approvalRatePct | % APPROVED or LOCKED |

### Per-JHA scores (stored on row)

- `riskScore` — sum of hazard risk scores
- `taskRiskScore` — capped composite from max hazard
- `qualityScore` — 100 − 15×missing − 10×weak − 50 if no hazards
- `sifScore` — weighted SIF factors (max 100)

### Leading / lagging indicators

- Leading: avg hazards/JHA, under review count, SIF rate
- Lagging: rejected count, open drafts

---

## File index

```
backend/src/jha-flha/
  jha-flha.service.ts      # Main orchestration
  jha-flha.controller.ts   # REST API
  jha-scoring.service.ts     # SIF/HECA + quality engine
  jha-cail-bridge.service.ts
  jha-library.service.ts
  jha-flha.constants.ts    # ENERGY_WHEEL

vera-frontend/
  lib/jha-flha.ts
  src/pages/pm/jha-flha/list.tsx
  src/pages/pm/jha-flha/editor.tsx
  app/pm/jha-flha/**
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```
