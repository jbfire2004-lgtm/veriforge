# Dual-Scale Dashboards (Project & Company)

Side-by-side project-scale and company-scale analytics with strict plane isolation.

## Route

- UI: `/hub/dual-scale-dashboards`
- API: `GET|POST /api/v1/dual-scale-dashboards`

## Project dashboard

- Project HECA, TRIF, LTIF
- Leading indicators
- Corrective actions (aging + /200k)
- Risk profile

## Company dashboard

- Company HECA, TRIF, LTIF
- Leading indicator maturity
- Competency trends
- Regional performance

## Rules

1. **Never mix planes** unless `crossPlaneOptIn=1` (UI checkbox).
2. **Minimum sample n≥5** — suppressed categories return null / `hidden`.
3. Rates normalized per **200,000 hours**; tokens `proj_*` / `co_*`.

## Query params

`industry` · `period` · `regionCode` · `crossPlaneOptIn`

## Module

`vera-frontend/lib/dual-scale-dashboards/`
