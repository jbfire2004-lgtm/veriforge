# VeriForge Dashboard System — Master Spec

**Status:** Preview implemented  
**Entry:** `/hub/veriforge-dashboards`  
**Surfaces:**
- VERICore — `/core/dashboard`
- VERIPM — `/pm/dashboard`
- Contractor Safety Score — `/core/contractor-scores`
- Shared analytics — `/api/v1/dashboard-analytics/*`

## Architecture

```
Documents / Training / Incidents / PM WOs / Failures / Audits
        │
        ▼
 dashboard-analytics (events + catalog + industry + universal drill)
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
VERICore  VERIPM   CSS (contractor scores)
   │       │            │
   └───────┴────────────┘
        UI dashboards + drill sheets
```

## Scopes

| Scope | VERICore | VERIPM | CSS |
|-------|----------|--------|-----|
| Company | ✓ | ✓ | list of hired |
| Project | ✓ | ✓ + related companies | overlay-ready |
| Contractor | cards + CSS link | cards + CSS | ✓ profile |
| Asset | — | ✓ asset view | — |
| Worker | training drill | tech workload drill | training evidence |

## Shared APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/dashboard-analytics/revision` | Reactive poll token |
| GET | `/api/v1/dashboard-analytics/catalog` | Metric catalog |
| GET | `/api/v1/dashboard-analytics/metrics` | Scope metric shells |
| GET | `/api/v1/dashboard-analytics/drill` | Universal drill facade |
| POST | `/api/v1/dashboard-analytics/events` | Emit invalidation event |

## Domain APIs

- VERICore: `/api/v1/core/dashboard/*`
- VERIPM: `/api/v1/veripm-dashboard/*` (not under `/api/v1/pm` — Nest rewrite)
- CSS: `/api/v1/contractor-scores/*`

## Real-time strategy

1. Domain mutation (simulate buttons or future Document Service events)
2. `emitAnalyticsEvent` bumps shared revision
3. Domain store rebuilds snapshot
4. Clients poll revision (Core) or refetch after event (PM/CSS)

## Industry benchmarks

Preview table in `lib/dashboard-analytics/industry.ts` (construction sector). Production path: VISI anonymized cohorts (`/api/v1/hub/industry-safety/company/vs-industry`) with percentile cache.

## Related docs

- `VERIFORGE-VERICORE-DASHBOARD.md`
- `VERIFORGE-VERIPM-DASHBOARD.md`
- `VERIFORGE-CONTRACTOR-SAFETY-SCORE.md`
- `VERIFORGE-VERIPM-FIELDOS-PERMITS.md`
