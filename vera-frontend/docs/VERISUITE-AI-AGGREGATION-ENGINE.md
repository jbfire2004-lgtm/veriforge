# VeriSuite AI Industry Data Aggregation Engine

Continuously discovers and aggregates external industry safety data for mining, construction, and manufacturing.

## Route

- UI: `/hub/verisuite-aggregation`
- API: `GET|POST /api/v1/verisuite-aggregation`

## Capabilities

| Capability | Implementation |
|------------|----------------|
| Continuous web search | Search intents for safety dashboards, incident DBs, regulatory reports, industry KPIs |
| AI extraction | Multi-modal: **LLM** + **vision** (PDF/charts) + **scrape** (tables) |
| Normalize | All rates per 200,000 hours before store |
| Tokenize & anonymize | Strip org/email/author/address; opaque `ext_*` tokens |
| Daily benchmarks | TRIF / LTIF / near-miss / severity / leading maturity per industry |
| AI narratives | Trends, anomalies, and risk patterns from daily cohort |

## POST actions

```json
{ "action": "search" }   // continuous search cycle
{ "action": "extract" }  // LLM + vision + scrape pass
{ "action": "daily" }    // full daily update (default)
```

## Module

`vera-frontend/lib/verisuite-aggregation-engine/`

## Notes

Preview engine uses curated discovery URLs and simulated extraction. Wire live connectors behind the same normalize → anonymize → benchmark → narrative pipeline when production feeds are available. Feeds Industry Intelligence / VeriSuite Intelligence consumers via shared normalized facts.
