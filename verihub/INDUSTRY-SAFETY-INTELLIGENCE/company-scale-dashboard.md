# Company-Scale Industry Dashboard

**Route:** `/hub/industry-safety/company`  
**API:** `GET /api/v1/hub/industry-safety/company/cohort`  
**Plane:** `company` only

## Purpose

Benchmark companies against industry companies of similar **type** and **scale**.

## Inputs

| Selector | Values |
|----------|--------|
| Industry | construction, energy, manufacturing, transportation, mining, utilities, other |
| Company type | Utility, EPC, Contractor, Engineering Firm, Maintenance Provider |
| Scale | Small, Medium, Large, Mega |
| Period | `YYYY-MM` or `YYYY-Qn` |

## Outputs

- Company HECA rate (+ energy distribution)
- TRIF / LTIF normalized **per 200,000 total hours**
- Leading indicator maturity scoring
- Corrective action aging
- Competency trends
- Regional performance
- Workforce stability indicators

## Rules enforced

| Rule | Enforcement |
|------|-------------|
| Only company-level data | Query router rejects `projectType` / `projectId`; `projectDataIncluded: false` |
| No project mix | Opt-in checkbox does **not** load project metrics into this view |
| Min sample 5 | `meta.suppressed` when entityCount &lt; 5; metrics null |
| Tokenized company IDs | `co_*` via SHA-256 salt (separate from `proj_*`); tokens never returned to UI |

## Files

| Layer | Path |
|-------|------|
| UI page | `vera-frontend/app/hub/industry-safety/company/page.tsx` |
| Dashboard | `vera-frontend/components/hub/industry-safety/CompanyScale*` |
| Client API | `vera-frontend/lib/hub/industry-safety/api.ts` |
| Backend | `backend/src/modules/hub-industry-safety/*` |
