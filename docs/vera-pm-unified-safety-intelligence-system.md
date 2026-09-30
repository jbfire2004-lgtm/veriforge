# Vera PM Unified Safety Intelligence Engine (CAIL)

Master Context-Aware Intelligence Layer for the Vera Platform. Powers predictive analytics, scoring, pattern recognition, cross-module correlation, recommendations, and deterministic safety gating across all PM safety modules.

**Primary API:** `/api/v1/pm/unified-safety-intelligence`  
**Spec alias API:** `/api/v1/pm/cail`  
**UI:** `/pm/unified-safety-intelligence`  
**Developer pack:** `docs/vera-pm-unified-safety-intelligence-developer-pack.md`  
**Legacy VSI/CAIL entries:** `/api/v1/cail`, `/pm/safety-intelligence` (unchanged; unified layer orchestrates and persists structured intelligence)

**Design principles:** Zero hallucination tolerance on enforcement paths; all predictions/scores from deterministic rule + scoring engines; explainability required for every stored prediction; full audit via `cail_inference_logs` and `cail_model_audit`.

---

## 1. Backend architecture

### Intelligence stack (layers)

| Layer | Engine file | Responsibility |
|-------|-------------|----------------|
| Rule-based | `engines/rule-based.engine.ts` | CAPA overdue, critical hazards, weak controls, training lapse, access denials, incidents, equipment failures, emergency |
| Scoring | `engines/scoring.engine.ts` | Worker, equipment, project, company, hazard severity, control strength (0–100) |
| Predictive | `engines/predictive.engine.ts` | Incident likelihood, equipment failure, CAPA overdue, project risk, training lapse |
| Pattern recognition | `engines/pattern-recognition.engine.ts` | Chronic hazards, repeat deficiencies, weak controls, project drift |
| Correlation | `engines/correlation.engine.ts` | Hazard↔JHA, hazard↔incident, worker↔CAPA, equipment↔inspection, control↔CAPA |
| Recommendation | `engines/recommendation.engine.ts` | Actionable items with reason, evidence, confidence, required actions |
| Explainability | `engines/explainability.engine.ts` | Human-readable deterministic explanations |
| Safety gating | `engines/safety-gating.engine.ts` | Worker/equipment/zone/task/permit/JHA/PM blocks |
| Data ingestion | `engines/data-ingestion.engine.ts` | Normalize hazards/CAPA; detect missing/conflict/outlier/anomaly |

### Orchestration

```
pm-unified-safety-intelligence/
├── pm-unified-safety-intelligence.service.ts   # Pipeline orchestrator
├── pm-unified-safety-intelligence.controller.ts
├── pm-cail.controller.ts                       # spec alias /pm/cail
├── pm-unified-safety-intelligence.module.ts
├── pm-unified-safety-intelligence.scheduler.ts # Nightly batch @ 02:00
└── engines/*.ts
```

### Inference modes

| Mode | Trigger | Use case |
|------|---------|----------|
| `realtime` | POST `/inference/realtime` | Access scan, safety station, worker/equipment gate |
| `batch` | POST `/inference/batch`, cron | Project-wide scores, predictions, recommendations |
| `edge` | Safety station (via realtime + projectId) | Low-latency gate at station |
| `offline` | GET `/sync/bundle` | Cached predictions/scores on device |

### Model versioning

- Default model: `deterministic_rules_v1` (auto-provisioned per company)
- Tables: `cail_models`, `cail_model_versions`, `cail_model_audit`
- Deploy: `POST /models/:id/deploy` — Rollback: `POST /models/:id/rollback`

---

## 2. Database schema

Migration: `20260521290000_pm_unified_safety_intelligence`

### `cail_predictions`

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| companyId, projectId? | Int FK | Tenant isolation |
| entityType | `CailIntelEntityType` | worker, project, equipment, … |
| entityId | String | |
| predictionType | `CailIntelPredictionType` | incident_likelihood, capa_overdue, … |
| probability | Float | 0–1 |
| riskLevel | String | low, medium, high, critical |
| modelKey, modelVersion | String, Int | |
| inferenceMode | Enum | |
| factorsJson | Json | Deterministic factor codes |
| validUntil | DateTime? | Default 7d batch TTL |

**Indexes:** `(companyId, projectId, predictionType)`, `(entityType, entityId)`, `(createdAt)`

### `cail_scores`

| Field | Type |
|-------|------|
| scoreType | `CailIntelScoreType` (worker_safety, project_safety, …) |
| score, maxScore | Float (default max 100) |
| componentsJson | Json breakdown |

### `cail_recommendations`

| Field | Type |
|-------|------|
| recommendationType | Enum (control, training, corrective_action, …) |
| title, reason | Text |
| evidenceJson, requiredActionsJson | Json |
| confidence | Float 0–1 |
| status | open (default) |

### `cail_correlations`

Cross-module links: `leftModule`, `leftEntityId`, `rightModule`, `rightEntityId`, `strength` 0–1.

### `cail_explainability`

Full explainability record per prediction/score: `whyJson`, factor arrays, `recommendedActionsJson`, `confidence`.

### `cail_training_data`

Feature store for future ML: `featureJson`, `labelJson`, `qualityScore`.

### `cail_inference_logs`

Audit every inference run: `engineLayer`, `durationMs`, `payload`.

### `cail_offline_cache`

Bundle key: `cail_offline_{companyId}_{projectId|all}`.

**Partitioning:** partition `cail_inference_logs` and `cail_predictions` by `createdAt` monthly at scale.

**Soft delete:** `deletedAt` on predictions, scores, recommendations, correlations, models, training data.

---

## 3. API contract

Base: `/api/v1/pm/unified-safety-intelligence` — JWT + RBAC (WORKER+ read; SUPERVISOR+ batch/ingest/deploy).

### Dashboard & analytics

**GET `/dashboard?companyId=&projectId=`**  
Response: `{ metrics: { predictions7d, openRecommendations, correlations, companySafetyScore, projectSafetyScore }, modelKey }`

**GET `/analytics/trends?companyId=&projectId=`**  
Response: `{ leadingIndicators: { predictions30d, highRiskPredictions, inferenceRuns30d }, laggingIndicators, sifHecaTrend }`

### Intelligence outputs

**GET `/predictions?companyId=&projectId=&limit=`**  
**GET `/scores?companyId=&projectId=&scoreType=&limit=`**  
**GET `/recommendations?companyId=&projectId=&status=`**  
**GET `/correlations?companyId=&projectId=`**  
**GET `/explainability/:id`** — includes `humanReadable` text

### Inference

**POST `/inference/batch`** (Supervisor+)  
Body: `{ companyId, projectId }`  
Response: `{ violations[], projectScore, predictions[], recommendationsCreated, patterns[] }`  
Errors: `404` project, `400` invalid ids

**POST `/inference/realtime`**  
Body: `{ companyId, projectId, workerId?, equipmentId?, zoneCode? }`  
Response: `{ gate, workerScore, equipmentScore, modelKey }`

**POST `/enforcement/evaluate`** — same body; returns gate only

### Data pipeline

**POST `/ingest`** — normalize hazards + CAPA into `cail_training_data`  
**POST `/correlations/build`** — persist cross-module correlation rows

### Models

**GET `/models?companyId=`**  
**POST `/models/:modelId/deploy`** — `{ version }`  
**POST `/models/:modelId/rollback`** — `{ toVersion }`

### Offline

**GET `/sync/bundle?companyId=&projectId=`** — predictions, scores, recommendations, model versions

**POST `/sync/apply`** — upload offline predictions, scores, recommendations

### Spec alias (`/api/v1/pm/cail`)

| Method | Path | Maps to |
|--------|------|---------|
| GET | `/dashboard` | `getDashboard` |
| POST | `/predict` | `predict` |
| POST | `/score` | `score` |
| POST | `/recommend` | `recommend` |
| POST | `/correlate` | `buildCorrelations` |
| POST | `/explain` | `explain` |
| POST | `/model/train` | `trainModel` |
| POST | `/model/deploy` | `deployModel` |
| POST | `/model/rollback` | `rollbackModel` |
| POST | `/offline/infer` | `offlineInfer` |
| POST | `/offline/sync` | `applyOfflineSync` |
| GET | `/model/{id}` | `getModel` |

---

## 4. Frontend architecture

| Route | Screen |
|-------|--------|
| `/pm/unified-safety-intelligence` | Master dashboard — tabs: Overview, Predictions, Scores, Recommendations, Safety gating, Models |
| `/pm/safety-intelligence` | Legacy VSI (CAIL entries, inspections, BBO, copilot) |

**Libs:** `vera-frontend/lib/pm-unified-safety-intelligence.ts` (primary), `vera-frontend/lib/pm-cail.ts` (spec paths)

**Components:** KPI cards (company/project score), prediction list, score list, recommendation cards, gate evaluation panel.

**Offline:** `pmUnifiedSafetyIntelligence.sync` — download by default; upload when `predictions`, `scores`, or `recommendations` present.

**Nav:** PM module menu → “Unified CAIL”

---

## 5. Workflow logic

### Intelligence pipeline

```
Data ingestion → Normalization (quality report)
  → Rule evaluation (violations)
  → Scoring (worker/equipment/project)
  → Predictive models (probabilities)
  → Pattern detection
  → Correlations (optional build)
  → Recommendations (persist open)
  → Explainability records
  → Inference audit log
```

**Permissions:** Workers read dashboard/predictions; supervisors run batch, ingest, deploy models.

**Validations:** `companyId` required; `projectId` required for batch; realtime requires project scope.

### Model lifecycle

```
draft → training → validated → deployed
  → monitoring (inference logs)
  → drift detection (high-risk prediction rate vs baseline)
  → retraining (populate cail_training_data)
  → deployed OR rolled_back
```

### Real-time path

```
Safety station / access scan
  → POST /inference/realtime
  → Worker + equipment scores persisted
  → Gate evaluation
  → Block or allow (deterministic)
  → Optional auto-CAPA suggestions in gate.autoCapaSuggestions
```

### Offline path

```
GET /sync/bundle → IndexedDB
  → Field worker uses cached scores for offline gating
  → On reconnect: POST batch (supervisor) or pull fresh bundle
```

---

## 6. CAIL intelligence logic (deterministic)

### Worker Safety Score (0–100)

```
score = profileScore
  - min(30, overdueCapa × 10)
  - min(20, denials30d × 4)
  - min(25, sifExposures × 8)
```

### Project Safety Score

```
score = 100
  - min(25, overdueCapa × 8)
  - min(20, criticalHazards × 10)
  - min(15, openIncidents × 7)
  - max(0, 50 - closureRate) × 0.3
```

### Incident likelihood

```
p = 0.05
  + 0.22 if workerScore < 50
  + 0.15 if openCapa > 2
  + 0.20 if sifExposures > 0
  + 0.12 × min(3, incidents90d)
cap at 0.95
```

### CAPA overdue risk

```
p = 0.10 + 0.25 (if overdue) + 0.08×overdueCount + 0.15 (if due < 3d) + 0.12 (if escalation ≥ 3)
```

### Safety gating blocks

| Condition | Blocks |
|-----------|--------|
| Worker overdue CAPA | access, zone, task, PM schedule |
| Worker critical CAPA | access, JHA, permit |
| Worker score < 40 | access, zone |
| Equipment open CAPA | equipment access |
| Equipment score < 50 | equipment access |
| Project critical CAPA | task, PM schedule, permit |
| SIF hazards open | JHA approval |
| Emergency active | Suspends blocks; suggests post-emergency CAPA |

---

## 7. Offline mode logic

1. Pull bundle via `pmUnifiedSafetyIntelligence.sync`
2. Cache: predictions (100), scores (100), open recommendations, `modelKey` version map
3. Offline scoring uses last-known `cail_scores` rows (worker/equipment/hazard)
4. Offline gating applies same rules locally from cached scores + CAPA counts in bundle extension
5. Conflict: server batch inference wins on score regression; client timestamps logged in inference payload

---

## 8. Integration map

| Module | Ingestion source | Scoring | Prediction | Gating | Recommendations |
|--------|------------------|---------|------------|--------|-----------------|
| Company safety context | policies | company_safety | company_risk | — | policy compliance |
| Project safety context | config | project_safety | project_risk | task/permit | PM schedule |
| Worker safety profile | profile, training | worker_safety | worker_risk, training_lapse | worker access | training |
| Unified H&C | hazards, controls | hazard_severity, control_strength | hazard_emergence, sif_heca | JHA | control |
| JHA/FLHA | submissions | jha_quality | — | JHA approval | jha_improvement |
| SIF/HECA | events | — | sif_heca_potential | supervisor review | — |
| Inspections | deficiencies | inspection_quality | — | — | inspection_focus |
| Incidents | events | incident_severity | incident_likelihood | — | corrective_action |
| Corrective actions | CAPA | capa_priority | capa_overdue | all enforcement | corrective_action |
| Equipment | failures, status | equipment_safety | equipment_failure | equipment access | maintenance |
| SDS | gaps | — | — | — | sds_update |
| Training | records | — | training_lapse | worker access | training |
| Site access | attempts | access_compliance | access_denial | zone access | — |
| Safety stations | scans | — | — | edge realtime | — |
| Emergency | events | emergency_readiness | emergency_likelihood | suspend/restore | emergency_plan |
| PM Module | tasks | — | schedule_delay | task start | pm_schedule_adjustment |

---

## 9. Analytics & dashboards

### Leading indicators (30d)

- `predictions30d`, `highRiskPredictions`, `inferenceRuns30d`, `recommendations30d`

### Lagging indicators

- `scoresComputed30d`, closure rates from CAPA module

### Trends

- SIF/HECA: high-risk prediction count
- Worker/equipment/project/company score time series from `cail_scores.computedAt`

### Dashboard UI sections

- Overview KPIs
- Predictions tab (type, entity, probability, risk level)
- Scores tab (score type, entity, value)
- Recommendations tab (reason, confidence, type)
- Gating tab (evaluate project gate)
- Models tab (active model key, deploy/rollback API reference)

---

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Stop dev server on Windows before `prisma generate` if EPERM locks the client.
