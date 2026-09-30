# SIF / HECA — Developer-Ready Pack

Serious Injury & Fatality (SIF) potential and High-Energy Control Analysis (HECA) engine for the Vera PM platform.

**API base:** `/api/v1/pm/sif-heca`  
**UI:** `/pm/sif-heca`  
**Offline sync:** `sifHeca.sync`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| sif-heca-service | `SifHecaService` |
| energy-mapping-service | `SifScoringEngine` + `SIF_ENERGY_WHEEL` constants |
| hazard-engine-service | Scoring input (severity × likelihood) + ingestion payloads |
| cail-inference-service | `SifHecaCailService` → `CailEmitterService` |
| corrective-action-service | `SifHecaCorrectiveAction` + `PmCapaAutoGenerateService.fromSifHecaEvent` |

### Core engines (`backend/src/sif-heca/`)

| Component | File | Responsibility |
|-----------|------|----------------|
| SIF Detection Engine | `sif-scoring.engine.ts` | 0–100 score, category, explainability rules |
| HECA Classification Engine | `heca-classification.engine.ts` | Keyword + energy match → HECA category |
| Energy Wheel Mapper | `sif-heca.constants.ts` (`SIF_ENERGY_WHEEL`, `HIGH_ENERGY_TYPES`) | gravity, mechanical, electrical, pressure = high energy |
| SIF Trigger Engine | `SifScoringEngine` + `SIF_INDICATORS` library | Indicator weights, supervisor review triggers |
| High-Energy Hazard Engine | `highEnergyFlag` in HECA + energy component in SIF | |
| SIF Corrective Action Generator | `generateCorrectiveActions()` + CAPA auto-gen | CAIL entries + `sif_heca_corrective_action` rows |

### Ingestion (`SifHecaIngestionService`)

| Source | Method |
|--------|--------|
| JHA/FLHA | `ingestFromJhaFlha` — one event per hazard |
| Inspections | `ingestFromInspectionItem` — at_risk items |
| Safety forms | `ingestFromSafetyForm` — sif/heca flags |
| Incidents / equipment | via manual `ingest()` with sourceType |

### Module (`sif-heca.module.ts`)

Exports `SifHecaService`, `SifHecaIngestionService`; imported by `JhaFlhaModule`, `PmCorrectiveActionsModule`.

---

## 2. Database schema

Spec `sif_events` → **`sif_heca_event`** (`SifHecaEvent`)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| companyId, projectId | Int FK | Multi-tenant |
| siteId, workerId, equipmentId | Int? | Context |
| sourceType | `SifHecaSourceType` | jha_flha, inspection, incident, equipment, safety_form, bbo, … |
| sourceId, sourceItemId | String | Unique per source tuple |
| status | enum | ingested → scored → review_required → approved/rejected/closed |
| title, description | Text | |
| rawPayload | Json | hazard snapshot, form data, etc. |
| deletedAt | DateTime? | Soft delete |

Related score tables (normalized vs single-row spec):

### `sif_score` (spec: sif_score on event)

| Field | Notes |
|-------|-------|
| sifScore | 0–100 |
| sifCategory | low, medium, high, critical |
| severityComponent … historyComponent | Explainable breakdown |
| requiredControls, requiredActions | Json arrays |
| explainability | Json rule list |
| requiresSupervisorReview | Bool |

### `heca_score` (spec: heca_category on event)

| Field | Notes |
|-------|-------|
| hecaCategoryCode, hecaCategoryLabel | HECA classification |
| severity, likelihood, hecaRiskScore | |
| highEnergyFlag | High-energy hazard |
| requiredControls, requiredCorrective | Json |
| explainability | Json |

### `sif_heca_corrective_action` (spec: `sif_corrective_actions`)

| Field | Notes |
|-------|-------|
| eventId | sif_event_id |
| correctiveActionId | **PM unified CAPA id** (`PmCorrectiveAction`) |
| cailEntryId | Legacy CAIL entry link |
| title, description, status, dueAt | |

### Supporting tables

- `sif_heca_link` — cross-module correlation
- `sif_heca_audit` — audit trail
- `sif_indicator` — SIF indicator library
- `heca_category` — HECA category library

**Indexes:** `(projectId, status)`, `(companyId, createdAt)`, unique `(sourceType, sourceId, sourceItemId)`

Migration: `20260521310000_sif_heca_capa_link` — `correctiveActionId` on corrective action rows.

---

## 3. API contract

Base: `/api/v1/pm/sif-heca` — JWT + PM roles.

### Evaluate (spec: `POST /sif/evaluate`) — dry run, no persist

**POST `/evaluate`**

```json
{
  "companyId": 1,
  "projectId": 1,
  "title": "Overhead lift near personnel",
  "description": "Crane swing zone with ground crew",
  "hazardSeverity": 4,
  "hazardLikelihood": 4,
  "energyTypes": ["gravity", "mechanical"],
  "controls": [
    { "controlType": "administrative", "adequate": true, "effectivenessScore": 4, "verified": false }
  ]
}
```

**Response:**

```json
{
  "sif_score": 62,
  "sif_category": "high",
  "heca_category": "line_of_fire",
  "heca_category_label": "Line of fire",
  "heca_risk_score": 16,
  "high_energy_flag": true,
  "requires_supervisor_review": true,
  "required_controls": ["Establish exclusion zone and spotter", "..."],
  "required_corrective_actions": ["Supervisor review required before work proceeds"],
  "explainability": { "sif": [...], "heca": [...] },
  "control_findings": []
}
```

Errors: `400` invalid body, `401` unauthorized.

### Score & persist (ingest + score)

**POST `/score`** — same body as evaluate + optional `sourceType`, `sourceId`, `workerId` → creates/updates `sif_heca_event`, upserts `sif_score` + `heca_score`, may generate CAPA.

### Events

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events?projectId=` | List with scores |
| GET | `/events/:id` | Full event + audit |
| POST | `/events/:id/review` | approve \| reject \| request_changes |

### Ingestion shortcuts

| Method | Path |
|--------|------|
| POST | `/ingest/jha-flha/:jhaFlhaId` |
| POST | `/ingest/safety-form/:formId` |

### Libraries & utilities

| Method | Path |
|--------|------|
| GET | `/energy-wheel` | SIF energy segments (high-energy highlighted) |
| GET | `/library/indicators?companyId=` |
| GET | `/library/heca-categories?companyId=` |
| GET | `/analytics/project/:projectId` |
| GET | `/access/worker?workerId=&projectId=` |
| POST | `/sync` | Offline idempotent ingest |

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/sif-heca` | SIF + HECA dashboard, energy wheel, event list | `dashboard.tsx` |
| `/pm/sif-heca/[id]` | SIF event viewer + supervisor review | `detail.tsx` |

**Lib:** `vera-frontend/lib/sif-heca.ts`

| Function | API |
|----------|-----|
| `evaluateSifHeca` | POST `/evaluate` (dry run) |
| `scoreSifHeca` | POST `/score` (persist) |
| `fetchSifEnergyWheel` | GET `/energy-wheel` |
| `fetchSifHecaAnalytics` | GET `/analytics/project/:id` |
| `syncSifHecaOffline` | POST `/sync` |

### UI components (implemented)

| Spec | Implementation |
|------|----------------|
| SIF Dashboard | KPI cards: events, high SIF, avg score, project index |
| HECA Dashboard | HECA distribution panel |
| Energy Wheel UI | Segment chips (high-energy styled) |
| SIF Event Viewer | Detail page with scores + approve/reject |

---

## 5. Workflow logic

### Pipeline

```
Hazard input (severity, likelihood, energy types, controls)
  → Energy mapping (HIGH_ENERGY_TYPES, SIF_ENERGY_WHEEL)
  → Control effectiveness (missing/weak/PPE-only)
  → SIF score (0–100) + category
  → HECA classify (keywords + energy → category)
  → Status: scored | review_required
  → If high/critical or missing controls → corrective actions + CAPA
  → Supervisor review → approved | rejected
```

### Status machine

| Status | Meaning |
|--------|---------|
| ingested | Created, not yet scored |
| scored | Scored, no review required |
| review_required | SIF high/critical or missing controls |
| approved | Supervisor approved |
| rejected | Rejected |
| closed | Archived (manual/extension) |

### Validations

- **Supervisor review:** `requiresSupervisorReview` from SIF engine (score ≥ 50 category high/critical, high energy, missing controls)
- **Worker access:** blocked if open critical/high events or open SIF corrective actions
- **CAPA gate:** unified CAPA may block JHA approval when SIF-linked CAPA open

---

## 6. CAIL intelligence logic

### Bridge: `SifHecaCailService`

Emits `CailEntry` per required corrective action title (source `sif`).

### Unified CAIL (`PmUnifiedSafetyIntelligence`)

- Prediction type: `sif_heca_potential`
- Batch scoring uses project SIF metrics
- Insights: critical open SIF events block permits/JHA

### SIF scoring rules (deterministic)

| Rule | Max points |
|------|------------|
| hazard_severity | 25 |
| hazard_likelihood | 20 |
| energy_exposure (high energy types) | 20 |
| missing_controls | 15 |
| weak_controls | 10 |
| control strength deficit | up to 25 |
| competency_gap | 10 |
| equipment_condition | 10 |
| environment | 8 |
| incident_history | 12 |

**Categories:** critical ≥75, high ≥50, medium ≥25, low <25

### HECA classification

- Match description keywords + energy types against `heca_category` library (or `HECA_CATEGORIES` seed)
- Best-scoring category wins
- `highEnergyFlag` if energy ∈ {gravity, mechanical, electrical, pressure}

### Weak control detection (`ControlEffectivenessEngine`)

- High risk (≥12) with zero controls → missing
- Only PPE on high risk → weak
- adequate=false or effectiveness < 3 → weak
- Unverified controls on high risk → finding

---

## 7. Offline mode

### Local capabilities

- `GET /energy-wheel` cached on dashboard load
- `GET /library/indicators`, `/library/heca-categories` for offline libraries
- `POST /evaluate` can run server-side only today; **offline scoring** mirrors server rules in client by caching last evaluate response per hazard (roadmap: port `SifScoringEngine` to TS)

### Sync

**POST `/sync`**

```json
{
  "clientSyncId": "uuid",
  "companyId": 1,
  "projectId": 1,
  "sourceType": "jha_flha",
  "sourceId": "local-jha-1",
  "title": "Field observation",
  "hazardSeverity": 3,
  "hazardLikelihood": 4,
  "energyTypes": ["gravity"]
}
```

Handler: `sifHeca.sync` in `vera-frontend/lib/field/sync-handlers.ts`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| JHA/FLHA | Auto ingest on submit; `ingestFromJhaFlha`; sets `hecaCategoryKey` on JHA via scoring pipeline |
| Inspections | `ingestFromInspectionItem` for at_risk polarity |
| Incidents | Manual ingest `sourceType: incident` |
| Equipment | `equipmentId` on event; equipment component in SIF score |
| Corrective actions | `PmCapaAutoGenerateService.fromSifHecaEvent`; `correctiveActionId` on bridge table |
| Worker safety | `workerAccessCheck` |
| Site access | Worker access gate uses SIF open events |
| PM Module | Events scoped by projectId |
| Safety stations | Realtime access check endpoint |
| Unified CAIL | Predictions + enforcement |
| Legacy CAIL | `cailEntryId` on corrective action rows |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| totalEvents | All-time count |
| events90d | Last 90 days |
| sifHighCount | high + critical categories |
| highEnergyCount | hecaScore.highEnergyFlag |
| averageSifScore | Mean SIF score |
| hecaDistribution | Count by hecaCategoryCode |
| sourceDistribution | Count by sourceType (jha_flha, inspection, …) |
| projectSifScore | min(100, avg + sifHigh×5) |
| leadingIndicators.sifRatePct | % high SIF |
| leadingIndicators.highEnergyRatePct | % high energy |
| laggingIndicators.reviewRequired | Open review queue |
| laggingIndicators.openCorrective | Open SIF corrective rows |

### Trends (leading / lagging)

- **Leading:** SIF rate, high-energy rate, 90d event volume
- **Lagging:** review_required backlog, open corrective actions

---

## File index

```
backend/src/sif-heca/
  sif-heca.service.ts
  sif-heca.controller.ts
  sif-heca-ingestion.service.ts
  sif-heca-cail.service.ts
  sif-scoring.engine.ts
  heca-classification.engine.ts
  control-effectiveness.engine.ts
  sif-heca.constants.ts

vera-frontend/
  lib/sif-heca.ts
  src/pages/pm/sif-heca/dashboard.tsx
  src/pages/pm/sif-heca/detail.tsx
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```
