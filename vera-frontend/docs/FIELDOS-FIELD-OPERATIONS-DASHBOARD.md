# FieldOS Field Operations Dashboard

Real-time field intelligence for inspections, hazards, near-misses, equipment, competency, and regional risk.

## Route

- UI: `/field/operations`
- API: `GET|POST /api/v1/fieldos-operations`

## Features

- Field inspection trends
- Hazard report patterns
- Near-miss analytics
- Equipment safety alerts (tokenized)
- Worker competency signals (anonymized, n≥5)
- Region-specific risk trends
- AI anomaly detection (spike / drop / cluster / drift)

## Rules

1. **Normalize** all count rates per 200,000 hours.
2. **Anonymize** — strip PII; workers/equipment/crews are opaque tokens only.
3. **Regional drilldown** — Global → Continent → Country → Province/State → Region → City band (`?regionCode=`).

## Module

`vera-frontend/lib/fieldos-operations/`
