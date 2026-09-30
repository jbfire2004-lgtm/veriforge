# Industry Selector System

Unified selector for VeriHub Industry Safety Intelligence.

## Selectors

1. **Industry** — construction, energy, manufacturing, transportation, mining, utilities, other  
2. **Entity type** — Project or Company (plane switch with warning)  
3. **Subtype** — Project types *or* Company types (dynamic; never both)  
4. **Scale** — Small, Medium, Large, Mega  

Plus **Period** (`YYYY-MM` / `YYYY-Qn`) for cohort grain.

## Requirements

| Requirement | Implementation |
|-------------|----------------|
| Dynamic filtering | `GET /selectors/availability` drives visible options |
| Prevent cross-contamination | Separate planes; subtype enums plane-locked; cohort APIs reject opposite filters |
| Only ≥5 entities | Unavailable options omitted from dropdowns; cohort still suppresses if n&lt;5 |
| Auto-update dashboard | `IndustrySafetyShell` reloads cohort when selector state changes |
| Warnings on project↔company | Confirm dialog before plane switch; clears opposite subtype |

## API

```
GET /api/v1/hub/industry-safety/selectors/availability
  ?entityType=project|company
  &industry=energy
  &period=2026-Q2
```

Returns industries / subtypes / scales with `available` flags for the **single** requested plane.

## Frontend

| Piece | Path |
|-------|------|
| UI | `components/hub/industry-safety/IndustrySelectorSystem.tsx` |
| Hook | `lib/hub/industry-safety/useIndustrySelectorSystem.ts` |
| Shell | `components/hub/industry-safety/IndustrySafetyShell.tsx` |
| Routes | `/hub/industry-safety` · `/hub/industry-safety/company` |

## Flow

```
User changes Industry / Subtype / Scale / Period
  → availability refresh (plane-scoped)
  → snap to first available subtype/scale if current invalid
  → fetch project/cohort OR company/cohort
  → dashboard panels update

User clicks Entity Type (other plane)
  → warning alertdialog
  → confirm → reset subtype to plane default → availability + cohort reload
  → cancel → stay on current plane
```
