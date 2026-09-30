# Unified Safety Intelligence Engine (CAIL) — Developer-Ready Pack

Master Context-Aware Intelligence Layer for predictive analytics, multi-entity safety scoring, pattern recognition, cross-module correlation, recommendations, deterministic safety gating, model versioning, and offline inference across all PM safety modules.

**Primary API:** `/api/v1/pm/unified-safety-intelligence`  
**Spec alias API:** `/api/v1/pm/cail`  
**Legacy API/UI:** `/api/v1/cail`, `/pm/safety-intelligence` (VSI entries; unified layer persists structured intelligence)  
**UI:** `/pm/unified-safety-intelligence`  
**Offline sync:** `pmUnifiedSafetyIntelligence.sync` (download + upload)  
**Backend:** `backend/src/pm-unified-safety-intelligence/`  
**Migration:** `20260521290000_pm_unified_safety_intelligence`

**Design principles:** Zero hallucination on enforcement paths; deterministic rule + scoring engines; explainability for stored predictions; full audit via `cail_inference_logs` and `cail_model_audit`.

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| cail-core-service | `PmUnifiedSafetyIntelligenceService` orchestrator |
| cail-data-ingestion-service | `CailDataIngestionEngine` + `ingestProjectData` |
| cail-prediction-service | `CailPredictiveEngine` + `predict`, `runBatchInference` |
| cail-scoring-service | `CailScoringEngine` + `score`, `persistScore` |
| cail-pattern-recognition-service | `CailPatternRecognitionEngine` (batch pipeline) |
| cail-correlation-service | `CailCorrelationEngine` + `buildCorrelations` / `correlate` |
| cail-recommendation-service | `CailRecommendationEngine` + `recommend` |
| cail-explainability-service | `CailExplainabilityEngine` + `explain`, `getExplainability` |
| cail-realtime-service | `runRealtimeInference`, `evaluateSafetyGate` |
| cail-offline-inference-service | `offlineInfer`, `applyOfflineSync`, `buildOfflineBundle` |
| cail-model-training-service | `trainModel` (feature store ingest + version bump) |
| cail-model-versioning-service | `cail_models`, `cail_model_versions` |
| cail-model-monitoring-service | `cail_inference_logs`, dashboard metrics |
| cail-model-drift-service | Pattern engine + `projectSafetyDrift` (deterministic) |
| cail-inference-logging-service | `logInference` → `cail_inference_logs` |
| audit-service | `cail_model_audit` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Rule-Based Engine | `rule-based.engine.ts` | Violations: CAPA, hazards, training, access, incidents, emergency |
| Scoring Engine | `scoring.engine.ts` | Worker, equipment, project, company scores (0–100) |
| Predictive Engine | `predictive.engine.ts` | Incident, equipment failure, CAPA overdue, project risk |
| Pattern Recognition Engine | `pattern-recognition.engine.ts` | Chronic hazards, repeat deficiencies, drift |
| Correlation Engine | `correlation.engine.ts` | Hazard↔JHA, control↔CAPA, cross-module links |
| Recommendation Engine | `recommendation.engine.ts` | Actionable items with evidence + confidence |
| Explainability Engine | `explainability.engine.ts` | Deterministic human-readable explanations |
| Real-Time Inference Engine | `runRealtimeInference` | Worker/equipment scores + safety gate |
| Offline Inference Engine | `offlineInfer`, `applyOfflineSync` | Cached bundle + client replay |
| Model Training Pipeline | `trainModel` | Ingest → `cail_training_data` → new version |
| Model Versioning Engine | `deployModel`, `rollbackModel` | Active version + audit trail |
| Model Drift Detection | Pattern + trend analytics | Repeat deficiencies, score drift |
| Model Rollback Engine | `rollbackModel` | Revert `activeVersion` |

### Module wiring

- Controllers: `PmUnifiedSafetyIntelligenceController`, `PmCailController`
- Scheduler: `pm-unified-safety-intelligence.scheduler.ts` (nightly batch @ 02:00)
- Default model: `deterministic_rules_v1` (auto-provisioned per company)

---

## 2. Database schema

### `cail_predictions` → `CailPrediction`

| Spec field | Vera column |
|------------|-------------|
| company_id | `companyId` |
| project_id | `projectId` |
| worker_id | `entityType=worker`, `entityId` |
| equipment_id | `entityType=equipment`, `entityId` |
| module_type | `entityType` |
| prediction_type | `predictionType` |
| prediction_value | `probability` |
| confidence | derived from `probability` / `riskLevel` |
| created_at | `createdAt` |

### `cail_scores` → `CailScore`

| Spec field | Vera column |
|------------|-------------|
| score_type | `scoreType` |
| score_value | `score` |
| contributing_factors | `componentsJson` |

### `cail_recommendations` → `CailRecommendation`

| Spec field | Vera column |
|------------|-------------|
| recommendation_type | `recommendationType` |
| recommendation_text | `title` + `reason` |
| evidence | `evidenceJson` |
| confidence | `confidence` |

### `cail_correlations` → `CailCorrelation`

| Spec field | Vera column |
|------------|-------------|
| correlation_type | `correlationType` |
| source_module | `leftModule` |
| target_module | `rightModule` |
| correlation_strength | `strength` |
| evidence | `evidenceJson` |

### `cail_explainability` → `CailExplainability`

| Spec field | Vera column |
|------------|-------------|
| prediction_id | `predictionId` (optional) |
| explanation_text | `summary` + `humanReadable` |
| contributing_data | `whyJson`, factor JSON arrays |

### `cail_models` → `CailModel`

| Spec field | Vera column |
|------------|-------------|
| model_name | `name` / `modelKey` |
| model_type | `algorithm` on version |
| current_version | `activeVersion` |
| status | `status` (deployed, rolled_back, …) |

### `cail_model_versions` → `CailModelVersion`

| Spec field | Vera column |
|------------|-------------|
| version | `version` |
| metadata | `parametersJson`, `metricsJson` |
| trained_at | `createdAt` |
| deployed_at | `deployedAt` |
| rolled_back_at | audit `eventType=rolled_back` |

### `cail_model_audit` → `CailModelAudit`

| Spec field | Vera column |
|------------|-------------|
| event_type | `eventType` |
| event_data | `payload` |
| timestamp | `createdAt` |

### `cail_training_data` → `CailTrainingData`

| Spec field | Vera column |
|------------|-------------|
| dataset_reference | `sourceModule` + `sourceId` |
| feature_set | `featureJson` |
| label_set | `labelJson` |

### `cail_inference_logs` → `CailInferenceLog`

| Spec field | Vera column |
|------------|-------------|
| input_data | `payload`, `inputHash` |
| output_data | `outputSummary` |
| latency_ms | `durationMs` |

### Supporting

- `cail_offline_cache` — offline bundles (`cacheKey: cail_offline_{companyId}_{projectId|all}`)

---

## 3. API contract

### Spec paths (`/api/v1/pm/cail`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Intelligence dashboard metrics |
| POST | `/predict` | Run predictive models; persist predictions |
| POST | `/score` | Compute worker/equipment/project/company scores |
| POST | `/recommend` | Generate recommendations from rule violations |
| POST | `/correlate` | Build cross-module correlation rows |
| POST | `/explain` | Fetch or generate explainability record |
| POST | `/model/train` | Ingest training features + new model version |
| POST | `/model/deploy` | Deploy model version (`modelId`, `version`) |
| POST | `/model/rollback` | Rollback to version (`modelId`, `toVersion`) |
| POST | `/offline/infer` | Realtime inference + optional local replay + bundle |
| POST | `/offline/sync` | Upload local predictions/scores/recommendations |
| GET | `/model/{id}` | Model detail + versions + audit |

### Primary paths (`/api/v1/pm/unified-safety-intelligence`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Same as spec |
| GET | `/analytics/trends` | Leading/lagging indicators (30d) |
| GET | `/predictions`, `/scores`, `/recommendations`, `/correlations` | List outputs |
| GET | `/explainability/:id` | Explainability + `humanReadable` |
| GET | `/models`, `/models/:modelId` | Model registry |
| POST | `/inference/batch` | Full project pipeline |
| POST | `/inference/realtime` | Realtime gate + scores |
| POST | `/enforcement/evaluate` | Safety gate only |
| POST | `/ingest` | Normalize hazards/CAPA → training data |
| POST | `/correlations/build` | Persist correlations |
| POST | `/models/:modelId/deploy` | Deploy |
| POST | `/models/:modelId/rollback` | Rollback |
| GET | `/sync/bundle` | Offline download |
| POST | `/sync/apply` | Offline upload |

### Frontend clients

- Spec: `vera-frontend/lib/pm-cail.ts`
- Primary: `vera-frontend/lib/pm-unified-safety-intelligence.ts`

---

## 4. Frontend architecture

### Screens (UI route `/pm/unified-safety-intelligence`)

| Screen | Purpose |
|--------|---------|
| Intelligence Dashboard | Overview KPIs, company/project scores |
| Worker Risk Dashboard | Worker scores + incident likelihood |
| Equipment Risk Dashboard | Equipment scores + failure predictions |
| Project Risk Dashboard | Project score + CAPA overdue risk |
| Company Risk Dashboard | Company aggregate score |
| Hazard/Control Intelligence | Cross-links via correlations (future tab) |
| Predictive Analytics | Predictions list + batch run |
| Recommendation Console | Open recommendations |
| Explainability Viewer | `explainability/:id` detail |
| Model Version Manager | Deploy / rollback |
| Model Training Console | Train + ingest |

### Components (recommended / partial)

- `RiskScoreCard`, `PredictionCard`, `RecommendationCard`, `CorrelationGraph`
- `ExplainabilityPanel`, `ModelVersionCard`, `DriftIndicator`, `PatternHeatmap`

Nav: PM module menu → Unified CAIL

---

## 5. Workflow logic

### Intelligence flow

```
Data ingestion → Normalization → Rule evaluation → Scoring → Predictive models
  → Pattern detection → Correlations → Recommendations → Safety gating → Audit
```

### Model training flow

```
Data prep (ingestProjectData) → Feature rows in cail_training_data
  → trainModel (new version) → Validation (metricsJson) → deployModel
  → Monitoring (inference logs) → Drift (patterns/trends) → rollbackModel (if needed)
```

### Real-time flow

```
Worker/equipment scan → POST /inference/realtime or /cail/offline/infer
  → Safety gate decision → Override (pm_capa_overrides elsewhere) → Audit log
```

### Offline flow

```
Download bundle → Local inference/scoring → Upload via offline/sync
  → Server merge → Conflict: server status wins on regression
```

---

## 6. CAIL intelligence logic

### Predictive models (`CailPredictiveEngine`)

| Model | Method | Output |
|-------|--------|--------|
| Incident likelihood | `incidentLikelihood` | probability, riskLevel |
| Equipment failure | `equipmentFailure` | probability, riskLevel |
| CAPA overdue | `capaOverdueRisk` | probability, riskLevel |
| Project risk | `projectRisk` | probability, riskLevel |
| Training lapse | via rule violations | recommendation |
| Access denial | signals in rules | violation |
| SIF/HECA | `sifHazardOpen` in gating | gate blocker |

### Scoring engines (`CailScoringEngine`)

| Score | Range | Inputs |
|-------|-------|--------|
| Worker safety | 0–100 | profile, overdue CAPA, denials, SIF exposure |
| Equipment safety | 0–100 | status, lockout, CAPA, failures |
| Project safety | 0–100 | CAPA, hazards, incidents, closure rate |
| Company safety | 0–100 | aggregate of project scores |
| Hazard severity | batch | unified hazard severity |
| Control strength | batch | control strength + links |

### Pattern recognition

- Chronic hazards, repeat deficiencies (`repeatDeficiencies`)
- Weak controls (rule + H&C links)
- Project safety drift (`projectSafetyDrift`)

### Correlation engine

- Hazard ↔ JHA, hazard ↔ CAPA (control links)
- Extensible via `buildCorrelations`

### Recommendation engine

Types: control, training, corrective_action, equipment_maintenance, jha_improvement, inspection_focus, emergency_plan, sds_update, worker_assignment, equipment_assignment, pm_schedule_adjustment

---

## 7. Offline mode

**Download:** `GET /sync/bundle` or field handler without upload payload.

Bundle: predictions, scores, open recommendations, `modelKey`, `builtAt`.

**Upload:** `POST /cail/offline/sync` or `POST /sync/apply` with:

```json
{
  "companyId": 1,
  "projectId": 1,
  "predictions": [{ "predictionType": "project_risk", "entityId": "1", "probability": 0.42 }],
  "scores": [{ "scoreType": "worker_safety", "entityId": "5", "score": 72 }],
  "recommendations": [{ "title": "Close overdue CAPA", "reason": "...", "confidence": 0.85 }]
}
```

**Infer:** `POST /cail/offline/infer` runs realtime gate + returns `serverState` bundle; optional `localScores` / `localPredictions` replay first.

Field action `pmUnifiedSafetyIntelligence.sync` — download by default; upload when `predictions`, `scores`, or `recommendations` present.

---

## 8. Integration map

| Module | CAIL integration |
|--------|------------------|
| Company Safety Context | Company score, policy violations |
| Project Safety Context | Project score, hazard forecast |
| Worker Safety Profiles | Worker score, training lapse predictions |
| Unified Hazard & Control | Hazard/control scores, weak control patterns |
| JHA / FLHA | JHA quality, hazard↔JHA correlations |
| SIF/HECA | High-risk predictions, gate blocks |
| Inspections | Repeat deficiency patterns, inspection focus recs |
| Incidents | Incident likelihood, correlations |
| Corrective Actions | CAPA overdue risk, recommendations |
| Equipment Safety | Equipment score, failure likelihood |
| SDS | SDS update recommendations |
| Training | Training lapse violations |
| Site Access | Access denial likelihood |
| Safety Stations | Realtime inference @ edge |
| Emergency Response | Emergency active suspends some gates |
| PM Module | Task/permit/scheduling gate blocks |

---

## 9. Analytics

`GET /analytics/trends` returns:

| Metric | Source |
|--------|--------|
| Predictive trends | `cail_predictions` 30d count, high-risk count |
| Risk trends | `cail_scores` 30d |
| Hazard/control trends | Unified H&C + correlations |
| Worker/equipment score trends | Latest `cail_scores` by entity |
| Project/company score trends | Dashboard + score history |
| Leading indicators | predictions30d, highRiskPredictions, inferenceRuns30d |
| Lagging indicators | scoresComputed30d |
| SIF/HECA trends | highRiskPreds proxy |

---

## Quick start

```bash
# Dashboard
GET /api/v1/pm/cail/dashboard?companyId=1&projectId=1

# Predict + score
POST /api/v1/pm/cail/predict
{ "companyId": 1, "projectId": 1, "workerId": 5 }
POST /api/v1/pm/cail/score
{ "companyId": 1, "projectId": 1, "scoreType": "project_safety" }

# Batch pipeline (primary API)
POST /api/v1/pm/unified-safety-intelligence/inference/batch
{ "companyId": 1, "projectId": 1 }

# Offline sync (field)
# action: pmUnifiedSafetyIntelligence.sync
# payload: { companyId: 1, projectId: 1 }  # download
# payload: { companyId: 1, projectId: 1, scores: [...] }  # upload
```

See also: `docs/vera-pm-unified-safety-intelligence-system.md`
