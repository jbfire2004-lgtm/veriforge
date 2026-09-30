# VeriHub Dual-Dashboard Data Model

**Module:** VISI — Industry Safety Intelligence  
**Planes:** `project` | `company` (strictly isolated)  
**Invariant:** No foreign keys, joins, or shared aggregate rows across planes.

---

## 1. ER overview

```
                    ┌──────────────────────┐
                    │  anonymized_tokens   │
                    │  plane + token       │
                    └──────────┬───────────┘
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
┌──────────────────────────┐     ┌──────────────────────────┐
│   industry_projects      │     │   industry_companies     │
│   (plane:project only)   │     │   (plane:company only)   │
└────────────┬─────────────┘     └────────────┬─────────────┘
             │                                │
             ▼                                ▼
┌──────────────────────────┐     ┌──────────────────────────┐
│   project_metrics        │     │   company_metrics        │
│   (normalized rates)     │     │   (normalized rates)     │
└──────────────────────────┘     └──────────────────────────┘

Plane-scoped fact tables (discriminator = entity_type; never cross-joined):
  leading_indicators · corrective_actions · competency_profiles

Cohort / UX (always keyed by entity_type):
  trend_cache · selector_state
```

**Forbidden:** `industry_projects` ↔ `industry_companies` FKs, mixed-plane views, single aggregate row containing both entity types.

---

## 2. Isolation rules

| Rule | Enforcement |
|------|-------------|
| Project and company tables remain isolated | Separate entity + metrics tables; no cross-plane FKs |
| Industry aggregates stored separately per entity type | `trend_cache.entity_type` partitions all cohort payloads; unique keys include `entity_type` |
| All metrics normalized before storage | `hours_basis = 200000`, rates per 200k hours, `normalized_at` + `normalizer_version` required on metric rows |
| Tokens never returned to Hub UI | `anonymized_tokens` + entity tables are internal; APIs expose cohort keys only |
| Min sample n ≥ 5 | Aggregates / cache rows set `suppressed = true` when below threshold |
| Cross-compare | Application gate only; reads both planes separately and returns dual payloads — never a blended row |

Repository convention:

```
ProjectPlaneRepository  → industry_projects, project_metrics, * WHERE entity_type='project'
CompanyPlaneRepository  → industry_companies, company_metrics, * WHERE entity_type='company'
```

---

## 3. Table specifications

### 3.1 `anonymized_tokens`

Internal token registry. Raw project/company IDs are **not** stored (optional one-way `source_id_hash` for dedupe only).

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | cuid |
| `plane` | enum `project` \| `company` | |
| `token` | text unique | `proj_*` or `co_*` |
| `salt_version` | text | rotation key id |
| `source_id_hash` | text null | SHA-256 of raw id + salt; irreversible |
| `created_at` | timestamptz | |

**Constraints:** `token` prefix must match `plane` (`proj_` ↔ project, `co_` ↔ company).

---

### 3.2 `industry_projects` · `industry_companies`

Anonymized entity dimensions **after** strip → tokenize → normalize. No names, addresses, or source IDs.

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `token` | text unique | FK → `anonymized_tokens.token` |
| `industry` | text | IndustryCode |
| `subtype` | text | ProjectSubtype **or** CompanySubtype (plane-specific) |
| `scale` | text | `small\|medium\|large\|mega` |
| `region_band` | text null | Coarse band only (e. and. `west`) |
| `normalizer_version` | text | Taxonomy / scale-band config version |
| `created_at` / `updated_at` | timestamptz | |

**Isolation:** These two tables must never reference each other.

---

### 3.3 `project_metrics` · `company_metrics`

Period-level **normalized** safety metrics. Stored only after `normalizeMetrics()`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `project_id` / `company_id` | text FK | → matching entity table only |
| `period` | text | `YYYY-MM` or `YYYY-Qn` |
| `hours_basis` | int | **Always 200000** |
| `hours_worked` | double null | Denominator used (internal) |
| `incident_rate_per_200k` | double null | |
| `recordable_rate_per_200k` | double null | **TRIF** |
| `lost_time_rate_per_200k` | double null | **LTIF** |
| `near_miss_rate_per_200k` | double null | |
| `severity_index` | double null | 0–100 |
| `heca_high_energy_rate` | double null | |
| `heca_controls_verified_rate` | double null | |
| `heca_distribution` | jsonb | Standardized HECA categories |
| `normalized_at` | timestamptz | Required |
| `normalizer_version` | text | Required |
| `created_at` / `updated_at` | timestamptz | |

**Unique:** `(project_id, period)` / `(company_id, period)`  
**Check:** `hours_basis = 200000`

Industry cohort aggregates are **not** written into these tables. They are materialized per plane into `trend_cache` (see §3.8).

---

### 3.4 `leading_indicators`

Plane-scoped leading metrics (observations, inspections, training, near-miss reporting).

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `entity_type` | enum | `project` \| `company` |
| `token` | text | Must match `anonymized_tokens` for same plane |
| `period` | text | |
| `observation_rate` | double null | 0–1 |
| `inspection_completion_rate` | double null | |
| `training_currency_rate` | double null | |
| `near_miss_reporting_index` | double null | |
| `controls_verified_rate` | double null | |
| `leading_composite` | double null | Optional precomputed |
| `normalized_at` | timestamptz | |
| `normalizer_version` | text | |

**Unique:** `(entity_type, token, period)`  
**Rule:** Queries always filter `entity_type`; never `UNION` project+company for a single dashboard response.

---

### 3.5 `corrective_actions`

Anonymized CAPA aggregates per token × period.

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `entity_type` | enum | |
| `token` | text | |
| `period` | text | |
| `on_time_rate` | double null | 0–1 |
| `open_avg` | double null | |
| `overdue_count_avg` | double null | |
| `aging` | jsonb | `{ "0-7d": n, "8-30d": n, ... }` |
| `normalized_at` | timestamptz | |
| `normalizer_version` | text | |

**Unique:** `(entity_type, token, period)`

---

### 3.6 `competency_profiles`

Competency currency profiles (company-heavy; still plane-tagged for isolation).

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `entity_type` | enum | |
| `token` | text | |
| `period` | text | |
| `current_rate` | double null | |
| `expiring_30d_rate` | double null | |
| `expiring_60d_rate` | double null | |
| `expiring_90d_rate` | double null | |
| `role_distribution` | jsonb null | Anonymized role bands only |
| `normalized_at` | timestamptz | |
| `normalizer_version` | text | |

**Unique:** `(entity_type, token, period)`

---

### 3.7 `trend_cache`

Materialized **industry aggregates** and trend-engine outputs. **One row = one plane.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `entity_type` | enum | Partitions project vs company aggregates |
| `industry` | text | |
| `subtype` | text | |
| `scale` | text | |
| `period` | text | Anchor period |
| `report_kind` | text | `cohort` \| `heca` \| `trif_ltif` \| `seasonal` \| `leading` \| `root_cause` \| `workforce` \| `predictive` \| `full_trends` |
| `horizon` | text | Predictive: `1m`\|`3m`\|`6m`; otherwise `''` (not null — unique key safe) |
| `payload` | jsonb | Anonymized report (no tokens) |
| `suppressed` | boolean | true if n &lt; 5 |
| `entity_count` | int null | Visible only when not suppressed policy allows |
| `min_sample` | int | Default 5 |
| `computed_at` | timestamptz | |
| `expires_at` | timestamptz null | |

**Unique:** `(entity_type, industry, subtype, scale, period, report_kind, horizon)`  
This is how industry aggregates stay **separate per entity type**.

---

### 3.8 `selector_state`

Persisted Hub Industry Selector System state (per user).

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `user_id` | int | Hub user |
| `entity_type` | enum | Active plane |
| `industry` | text | |
| `subtype` | text | Must match `entity_type` taxonomy |
| `scale` | text | |
| `period` | text | |
| `updated_at` | timestamptz | |

**Unique:** `(user_id)` — one active selector snapshot per user  
**Check:** subtype enum matches plane (enforced in app + optional trigger)

---

## 4. Normalization contract (before INSERT)

All writers must run the Anonymization & Normalization Engine first:

```
RawEntityRecord
  → stripIdentifiers()
  → tokenizeEntityId()        // proj_* | co_*
  → standardize* + normalizeMetrics()
  → INSERT entity + metrics   // hours_basis = 200000
```

Rejected if:

- `hours_basis ≠ 200000`
- `normalized_at` missing
- token plane ≠ target table plane
- raw PII fields present on write path

---

## 5. Aggregate materialization

| Source | Target | Plane |
|--------|--------|-------|
| `project_metrics` + dims | `trend_cache` (`entity_type=project`) | project |
| `company_metrics` + dims | `trend_cache` (`entity_type=company`) | company |
| Trend Engine report | `trend_cache.report_kind=full_trends` | single plane |

Blind aggregation: distinct tokens ≥ 5 else `suppressed=true`, `payload` metrics null.

---

## 6. Cross-category comparison

Not a table. Runtime:

1. Load `trend_cache` row for project cohort  
2. Load `trend_cache` row for company cohort  
3. Return `{ project, company }` — never merge into one aggregate row  
4. Audit `explicitConsent`

---

## 7. Index strategy (summary)

- Entity: `(industry, subtype, scale)`
- Metrics: `(period)`, `(project_id|company_id, period)` unique
- Plane facts: `(entity_type, period)`, `(entity_type, token, period)` unique
- Cache: unique cohort key including `entity_type`
- Selector: unique `user_id`

---

## 8. Artifacts

| Artifact | Path |
|----------|------|
| This design | `verihub/INDUSTRY-SAFETY-INTELLIGENCE/data-model.md` |
| TS contracts | `verihub/INDUSTRY-SAFETY-INTELLIGENCE/data-model.ts` |
| SQL migration | `backend/prisma/migrations/20260710070000_visi_dual_dashboard_data_model/migration.sql` |
| Prisma models | `backend/prisma/schema.prisma` (`Visi*` models) |
