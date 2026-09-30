# Regional Drilldown Engine

Canonical geo hierarchy and comparison engine for VeriSuite dashboards.

## Hierarchy

**Global → Continent → Country → Province/State → Region → City → Site**

Site nodes are tenant-scoped (`industryPoolAllowed: false`) and excluded from cross-tenant industry pools.

## Route

- UI: `/hub/regional-drilldown`
- API: `GET|POST /api/v1/regional-drilldown`

## Capabilities

| Capability | API / function |
|------------|----------------|
| Filter dashboards by region | `?view=filter` · `filterDashboardsByRegion` |
| Normalize metrics by region | `?view=metrics` · `normalizeMetricsByRegion` |
| Compare regions within industry | `?view=regions` · `compareRegionsWithinIndustry` |
| Compare industries within region | `?view=industries` · `compareIndustriesWithinRegion` |
| Full snapshot | default GET · `buildRegionalDrilldownSnapshot` |

## Query params

`regionCode` · `industry` (`mining` \| `construction` \| `manufacturing` \| `all`) · `period` · `view`

## Rules

- Metrics normalized per **200,000 hours**
- Entity tokens anonymized (`reg_*`)
- Categories with &lt;5 entities suppressed
- Site excluded from industry pool comparisons

## Module

`vera-frontend/lib/regional-drilldown-engine/`

Consumers (FieldOS, Training & Competency, VeriSuite Intelligence) can import `filterDashboardsByRegion` / `regionMatches` for consistent drilldown.
