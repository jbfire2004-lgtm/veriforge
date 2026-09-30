# VeriHub Industry Trend Engine

Package: `@vera/hub-industry-safety-trends`  
Class: `VeriHubIndustryTrendEngine`

## Capabilities

| Capability | Module / method |
|------------|-----------------|
| HECA trend analysis | `analyzeHecaTrend` / `engine.analyzeHeca` |
| TRIF/LTIF trend analysis | `analyzeTrifLtifTrend` / `engine.analyzeTrifLtif` |
| Leading indicator correlation | `analyzeLeadingCorrelation` / `engine.correlateLeading` |
| Seasonal risk modeling | `modelSeasonalRisk` / `engine.modelSeasonal` |
| Root cause clustering | `clusterRootCauses` / `engine.clusterRootCauses` |
| Workforce stability scoring | `scoreWorkforceStability` / `engine.scoreWorkforce` |
| Predictive risk forecasting | `forecastPredictiveRisk` / `engine.forecastRisk` |
| Full report | `engine.analyze` |
| Dual-plane (consent) | `engine.crossCompare` |

## Rules

- **Plane isolation** — project and company series never mix in a single analysis
- **Cross-compare** — only via `crossCompare({ explicitConsent: true })`; returns separate reports, never blended metrics
- **Anonymized inputs** — series built from `BlindAggregateResult` / normalized metrics; tokens must not appear in public reports
- **Min sample** — suppressed periods carry `suppressed: true` and null metrics (n ≥ 5 enforced upstream by anonymization engine)

## Pipeline

```
NormalizedPlaneFact[] (per plane)
  → blindAggregate per period
  → TrendSeriesPoint[]          // anonymized
  → VeriHubIndustryTrendEngine.analyze()
  → IndustryTrendReport         // no tokens
```

## API (Nest)

Base: `/api/v1/hub/industry-safety`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/trends` | Full trend report |
| GET | `/metrics/heca` | HECA series + slopes |
| GET | `/metrics/trif-ltif` | TRIF/LTIF series |
| GET | `/metrics/leading` | Leading↔lagging correlations |
| GET | `/metrics/seasonal` | Seasonal risk model |
| GET | `/metrics/root-cause` | HECA/root-cause clusters |
| GET | `/metrics/workforce` | Stability score |
| POST | `/predictive/risk` | Forecast horizon `1m\|3m\|6m` |
| POST | `/trends/cross-compare` | Requires `explicitConsent: true` |

Query (all GET metrics): `entityType`, `industry`, `subtype`, `scale`, `period`.

## Usage

```ts
import { VeriHubIndustryTrendEngine } from "@vera/hub-industry-safety-trends";

const engine = new VeriHubIndustryTrendEngine();
const series = engine.fromBlindAggregates(aggregates);
const report = engine.analyze({
  scope: { industry: "energy", entityType: "project", subtype: "transmission", scale: "large" },
  series,
  forecastHorizon: "3m",
});
```

## Build

```bash
cd packages/vera-hub-industry-safety-trends
npm install
npm run build
```
