# VISI Dual-Dashboard Wireframes

Interactive canvas: open **VISI Dual-Dashboard Wireframes** beside chat.  
Routes: `/hub/industry-safety` (project) · `/hub/industry-safety/company` (company)

---

## Shared chrome

```
┌─ Vera Global Header (GlobalNav) ───────────────────────────────────────────┐
├─ Hub Module Bar (ModuleNav) ───────────────────────────────────────────────┤
├─ PageLayout: Industry safety                                               │
│  [ Project-Scale ]  [ Company-Scale ]     ← plane tabs (isolated caches)   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Project-Scale Industry Dashboard

**Plane:** `project` · **Subtype vocab:** transmission | distribution | substation | civil | industrial | renewable

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ① SELECTOR PANEL                                                           │
│ [Industry ▾] [Entity: Project] [Project type ▾] [Scale ▾] [Period ▾]      │
│                                              n≥5 · company data OFF        │
├──────────┬──────────┬──────────┬───────────────────────────────────────────┤
│ HECA     │ TRIF     │ LTIF     │ Cohort n                                  │
│ summary  │ /200k hrs│ /200k hrs│ or SUPPRESSED                             │
├──────────┴──────────┴──────────┴───────────────────────────────────────────┤
│ ② TREND CHARTS                                                             │
│ ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│ │ HECA high-energy +      │  │ TRIF / LTIF time series │                   │
│ │ controls verified       │  │                         │                   │
│ └─────────────────────────┘  └─────────────────────────┘                   │
├────────────────────────────┬───────────────────────────────────────────────┤
│ ③ BENCHMARK COMPARISON     │ ⑥ RISK PROFILE SCORING                        │
│ Cohort p25 / median / p75  │ Risk index · band · forecast horizon          │
│ vs this scale band         │ Drivers list · predictive hook                │
├────────────────────────────┴───────────────────────────────────────────────┤
│ ④ LEADING INDICATOR HEATMAP                                                │
│ [Near-miss] [Observations] [Inspections] [Training] [Leadership] [Learn] │
├────────────────────────────┬───────────────────────────────────────────────┤
│ ⑤ CORRECTIVE ACTION AGING  │ Seasonal risk chart                           │
│ 0–7d · 8–30d · 31–60d ·    │ TRIF / leading composite by month             │
│ 61–90d · 90d+              │                                               │
├────────────────────────────┴───────────────────────────────────────────────┤
│ ⑦ EXPORT PANEL                                                             │
│ [Export CSV] [Export PDF] [Copy cohort key]  · tokens excluded             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Company-Scale Industry Dashboard

**Plane:** `company` · **Subtype vocab:** utility | epc | contractor | engineering_firm | maintenance_provider

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ① SELECTOR PANEL                                                           │
│ [Industry ▾] [Entity: Company] [Company type ▾] [Scale ▾] [Period ▾]      │
│                                              n≥5 · project data OFF        │
├──────────┬──────────┬──────────┬───────────────────────────────────────────┤
│ HECA     │ TRIF     │ LTIF     │ Cohort n                                  │
│ company  │ /200k hrs│ /200k hrs│ or SUPPRESSED                             │
├──────────┴──────────┴──────────┴───────────────────────────────────────────┤
│ ② TREND CHARTS                                                             │
│ ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│ │ Competency currency +   │  │ TRIF / LTIF time series │                   │
│ │ expiring 30d            │  │                         │                   │
│ └─────────────────────────┘  └─────────────────────────┘                   │
├────────────────────────────┬───────────────────────────────────────────────┤
│ ③ BENCHMARK COMPARISON     │ ⑥ WORKFORCE / RISK SCORING                    │
│ vs industry company cohort │ Stability score · turnover · tenure           │
├────────────────────────────┴───────────────────────────────────────────────┤
│ ④ LEADING INDICATOR HEATMAP (maturity)                                     │
│ [Reporting] [Observations] [Inspections] [Training] [Leadership] [Learn] │
├────────────────────────────┬───────────────────────────────────────────────┤
│ ⑤ CORRECTIVE ACTION AGING  │ Regional performance                          │
│ CAPA aging buckets         │ West · Midwest · South · NE · Canada          │
├────────────────────────────┴───────────────────────────────────────────────┤
│ ⑦ EXPORT PANEL                                                             │
│ [Export CSV] [Export PDF] [Copy cohort key]  · tokens excluded             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Panel checklist

| # | Panel | Project | Company |
|---|-------|---------|---------|
| ① | Selector panel | ✓ project types | ✓ company types |
| ② | Trend charts | HECA + TRIF/LTIF | Competency + TRIF/LTIF |
| ③ | Benchmark comparison | vs project cohort | vs company cohort |
| ④ | Leading indicator heatmaps | ✓ | ✓ maturity |
| ⑤ | Corrective action aging | ✓ | ✓ |
| ⑥ | Risk profile scoring | Predictive risk index | Workforce stability |
| ⑦ | Export panel | ✓ anonymized | ✓ anonymized |

---

## Isolation callouts (both wireframes)

- Entity type change confirms plane switch; clears subtype to plane default  
- Cross-category comparison is **not** on the default wireframe — separate audited mode  
- When `n < 5`, KPI tiles show “Insufficient sample”; charts/export disabled for metrics  

## Implementation map

| Wireframe region | Component (approx.) |
|------------------|---------------------|
| Selector | `IndustrySelectorSystem` |
| KPI strip | `ProjectMetricCard` |
| HECA trend | `HecaTrendChart` |
| Heatmap | `LeadingIndicatorHeatmap` / `LeadingMaturityPanel` |
| CAPA aging | `CorrectiveActionAgingChart` / `CompanyCapaAgingChart` |
| Risk | `ProjectRiskProfileCard` / `WorkforceStabilityPanel` |
| Export | (to implement — Export panel slot) |
