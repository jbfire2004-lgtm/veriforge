# Vera SIF / HECA Engine — Production Architecture

**API:** `/api/v1/pm/sif-heca` · **Code:** `backend/src/sif-heca/`

## Overview

Deterministic, explainable SIF (Serious Injury & Fatality) and HECA (High-Energy Control Assessment) engine. All hazards from JHA/FLHA, inspections, forms, and BBO normalize into `sif_heca_event` rows with versioned `sif_score` and `heca_score` records.

## Database

| Table | Role |
|-------|------|
| `sif_indicator` | Company/project SIF trigger library |
| `heca_category` | HECA category + keyword patterns |
| `sif_heca_event` | Unified ingest hub (idempotent by source) |
| `sif_score` | SIF 0–100 + category + explainability JSON |
| `heca_score` | HECA classification + high-energy flag |
| `sif_heca_link` | Cross-source correlation |
| `sif_heca_corrective_action` | Local CAPA + `cailEntryId` |
| `sif_heca_audit` | Append-only audit |

## Scoring model (deterministic)

**Inputs:** hazard severity/likelihood, energy types, control strength, competency gap, equipment, environment, incident history, missing/weak controls.

**Outputs:** `sifScore` 0–100, `sifCategory` (low/medium/high/critical), `requiresSupervisorReview`, `requiredControls[]`, `explainability[]` (rule, points, detail).

**Thresholds:** review required at high/critical or high-energy; CAIL emit on high/critical or missing controls.

## HECA classification

Maps hazard text + energy wheel to categories: eyes_on_task, line_of_fire, balance_fall, body_position, tools_equipment, procedures.

## Ingestion pipeline

| Source | Trigger |
|--------|---------|
| JHA/FLHA submit | `ingestFromJhaFlha` per hazard |
| Safety form | `sifFlag` or `hecaFlag` on submit |
| Inspection at-risk | `ingestFromInspectionItem` |
| BBO at-risk | `ingestFromBbo` |

## Integrations

- **CAIL:** Auto CAPA via `SifHecaCailService`
- **Site access:** `workerAccessCheck` blocks open high/critical SIF events and open CAPA
- **Offline:** `POST /sync`
- **UI:** `/pm/sif-heca` dashboard + event detail with supervisor review

## Workflow

```
ingested → scored → review_required (if threshold) → approved | rejected
```

Supervisor: `POST /events/:id/review` with approve/reject/request_changes.
