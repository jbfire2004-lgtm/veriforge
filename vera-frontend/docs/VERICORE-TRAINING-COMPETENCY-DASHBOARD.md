# VeriCore Training & Competency Dashboard

Workforce training intelligence with anonymized competency analytics and regional drilldown.

## Route

- UI: `/core/training-competency`
- API: `GET|POST /api/v1/vericore-training-competency`

## Features

- Training completion trends
- Competency gaps
- Certification expiry heatmaps
- Skill distribution by region
- AI correlation between competency and incident rates
- Workforce risk scoring

## Rules

1. **Anonymized** — worker names / emails / badge IDs stripped; opaque `wrk_*` / `coh_*` tokens only.
2. **Regional drilldown** — Global → City band via `?regionCode=` (breadcrumb + child chips).
3. Categories with &lt;5 anonymized workers are suppressed (`n≥5`).

## Module

`vera-frontend/lib/vericore-training-competency/`
