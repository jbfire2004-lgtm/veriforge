# Vera Safety Suite — Complete

Unified safety assessment layer for JHA, FLHA, SIF, HECA, energy wheel, libraries, dashboards, alerts, and workflows.

## Modules

| Module | Route | Backend API |
|--------|-------|-------------|
| Safety Suite Hub | `/pm/safety-suite` | `/api/v1/pm/safety-suite/*` |
| JHA / FLHA | `/pm/jha-flha` | `/api/v1/pm/jha-flha` |
| SIF / HECA | `/pm/sif-heca` | `/api/v1/pm/sif-heca` |
| SIF Evaluate | `/pm/sif-heca/evaluate` | `POST /sif-heca/evaluate`, `POST /sif-heca/score` |
| Libraries | `/pm/safety-suite/libraries` | `/api/v1/pm/safety-suite/libraries` |
| Safety Forms | `/pm/safety-forms` | `/api/v1/pm/safety-forms` |
| Unified Hazard & Control | `/pm/unified-hazard-control` | `/api/v1/pm/unified-hazard-control` |
| Safety Hub | `/pm/safety-hub` | `/api/v1/pm/safety-hub` |

## Safety Suite API (facade)

```
GET /api/v1/pm/safety-suite/dashboard?projectId=&companyId=
GET /api/v1/pm/safety-suite/alerts?projectId=&companyId=
GET /api/v1/pm/safety-suite/readiness?projectId=
GET /api/v1/pm/safety-suite/energy-wheel
GET /api/v1/pm/safety-suite/libraries?companyId=&projectId=
```

### Dashboard

Aggregates JHA/FLHA analytics, SIF/HECA analytics, and counts (FLHAs, JHAs, pending reviews, high SIF).

### Alerts

- **JHA SIF alerts** — submitted/under-review JHAs flagged with SIF potential
- **SIF review queue** — events in `review_required`, `scored`, or `ingested`
- **Incident alerts** — open incidents (filtered by company when provided)

### Readiness

Composite score (0–100) from JHA quality, project SIF index, and high-SIF event count. Levels: `READY`, `NEEDS_ATTENTION`, `AT_RISK`.

## Features

### Form builder & submission

- **JHA/FLHA editor** — work scope, hazard builder (library + custom), controls (library + custom), interactive energy wheel, crew assignment, worker/supervisor signatures, evaluate/submit/review workflow
- **SIF evaluate** — dry-run scoring and event creation with energy wheel selection
- **Safety forms** — existing 25+ form templates at `/pm/safety-forms`

### Hazard & control libraries

- Auto-seeded per company/project via JHA library service
- Unified view at `/pm/safety-suite/libraries`
- SIF indicator and HECA category libraries from SIF/HECA engine

### Risk scoring

- JHA: `POST /jha-flha/:id/evaluate` — risk, SIF, quality, control adequacy
- SIF/HECA: `POST /sif-heca/evaluate` (dry run), `POST /sif-heca/score` (persist)

### SIF & HECA detection

- Automatic on JHA submit (ingestion pipeline)
- Manual evaluation via SIF evaluate page
- Explainability on SIF event detail

### Energy wheel

- Interactive SVG component (`EnergyWheel.tsx`) in JHA editor and SIF evaluate
- Backend segments from JHA constants and SIF energy wheel

## Frontend clients

- `lib/jha-flha.ts` — CRUD, hazards, controls, crew, signatures, libraries, energy sources
- `lib/sif-heca.ts` — events, evaluate, score, review, analytics, libraries
- `lib/safety-suite.ts` — dashboard, alerts, readiness, unified libraries

## Integration flow

```
Plan (JHA/FLHA) → Evaluate → Submit
                    ↓
              SIF/HECA ingestion
                    ↓
         Safety Suite alerts + readiness
                    ↓
    Safety Hub / CAPA / corrective actions
```

## Key files

**Backend**

- `backend/src/safety-suite/safety-suite.module.ts`
- `backend/src/safety-suite/safety-suite.service.ts`
- `backend/src/safety-suite/safety-suite.controller.ts`
- `backend/src/jha-flha/*`
- `backend/src/sif-heca/*`

**Frontend**

- `vera-frontend/src/pages/pm/safety-suite/index.tsx`
- `vera-frontend/src/pages/pm/jha-flha/editor.tsx`
- `vera-frontend/src/pages/pm/sif-heca/evaluate.tsx`
- `vera-frontend/src/components/safety-forms/components/EnergyWheel.tsx`

## Access

Safety Suite facade requires `pm` module via ACP (`@RequireModule('pm')`). JHA and SIF endpoints use PM role guards.
