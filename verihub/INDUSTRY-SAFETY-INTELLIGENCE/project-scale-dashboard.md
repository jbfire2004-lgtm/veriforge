# Project-Scale Industry Dashboard

**Route:** `/hub/industry-safety`  
**API:** `GET /api/v1/hub/industry-safety/project/cohort`  
**Plane:** `project` only

## Purpose

Benchmark projects against industry projects of similar **type** and **scale**.

## Inputs

| Selector | Values |
|----------|--------|
| Industry | construction, energy, manufacturing, transportation, mining, utilities, other |
| Project type | Transmission, Distribution, Substation, Civil, Industrial, Renewable |
| Scale | Small, Medium, Large, Mega |
| Period | `YYYY-MM` or `YYYY-Qn` |

## Outputs

- HECA trend charts (+ energy distribution)
- TRIF / LTIF normalized **per 200,000 hours**
- Leading indicator heatmaps
- Seasonal risk patterns
- Workforce-normalized incident rates
- Root cause distribution
- Corrective action closure aging
- Project risk profile scoring (+ predictive hook)

## Rules enforced

| Rule | Enforcement |
|------|-------------|
| Only project-level data | Query router rejects `companyType` / `companyId`; `companyDataIncluded: false` |
| No company mix | Opt-in checkbox does **not** load company metrics into this view |
| Min sample 5 | `meta.suppressed` when entityCount &lt; 5; metrics null |
| Tokenized project IDs | `proj_*` via SHA-256 salt; tokens never returned to UI |

## Files

| Layer | Path |
|-------|------|
| UI page | `vera-frontend/app/hub/industry-safety/page.tsx` |
| Dashboard | `vera-frontend/components/hub/industry-safety/*` |
| Client API | `vera-frontend/lib/hub/industry-safety/*` |
| Backend | `backend/src/modules/hub-industry-safety/*` |
| Spec types | `verihub/INDUSTRY-SAFETY-INTELLIGENCE/types.ts` |
