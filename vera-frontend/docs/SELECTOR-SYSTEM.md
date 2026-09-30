# Selector System

Cascading selectors that drive VeriSuite dashboards without cross-contaminating project and company data.

## Selectors

1. **Industry** — Mining, Construction, Manufacturing  
2. **Entity Type** — Project or Company  
3. **Subtype** — Project types (Transmission…Renewable) or Company types (Utility…Maintenance)  
4. **Scale** — Small, Medium, Large, Mega  
5. **Region** — Global → Continent → Country → Province/State → Region → City → Site  

## Rules

| Rule | Behavior |
|------|----------|
| Dynamic filtering | Options marked available/unavailable from inventory; invalid picks snap |
| Prevent cross-contamination | Entity switch resets subtype; project/company subtype lists never mix |
| Auto-update dashboard | `GET /api/v1/selector-system` rebuilds metrics from resolved selectors |

## Route

- UI: `/hub/selector-system`
- API: `GET|POST /api/v1/selector-system`

## Query params

`industry` · `entityType` · `subtype` · `scale` · `regionCode`

## Module

`vera-frontend/lib/selector-system/`

Hook: `useSelectorSystem` (client) for embedding selectors in other dashboards.
