# Data Flow

## End-to-end pipeline

```
Source systems (PM / VeriForge / federation)
        │
        ▼
┌───────────────────┐
│ 1. INGEST         │  Raw events + KPIs + entity metadata
│    (private zone) │  Includes projectId / companyId
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 2. CLASSIFY PLANE │  entityType = project | company
│                   │  Reject ambiguous rows
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 3. ANONYMIZE      │  Strip PII, names, geo precision, free text
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 4. TOKENIZE       │  proj_{hash} / co_{hash}  (salted)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 5. NORMALIZE      │  Industry, subtype, scale band, metric units
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 6. WRITE PLANE    │  → project_facts  XOR  company_facts
│    STORES         │  Never both from one row
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 7. AGGREGATE      │  Group by IndustryCohortKey
│    + THRESHOLD    │  Suppress cohorts with entityCount < 5
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 8. SERVE          │  Dashboard API (single plane)
│                   │  Optional cross-compare (explicit)
└───────────────────┘
```

## Plane routing

```
if entityType == "project":
  read/write ONLY project_facts / project_cohorts
elif entityType == "company":
  read/write ONLY company_facts / company_cohorts
elif mode == "cross_category" AND permission AND explicit flag:
  read BOTH cohort tables; join ONLY on Industry + Scale + Period
  NEVER join on tokens across planes
else:
  REJECT
```

## Metric computation order

1. **Denominators** normalized (hours worked, headcount, active projects)  
2. **Lagging:** TRIF, LTIF, HECA distributions  
3. **Process:** Corrective actions (open, overdue, on-time %)  
4. **Leading:** observations, near-miss rate, inspections, competency currency  
5. **Seasonal:** same metrics pivoted by month/quarter  
6. **Predictive hooks:** cohort feature vector → model → `{ riskScore, drivers, confidence }`  

Predictive models **must not** receive raw IDs or tokens that could be reversed to a single entity when n is small — features are cohort-level or differentially noised when n is near threshold.

## Contribution flow (tenant opt-in)

```
Tenant admin enables "Contribute to industry intelligence"
  → Export job selects allowed metric fields
  → Privacy pipeline
  → Upsert into plane store under token
  → Next aggregate refresh includes entity in cohort counts
```

## Cache

| Key | Value | TTL |
|-----|-------|-----|
| `visi:cohort:{plane}:{cohortHash}` | Aggregate payload | 1h |
| `visi:selectors:{plane}` | Valid subtype/scale options | 24h |
| `visi:suppressed:{plane}:{cohortHash}` | `{ suppressed: true, reason }` | 1h |

Cache keys **include plane** so project and company never share an entry.

## Cross-category comparison flow

1. User enables toggle: “Compare project vs company cohorts”  
2. UI requires matching **Industry + Scale + Period** (subtype optional / mapped)  
3. API `POST .../cross-compare` with both selector sets  
4. Server checks `HUB_INDUSTRY_SAFETY_CROSS_COMPARE`  
5. Loads project cohort + company cohort independently  
6. Returns **side-by-side** metrics — no blended average unless user selects an explicit “index” chart that is labeled synthetic  
7. Audit event written  

Blended “industry overall” that mixes projects and companies is **forbidden**.
