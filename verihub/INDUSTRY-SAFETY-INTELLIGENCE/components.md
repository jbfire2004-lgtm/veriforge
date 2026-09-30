# Component Definitions

Namespace: `vera-frontend/components/hub/industry-safety/`

## Tree

```
IndustrySafetyPage
├── IndustrySafetyShell
├── IndustrySafetySelectorBar
├── ProjectScaleDashboard
├── CompanyScaleDashboard
├── CrossCategoryComparisonPanel
├── MetricCard
├── HecaSummaryPanel
├── TrifLtifPanel
├── LeadingIndicatorsPanel
├── CorrectiveActionsPanel
├── CompetencyPanel
├── SeasonalTrendsChart
├── PredictiveRiskPanel
└── SampleSuppressedBanner
```

---

## `IndustrySafetyPage`

- Owns tab state: `project` \| `company` \| `cross`  
- Loads permissions  
- Renders shell + active dashboard  

**Props:** none (route page)  

---

## `IndustrySafetySelectorBar`

**Props:**

```ts
{
  value: IndustrySafetySelectors;
  entityTypeLocked?: boolean; // true inside a scale dashboard
  onChange: (next: IndustrySafetySelectors) => void;
  subtypeOptions: SubtypeOption[];
  disabled?: boolean;
}
```

**Behavior:**

- Industry, entity type, subtype, scale, period controls  
- When `entityType` changes → clear `subtype` → notify parent to switch tab  
- Subtype dropdown bound to `subtypeOptions` for current entity type only  

---

## `ProjectScaleDashboard` / `CompanyScaleDashboard`

**Props:**

```ts
{
  selectors: IndustrySafetySelectors; // entityType fixed
  data?: IndustryCohortAggregate | null;
  suppressed?: boolean;
  loading?: boolean;
  onRefresh: () => void;
}
```

**Behavior:**

- Fetch via plane-specific hook (`useProjectIndustryCohort` / `useCompanyIndustryCohort`)  
- Never call the other plane’s endpoint  
- Compose metric panels  

---

## `CrossCategoryComparisonPanel`

**Props:**

```ts
{
  industry: IndustryCode;
  scale: ScaleBand;
  period: string;
  projectSubtype?: ProjectSubtype;
  companySubtype?: CompanySubtype;
  enabled: boolean;
  onEnable: (enabled: boolean) => void;
}
```

**Behavior:**

- Requires explicit enable + permission  
- Dual fetch; side-by-side MetricCards  
- Audit ping on enable  

---

## `MetricCard`

**Props:** `{ label, value, unit?, trend?, suppressed?, hint? }`  

Shows em dash + suppression hint when `suppressed`.

---

## `HecaSummaryPanel`

- HECA rate, high-energy distribution buckets (aggregated)  
- No form-level identifiers  

---

## `TrifLtifPanel`

- TRIF + LTIF tiles with period label  
- Industry benchmark band when available (same plane only)  

---

## `LeadingIndicatorsPanel`

- Near-miss reporting rate, observation rate, inspection completion, training currency  
- Sparkline optional (seasonal sibling may own full series)  

---

## `CorrectiveActionsPanel`

- Open, overdue, on-time closure %  
- CAPA aging buckets (aggregated)  

---

## `CompetencyPanel`

- % workers/roles current, expiring in 30/60/90 (aggregated)  
- Plane-specific denominator labels (“projects” vs “companies”)  

---

## `SeasonalTrendsChart`

- Series: metric × month  
- Legend locked to current plane  
- Hide series if any month suppressed inconsistently → show banner  

---

## `PredictiveRiskPanel`

**Props:** `{ hook: PredictiveRiskResult | null; suppressed?: boolean }`  

- Displays `riskScore`, `confidence`, `drivers[]` (cohort-level)  
- CTA: “Model unavailable” if hook null  
- Does not deep-link to raw entities  

---

## `SampleSuppressedBanner`

Copy: **Insufficient sample size. Categories with fewer than 5 entities are hidden to protect anonymity.**

---

## Hooks

| Hook | Endpoint plane |
|------|----------------|
| `useProjectIndustryCohort(selectors)` | project only |
| `useCompanyIndustryCohort(selectors)` | company only |
| `useCrossCategoryCompare(params)` | both, gated |
| `useIndustrySelectorMeta(entityType)` | subtypes for one type |

React Query keys **must** include `plane`:

```ts
["visi", "project", selectors]
["visi", "company", selectors]
```
