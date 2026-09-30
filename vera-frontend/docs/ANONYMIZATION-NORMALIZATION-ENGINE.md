# Anonymization & Normalization Engine

Canonical privacy and metric normalization pipeline for VeriSuite analytics.

## Route

- UI: `/hub/anonymization-normalization`
- API: `GET|POST /api/v1/anonymization-normalization`

## Functions

| Function | API |
|----------|-----|
| Tokenize company & project IDs | `tokenizeCompanyId` / `tokenizeProjectId` → `co_*` / `proj_*` |
| Strip names, locations, identifiers | `stripIdentifiers` — see strip catalog |
| Incidents per 200,000 hours | `ratePer200k` |
| Severity index | `normalizeSeverityIndex` (0–10) |
| Standardized categories | `standardizeCategories` (HECA + incident + leading) |
| Blind aggregation | `blindAggregate` — bands + tokens only; no member IDs |
| Min sample threshold | Hide when unique tokens &lt; 5 (`rule: min_sample`) |

## Full record pipeline

```ts
anonymizeAndNormalize(raw) → { fact, strippedFields, tokens }
```

## POST actions

```json
{ "action": "ingest", "record": { ...raw sensitive record } }
{ "action": "aggregate", "key": { "plane", "industryBand", "period", "regionBand" } }
```

## Module

`vera-frontend/lib/anonymization-normalization-engine/`

Other dashboards should prefer this engine for shared tokenize / strip / normalize / blind-aggregate behavior.
