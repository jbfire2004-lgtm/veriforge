# Smart Dashboard Engine

AI layer for VeriSuite safety dashboards.

## Route

- UI: `/hub/smart-dashboard`
- API: `GET|POST /api/v1/smart-dashboard`

## Capabilities

| Capability | Module |
|------------|--------|
| AI anomaly detection | `detectAnomalies` — z-score spikes/drops/outliers |
| AI trend detection | `detectTrends` — slope direction improving/worsening/stable |
| AI narrative generation | `generateNarratives` — anomaly/trend/risk/correlation stories |
| AI risk forecasting | `forecastRisk` — 30d / 90d / 12m bands + projected TRIF/LTIF |
| AI correlation analysis | `analyzeCorrelations` — competency→incidents, inspections→risk |

## Query params

`industry` (`mining` \| `construction` \| `manufacturing`) · `period`

## Module

`vera-frontend/lib/smart-dashboard-engine/`
