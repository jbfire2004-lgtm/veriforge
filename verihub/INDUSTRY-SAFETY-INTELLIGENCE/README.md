# VeriHub Industry Safety Intelligence Module

**Product surface:** Vera Hub (`/hub/industry-safety`)  
**Codename:** VISI — VeriHub Industry Safety Intelligence  

Two **strictly separated** dashboards:

| Dashboard | Entity scale | Data universe |
|-----------|--------------|---------------|
| **Project-Scale Industry Dashboard** | Projects only | Anonymized project entities |
| **Company-Scale Industry Dashboard** | Companies only | Anonymized company entities |

**Hard rule:** Project and company aggregates **never mix** unless the user explicitly enables **Cross-Category Comparison** mode (separate opt-in, audited).

All analytics inputs are **anonymized → tokenized → normalized** before aggregation.

---

## Pack structure

| Doc | Contents |
|-----|----------|
| [`architecture.md`](./architecture.md) | System architecture, domains, isolation |
| [`data-flow.md`](./data-flow.md) | Ingest → privacy → normalize → aggregate → UI |
| [`ui-structure.md`](./ui-structure.md) | Selectors, layouts, dual-dashboard IA |
| [`components.md`](./components.md) | React component definitions |
| [`api.md`](./api.md) | REST endpoints + schemas |
| [`validation.md`](./validation.md) | Validation + blind aggregation + thresholds |
| [`anonymization.md`](./anonymization.md) | Anonymization / tokenization logic |
| [`project-scale-dashboard.md`](./project-scale-dashboard.md) | **Implemented** Project-Scale Hub dashboard |
| [`company-scale-dashboard.md`](./company-scale-dashboard.md) | **Implemented** Company-Scale Hub dashboard |
| [`selector-system.md`](./selector-system.md) | **Implemented** Industry Selector System |
| [`anonymization-engine.md`](./anonymization-engine.md) | **Implemented** Anonymization & Normalization Engine |
| [`trend-engine.md`](./trend-engine.md) | **Implemented** Industry Trend Engine |
| [`data-model.md`](./data-model.md) | **Designed** Dual-Dashboard Data Model |
| [`wireframes.md`](./wireframes.md) | **Designed** Project + Company dashboard wireframes |
| [`company-vs-industry.md`](./company-vs-industry.md) | **Implemented** Company vs Industry comparison |

## Metric catalog

| Metric | Type | Notes |
|--------|------|-------|
| **HECA** | Lagging / classification | High Energy Control Assessment rates & distributions |
| **TRIF** | Lagging | Total Recordable Incident Frequency |
| **LTIF** | Lagging | Lost Time Injury Frequency |
| **Leading Indicators** | Leading | Observations, near-miss reporting rate, inspection completion, training currency |
| **Corrective Actions** | Process | CAPA open/overdue/on-time closure |
| **Competency** | Leading | Training/competency coverage & expiry risk |
| **Seasonal Trends** | Temporal | Month/quarter seasonality by industry × scale |
| **Predictive Risk** | Model hooks | Risk score + drivers + confidence (no raw entity IDs) |

## Selectors (both dashboards)

1. **Industry** — construction, energy, manufacturing, transportation, mining, utilities, …  
2. **Entity type** — `project` \| `company` (locks which dashboard / data plane)  
3. **Subtype** — project type **or** company type (never both in one query)  
4. **Scale** — `small` \| `medium` \| `large` \| `mega`  

## Blind aggregation

- k-anonymity style: **hide any cohort with &lt; 5 entities**  
- No entity names, legal IDs, site addresses, or raw worker PII in responses  
- Tokens only (`proj_*` / `co_*` hashes) inside the privacy boundary — **never** returned to the Hub UI  

## Code reuse (monorepo)

| Layer | Reuse |
|-------|-------|
| Anonymize | `packages/vera-global-network` → `hashId`, `AnonymizedCompanyInput` |
| Federation | `packages/vera-industry-ecosystem`, `backend/.../global-network`, `industry-ecosystem` |
| KPIs | `analytics-safety-culture-engine` (TRIF/LTIF), `sif-heca`, CAIL leading/lagging |
| Hub UI | `SignedInVeraLayout` + Hub sections; optional compose with GlobalNetwork/IndustryEcosystem panels |
| Nav | Add feature under `veraHub` in `vera-nav-config.ts` → `/hub/industry-safety` |

## Implementation targets (when building)

```
vera-frontend/app/hub/industry-safety/
vera-frontend/components/hub/industry-safety/
backend/src/modules/hub-industry-safety/
packages/vera-hub-industry-safety/   (optional domain package)
```
