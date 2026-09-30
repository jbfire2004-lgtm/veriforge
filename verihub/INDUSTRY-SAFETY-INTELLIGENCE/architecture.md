# Architecture

## 1. Goals

1. Deliver **two isolated** industry intelligence dashboards: Project-Scale and Company-Scale.  
2. Enforce **data-plane separation** so project and company facts never co-mingle in aggregates by default.  
3. Guarantee **privacy**: anonymize, tokenize, normalize **before** any analytics join.  
4. Expose HECA, TRIF, LTIF, leading indicators, corrective actions, competency, seasonal trends, and predictive risk **hooks**.  
5. Apply **blind aggregation** with **minimum sample threshold n ≥ 5**.

## 2. System context

```
┌─────────────────────────────────────────────────────────────────┐
│ Vera Hub  /hub/industry-safety                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ Project-Scale Dash   │  │ Company-Scale Dash   │             │
│  │ entityType=project   │  │ entityType=company   │             │
│  └──────────┬───────────┘  └──────────┬───────────┘             │
└─────────────┼─────────────────────────┼─────────────────────────┘
              │                         │
              ▼                         ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Project Data Plane  │     │ Company Data Plane  │
│ (isolated store +   │     │ (isolated store +   │
│  query router)     │     │  query router)     │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └────────────┬──────────────┘
                        ▼
           ┌────────────────────────┐
           │ Cross-Category Gate    │  ← only if user opts in
           │ (audited, dual-plane)  │
           └────────────────────────┘
                        ▲
                        │
     ┌──────────────────┴──────────────────┐
     │ Privacy Pipeline (shared code,      │
     │ separate output namespaces)         │
     │ Anonymize → Tokenize → Normalize    │
     └──────────────────┬──────────────────┘
                        ▲
         ┌──────────────┼──────────────┐
         │              │              │
    PM Project     PM Company     VeriForge /
    safety ctx     safety ctx     federation
    HECA/CAIL      HECA/CAIL      signals
```

## 3. Domain separation

### 3.1 Data planes

| Plane ID | Entity | Token prefix | Dashboard |
|----------|--------|--------------|-----------|
| `plane:project` | Project | `proj_` | Project-Scale |
| `plane:company` | Company | `co_` | Company-Scale |
| `plane:cross` | Virtual | n/a | Cross-Category Comparison only |

**Invariant:** Queries to `plane:project` cannot read `plane:company` tables/views (and vice versa), enforced in the query router and at the repository layer.

### 3.2 Entity model (post-privacy)

```
IndustryCohortKey {
  industry: IndustryCode
  entityType: "project" | "company"
  subtype: ProjectSubtype | CompanySubtype
  scale: "small" | "medium" | "large" | "mega"
  period: ISO period (YYYY-MM | YYYY-Qn)
}
```

Raw `projectId` / `companyId` exist **only** inside the privacy pipeline ingress. Downstream analytics see **cohort keys + metrics**, never source IDs.

## 4. Logical components

| Component | Responsibility |
|-----------|----------------|
| **Hub Industry Safety UI** | Selectors, dual dashboards, cross-compare opt-in |
| **Query Router** | Binds request → single data plane; rejects mixed filters |
| **Privacy Pipeline** | Anonymize, tokenize, normalize, strip PII |
| **Normalizer** | Units, denominators, scale bands, industry taxonomy |
| **Aggregator** | Blind cohort stats; suppress n &lt; 5 |
| **Metric Engines** | HECA, TRIF, LTIF, leading, CAPA, competency, seasonal |
| **Predictive Hook Adapter** | Calls model service with cohort features only |
| **Audit Log** | Cross-compare enablement, export, threshold overrides (admin only) |

## 5. Scale banding

| Scale | Project heuristic (example) | Company heuristic (example) |
|-------|----------------------------|-----------------------------|
| Small | &lt; $5M / &lt; 50 workers peak | &lt; 200 workers |
| Medium | $5–50M / 50–250 workers | 200–1,000 workers |
| Large | $50–250M / 250–1,000 workers | 1,000–5,000 workers |
| Mega | &gt; $250M / &gt; 1,000 workers | &gt; 5,000 workers |

Exact thresholds live in config (`ScaleBandConfig`) per industry override — applied **during normalization**, before aggregation.

## 6. Subtype taxonomies

### Project subtypes (Project-Scale dashboard)

`transmission` · `distribution` · `substation` · `civil` · `industrial` · `renewable`

Labels: Transmission, Distribution, Substation, Civil, Industrial, Renewable.

### Company subtypes (Company-Scale dashboard)

`utility` · `epc` · `contractor` · `engineering_firm` · `maintenance_provider`

Labels: Utility, EPC, Contractor, Engineering Firm, Maintenance Provider.

**Rule:** Subtype enums are plane-specific. API validation rejects a project subtype on a company query.

## 7. Security & tenancy

- Hub users see **industry aggregates**, not their competitors’ identities.  
- Contribution of a tenant’s data into the industry pool requires **admin opt-in** + privacy pipeline.  
- RBAC permission: `HUB_INDUSTRY_SAFETY_VIEW` (read aggregates), `HUB_INDUSTRY_SAFETY_CONTRIBUTE` (opt-in publish), `HUB_INDUSTRY_SAFETY_CROSS_COMPARE` (enable cross mode).  
- Cross-compare sessions are time-boxed and audit-logged.

## 8. Deployment topology

| Service | Notes |
|---------|-------|
| `hub-industry-safety` Nest module | Facade API under `/api/v1/hub/industry-safety` |
| Privacy worker | Async batch + stream ingest |
| Metrics store | Columnar / OLAP friendly (cohort grain) |
| Predict service | Optional; feature vector in, score out |

Reuse: `hashId` from `vera-global-network`; TRIF/LTIF from culture engine; HECA from `sif-heca`; leading/lagging from CAIL.

## 9. Non-functional

| Concern | Target |
|---------|--------|
| Aggregate latency (cached cohort) | p95 &lt; 500ms |
| Freshness | Daily batch + optional hourly micro-batch |
| Suppression | Deterministic; same cohort always hidden if n &lt; 5 |
| Re-identification risk | Tokens salted; no reverse API |
