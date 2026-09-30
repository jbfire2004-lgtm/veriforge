# Company vs Industry Comparison

**Route:** `/hub/industry-safety/company`  
**API:** `GET /api/v1/hub/industry-safety/company/self-vs-industry` (JWT)  
**Profile:** `GET /api/v1/hub/industry-safety/company/benchmark-profile` (JWT)

## Purpose

Every company sees **its own** safety metrics beside **anonymized industry averages** for the same segment.

## UX flow

1. Company user signs into VeriHub.  
2. Company-Scale dashboard loads.  
3. Benchmark profile auto-fills Industry · Company type · Scale from the tenant company.  
4. Dashboard loads **Your company** metrics + **Industry cohort** for that band.  
5. Side-by-side panels show HECA, TRIF/LTIF, leading maturity, CAPA aging, competency, seasonal risk.  
6. Optional: enable **cross-category** (e.g. contractor vs utility) or **cross-scale** (e.g. mega vs small).

## Selectors

| Selector | Values |
|----------|--------|
| Industry | construction, energy, manufacturing, … |
| Entity type | Company (this feature) or Project (separate plane) |
| Company type | Utility, EPC, Contractor, Engineering Firm, Maintenance Provider |
| Scale | Small, Medium, Large, Mega |

## Isolation rules

| Rule | Enforcement |
|------|-------------|
| No project-scale mix | `assertSinglePlane('company')` — project filters rejected |
| No type mix by default | `assertSameCompanyTypeUnlessConsent` |
| No scale mix by default | `assertSameScaleUnlessConsent` |
| Industry averages per plane | Company cohort only (`projectDataIncluded: false`) |
| n ≥ 5 | Industry side suppressed when below threshold; self still shown |
| Privacy | Company id tokenized server-side; tokens never returned |

## Response shape

```ts
{
  data: {
    home: { industry, companyType, scale, companyName },
    benchmark: { industry, companyType, scale, period, crossCategory, crossScale },
    self: { metrics, label: "Your company" },
    industry: { metrics, suppressed, entityCount, label: "Industry cohort" },
    deltas: { trif, ltif, hecaRate, leadingMaturityScore, ... },
    comparisons: { heca, trifLtif, leadingMaturity, correctiveActions, competency, seasonal }
  },
  meta: { plane: "company", projectDataIncluded: false, alignment: {...} }
}
```

## Files

| Layer | Path |
|-------|------|
| Service | `backend/src/modules/hub-industry-safety/visi-self-vs-industry.service.ts` |
| Isolation | `packages/vera-hub-industry-safety/src/isolation.ts` |
| UI panels | `vera-frontend/components/hub/industry-safety/CompanyVsIndustryPanels.tsx` |
| Shell | `vera-frontend/components/hub/industry-safety/IndustrySafetyShell.tsx` |
| Client API | `vera-frontend/lib/hub/industry-safety/api.ts` |
