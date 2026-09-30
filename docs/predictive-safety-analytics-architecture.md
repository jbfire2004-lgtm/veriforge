# Predictive Safety Analytics Engine — Architecture

*Vera Platform · May 2026*

---

## Overview

The Predictive Safety Analytics Engine (`PmPredictiveSafetyAnalyticsModule`) unifies safety data from inspections, incidents, corrective actions, worker training, and equipment history into a **weighted risk scoring model** (`predictive_safety_v1`), produces a **7-day weekly risk forecast**, dispatches **automated alerts**, and generates **preventive action recommendations** persisted to CAIL intel tables.

It orchestrates existing CAIL engines (`CailDataIngestionEngine`, `CailScoringEngine`, `CailPredictiveEngine` patterns) without duplicating microservice `cail-*` services.

---

## 1. Data ingestion architecture

```
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ PmInspection    │  │ PmSafetyEvent│  │ PmCorrectiveAction│
│ + deficiencies  │  │ + injuries   │  │ + subcontractor   │
│ + photo findings│  │              │  │                   │
└────────┬────────┘  └──────┬───────┘  └─────────┬─────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             ▼
              PredictiveFeatureExtractionService
                   (90-day rolling window)
                             ▼
              CailDataIngestionEngine.normalize()
                             ▼
                   cail_training_data (ML features)
```

### Feature extractors (`feature-extraction.service.ts`)

| Source module | Features extracted |
|---------------|-------------------|
| `inspection` | Deficiency count/severity, photo findings, site |
| `incident` | Risk score, severity, SIF link, site |
| `corrective_action` | Overdue flag, severity, subcontractor |
| `training` | Expired/invalid training per worker |
| `equipment` | Failures in window, site |

---

## 2. ML pipeline (`ml-pipeline.service.ts`)

| Stage | Action |
|-------|--------|
| 1. Extract | `PredictiveFeatureExtractionService.extract()` |
| 2. Normalize | `CailDataIngestionEngine` — quality tags, outliers |
| 3. Persist features | `CailTrainingData` rows |
| 4. Score & predict | `RiskScoringModelEngine` (logistic-style v1) |
| 5. Persist intel | `CailScore`, `CailPrediction`, `CailRecommendation` |
| 6. Forecast | `WeeklyForecastEngine` → `PmPredictiveSafetyForecast` |
| 7. Alert | `PredictiveAlertsService` → `NotificationsService` |

**Model key:** `predictive_safety_v1` (deterministic weighted model; training data collected for future ML upgrade)

---

## 3. Risk scoring model (`risk-scoring-model.engine.ts`)

### Entity types predicted

| Type | Inputs | Output |
|------|--------|--------|
| **Worker** | Profile score, overdue CAPA, incidents 90d, training gaps, access denials, medical blocks | `EntityRiskScore` 0–100 |
| **Contractor** | Deficiencies, overdue dispatches, open CAPA, photo findings, completion rate | Subcontractor company risk |
| **Task** | JHA risk score, hazards, unsigned crew, staleness, SIF potential | Per `JhaFlha` record |
| **Location** | Site incidents, deficiencies, access denials | Per `Site` |

Risk levels: `low` (<35), `medium` (35–54), `high` (55–74), `critical` (≥75)

---

## 4. Weekly risk forecast (`weekly-forecast.engine.ts`)

- 7-day projection from base project risk index
- Weekday adjustments (Mon/Fri elevated activity risk)
- Trend vs prior week (`improving` | `stable` | `worsening`)
- Persisted in `pm_predictive_safety_forecast`

---

## 5. Automated alerts (`predictive-alerts.service.ts`)

| Type | Trigger |
|------|---------|
| `predictive.weekly_forecast` | Overall risk `high` or `critical` |
| `predictive.worker_risk` | Critical worker scores |
| `predictive.contractor_risk` | High/critical contractor scores |
| `predictive.preventive_action` | Critical preventive recommendations |

Recipients: supervisors, company admins, project managers, safety admins.

---

## 6. API endpoints

Base: `/api/v1/pm/predictive-safety-analytics`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bundle` | Full analytics bundle (runs pipeline if no forecast exists) |
| `POST` | `/run` | Execute full pipeline (`?notify=true`) |
| `GET` | `/forecasts` | Historical weekly forecasts |
| `GET` | `/features/preview` | Raw extracted features (supervisor+) |

---

## 7. Schedulers

| Cron | Job |
|------|-----|
| `0 6 * * 1` (Mon 06:00) | Weekly forecast + alerts for active projects |
| `0 3 * * *` (daily 03:00) | Nightly refresh without alerts |

---

## 8. Frontend dashboard

Route: `/pm/predictive-safety-analytics`

- Overall risk index card with level coloring
- KPI metrics (workers, contractors, tasks, locations)
- 7-day bar chart forecast
- Ranked risk lists per entity type
- Preventive actions panel
- **Refresh** / **Run & alert** buttons

Client: `vera-frontend/lib/pm-predictive-safety-analytics.ts`

---

## 9. Integration with existing CAIL

Scores and predictions write to unified `cail_scores` / `cail_predictions` with `modelKey: predictive_safety_v1`.

Recommendations write to `cail_recommendations` for supervisor action tracking.

Link from dashboard to `/pm/unified-safety-intelligence` for deep CAIL drill-down.
