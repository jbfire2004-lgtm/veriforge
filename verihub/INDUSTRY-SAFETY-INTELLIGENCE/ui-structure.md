# UI Structure

## Route & shell

| Item | Value |
|------|-------|
| Path | `/hub/industry-safety` |
| Shell | `SignedInVeraLayout` / Vera Hub chrome (unified nav per Vera rules) |
| Nav | `veraHub` feature: Industry safety → `/hub/industry-safety` |
| Permission | `HUB_INDUSTRY_SAFETY_VIEW` |

## Top-level IA

```
Industry Safety Intelligence
├── [Tab] Project-Scale Dashboard     ← default when entityType=project
├── [Tab] Company-Scale Dashboard     ← default when entityType=company
└── [Opt-in] Cross-Category Comparison  (disabled by default)
```

**Tabs do not share React Query cache keys.** Switching tabs remounts or resets selector state for subtype.

## Selector bar (shared chrome, plane-bound state)

Order (left → right):

1. **Industry** — required  
2. **Entity type** — `Project` \| `Company` (syncs active tab)  
3. **Subtype** — options depend on entity type only  
4. **Scale** — Small · Medium · Large · Mega  
5. **Period** — Month / Quarter / Trailing 12  

Changing **Entity type** clears subtype and forces the matching dashboard tab.

## Project-Scale Dashboard layout

```
┌─────────────────────────────────────────────────────────────┐
│ Selector bar (entityType locked = project)                  │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ HECA          │ TRIF          │ LTIF          │ Sample (n)  │
│ summary card  │ card          │ card          │ or SUPPRESSED│
├───────────────┴───────────────┴───────────────┴─────────────┤
│ Leading Indicators panel                                    │
├─────────────────────────────┬───────────────────────────────┤
│ Corrective Actions          │ Competency                    │
├─────────────────────────────┴───────────────────────────────┤
│ Seasonal Trends (chart)                                     │
├─────────────────────────────────────────────────────────────┤
│ Predictive Risk (hook panel)                                │
└─────────────────────────────────────────────────────────────┘
```

## Company-Scale Dashboard layout

Identical **structure**, different copy and subtype vocabulary, bound to `entityType=company` API plane.

## Suppression empty state

When `entityCount < 5` or `suppressed: true`:

- Metric cards show **“Insufficient sample (n&lt;5)”**  
- Charts hidden or placeholder  
- No partial leakage of near-threshold values  

## Cross-Category Comparison UI

```
┌────────────────────────────────────────────┐
│ ⚠ Cross-category mode (audited)            │
│ Industry + Scale + Period must align       │
├─────────────────┬──────────────────────────┤
│ Project cohort  │ Company cohort           │
│ metrics         │ metrics                  │
└─────────────────┴──────────────────────────┘
│ Optional: delta chart (labeled synthetic)  │
└────────────────────────────────────────────┘
```

No single KPI tile that averages project+company without labeling.

## States

| State | UI |
|-------|----|
| Loading | Skeleton angular cards |
| Ready | Metrics + charts |
| Suppressed | Banner + locked cards |
| Forbidden plane mix | Toast + revert selectors |
| No permission | Access denied panel |
