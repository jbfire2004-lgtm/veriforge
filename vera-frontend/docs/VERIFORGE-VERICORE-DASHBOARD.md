# VERICore Dashboard — VeriForge Design Spec

**Domain:** VERICore (Safety / SMS)  
**Entities:** company · project · contractor · worker  
**Status:** Preview implemented (in-memory store + Next.js API + UI at `/core/dashboard`)  
**Route:** `/core/dashboard` (Vera Core module bar)  
**Code:** `lib/vericore-dashboard/*`, `app/api/v1/core/dashboard/*`, `components/vericore-dashboard/*`  
**Related:** Safety Hub (`/pm/safety-hub`), VISI (`/hub/industry-safety`), Document Service, Readiness Engine, [Contractor Safety Score](./VERIFORGE-CONTRACTOR-SAFETY-SCORE.md)

---

## 1. Product intent

One company- and project-scoped **SMS command surface** that answers:

1. Are our people trained and current?
2. How is our safety performance trending vs ourselves and vs industry?
3. How are projects and contractors performing — together and separately?
4. What documents and records sit under every number?

Every metric is **clickable**, shows its **formula**, and drills into **underlying rows + documents**. Industry comparisons reuse **VISI** (anonymized cohorts, plane isolation, n≥5 gating) and add **percentile rank**.

---

## 2. Information architecture

```
/core/dashboard                         Company VERICore Dashboard
/core/dashboard?projectId={id}          Project-scoped view (same shell)
/core/dashboard/drill/{metricKey}       Drill-down sheet / page
/core/dashboard/contractors/{companyId} Contractor performance panel
```

**Shell (Vera navigation — non-negotiable):**
- Global header + Vera Core module bar
- `ContentContainer` + `PageLayout` (title, period filter, refresh)
- No sidebars / horizontal module tabs

**Primary layout (first viewport → scroll):**

| Zone | Purpose |
|------|---------|
| A. Context bar | Company · optional project · period · location/crew filters · live freshness |
| B. Training Snapshot | Compliance %, overdue %, role breakdown + industry vs |
| C. Safety Performance | FLHA/JHA rate, incident, near miss, CAPA closure, high-risk tasks |
| D. Projects & Contractors | Project combined snapshot + contractor scorecards |
| E. Activity / freshness | Last rebuild, recent document events |

Drill-downs open as a **right sheet** (desktop) / **full page** (mobile), never nested modals.

---

## 3. Metric catalog & formulas

All rates use a shared hours basis when applicable.

| Key | Label | Formula | Denominator | Drill entity |
|-----|-------|---------|-------------|--------------|
| `training.compliant_pct` | Fully compliant | `workers_fully_compliant / workers_in_scope × 100` | Active workers in filter | Worker + required courses |
| `training.overdue_pct` | Overdue training | `workers_with_≥1_overdue / workers_in_scope × 100` | Active workers | Worker, course, due date |
| `training.by_role` | Role breakdown | Same as above grouped by `role_band ∈ {field, supervisor, office}` | Per band | Filtered worker list |
| `sms.flha_jha_per_1k` | FLHAs/JHAs per 1k hrs | `(completed_flha_jha_count / work_hours) × 1000` | Period work hours | JHA/FLHA documents |
| `sms.incident_rate` | Incident rate (TRIF-style) | `(recordable_incidents / work_hours) × 200000` | Period work hours | Incident docs |
| `sms.near_miss_rate` | Near miss reporting rate | `(near_miss_count / work_hours) × 200000` | Period work hours | Near-miss / observation docs |
| `sms.capa_closure_days` | CAPA closure time | `avg(closed_at − opened_at)` for CAPAs closed in period | Closed CAPAs | CAPA + linked CAIL |
| `sms.high_risk_task_freq` | High-risk task frequency | `high_energy_or_critical_task_events / work_hours × 1000` | Period work hours | JHA/FLHA with HECA/high-energy flags |
| `contractor.program_score` | Contractor program assessment | Weighted rubric (see §6) | Contractor on project | Rubric dimensions + evidence |
| `contractor.incident_rate` | Contractor incident rate | Same as company, scoped to contractor workers on project | Contractor hours | Incidents |
| `contractor.flha_completion` | Contractor FLHA completion | `completed / expected` for contractor crews | Expected FLHAs | FLHA docs |
| `contractor.training_compliant_pct` | Contractor training | Same as company training, contractor workers | Contractor workers | Worker training rows |

**Role bands (training):**
- `field` — craft / operator / labor
- `supervisor` — foreman / superintendent / site supervisor
- `office` — admin / HSE office / PM office (non-field)

**Work hours source (priority):**
1. Project timesheets / daily logs aggregated hours  
2. VISI `hours_worked` when contributed  
3. Fallback: `headcount × scheduled_hours` (flagged as `hoursBasis: estimated`)

Every API metric payload includes:

```ts
{
  key: string;
  value: number | null;
  unit: string;
  formula: string;          // human-readable
  formulaId: string;        // stable id for docs
  inputs: Record<string, number | null>;
  asOf: string;             // ISO
  hoursBasis: "actual" | "estimated" | "unavailable";
  sampleSuppressed?: boolean;
}
```

---

## 4. Data model

### 4.1 Snapshot tables (company / project)

Mirror Safety Hub’s cached snapshot pattern; VERICore owns SMS-facing metrics.

```prisma
enum VeriCoreMetricScope {
  company
  project
  contractor_on_project
}

enum VeriCoreRoleBand {
  field
  supervisor
  office
  unknown
}

/// Cached dashboard payload for fast first paint.
model VeriCoreDashboardSnapshot {
  id            String   @id @default(uuid())
  companyId     Int      @map("company_id")
  projectId     Int?     @map("project_id")
  periodStart   DateTime @map("period_start")
  periodEnd     DateTime @map("period_end")
  scope         VeriCoreMetricScope @default(company)
  snapshotJson  Json     @default("{}") @map("snapshot_json")
  revision      Int      @default(1)
  generatedAt   DateTime @default(now()) @map("generated_at")
  sourceHash    String?  @map("source_hash") // inputs fingerprint

  company Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  project Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([companyId, projectId, periodStart, periodEnd, scope])
  @@index([companyId, generatedAt])
  @@map("vericore_dashboard_snapshot")
}

/// Materialized metric facts for drill-down & industry export.
model VeriCoreMetricFact {
  id          String   @id @default(uuid())
  companyId   Int      @map("company_id")
  projectId   Int?     @map("project_id")
  contractorCompanyId Int? @map("contractor_company_id")
  metricKey   String   @map("metric_key")
  periodStart DateTime @map("period_start")
  periodEnd   DateTime @map("period_end")
  value       Float?
  unit        String
  inputsJson  Json     @default("{}") @map("inputs_json")
  formulaId   String   @map("formula_id")
  computedAt  DateTime @default(now()) @map("computed_at")

  @@index([companyId, metricKey, periodEnd])
  @@index([projectId, metricKey])
  @@map("vericore_metric_fact")
}

/// Training overdue / compliance row cache for drill lists.
model VeriCoreTrainingComplianceRow {
  id              String   @id @default(uuid())
  companyId       Int      @map("company_id")
  projectId       Int?     @map("project_id")
  workerId        Int      @map("worker_id")
  roleBand        VeriCoreRoleBand @map("role_band")
  locationId      Int?     @map("location_id")
  crewId          String?  @map("crew_id")
  jobId           String?  @map("job_id")
  courseId        Int?     @map("course_id")
  courseName      String   @map("course_name")
  status          String   // compliant | expiring_soon | overdue | missing
  dueAt           DateTime? @map("due_at")
  completedAt     DateTime? @map("completed_at")
  trainingRecordId Int?    @map("training_record_id")
  refreshedAt     DateTime @default(now()) @map("refreshed_at")

  @@index([companyId, status, roleBand])
  @@index([projectId, status])
  @@index([workerId])
  @@map("vericore_training_compliance_row")
}

/// ISNetworld-style contractor program assessment.
model VeriCoreContractorAssessment {
  id                    String   @id @default(uuid())
  primeCompanyId        Int      @map("prime_company_id")
  contractorCompanyId   Int      @map("contractor_company_id")
  projectId             Int?     @map("project_id")
  overallScore          Float    @map("overall_score") // 0–100
  dimensionsJson        Json     @map("dimensions_json")
  /// e.g. { safetyProgram, training, incidentHistory, insurance, audit }
  evidenceRefsJson      Json     @default("[]") @map("evidence_refs_json")
  assessedAt            DateTime @map("assessed_at")
  assessedByUserId      Int?     @map("assessed_by_user_id")
  source                String   @default("internal") // internal | import | linked
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@unique([primeCompanyId, contractorCompanyId, projectId])
  @@index([projectId, overallScore])
  @@map("vericore_contractor_assessment")
}

/// Linked related companies on a project (JV, owner, sister ops).
model VeriCoreProjectCompanyLink {
  id              String   @id @default(uuid())
  projectId       Int      @map("project_id")
  companyId       Int      @map("company_id")
  linkRole        String   @map("link_role") // prime | contractor | owner | jv | related
  includeInRollup Boolean  @default(true) @map("include_in_rollup")
  createdAt       DateTime @default(now()) @map("created_at")

  @@unique([projectId, companyId, linkRole])
  @@map("vericore_project_company_link")
}

/// Industry comparison cache (company self vs VISI cohort + percentile).
model VeriCoreIndustryComparison {
  id              String   @id @default(uuid())
  companyId       Int      @map("company_id")
  metricKey       String   @map("metric_key")
  period          String   // YYYY-MM or YYYY-Qn
  industry        String
  scaleBand       String?  @map("scale_band")
  companyValue    Float?   @map("company_value")
  industryMean    Float?   @map("industry_mean")
  industryP25     Float?   @map("industry_p25")
  industryP50     Float?   @map("industry_p50")
  industryP75     Float?   @map("industry_p75")
  percentileRank  Float?   @map("percentile_rank") // 0–100, higher = better unless inverted
  direction       String   @default("higher_better") // higher_better | lower_better
  cohortSize      Int      @map("cohort_size")
  sampleSuppressed Boolean @default(false) @map("sample_suppressed")
  computedAt      DateTime @default(now()) @map("computed_at")

  @@unique([companyId, metricKey, period, industry, scaleBand])
  @@map("vericore_industry_comparison")
}
```

### 4.2 Snapshot JSON shape (company)

```ts
type VeriCoreCompanyDashboard = {
  generatedAt: string;
  revision: number;
  companyId: number;
  projectId: number | null;
  period: { start: string; end: string };
  filtersApplied: {
    locationId?: number;
    crewId?: string;
    jobId?: string;
    roleBand?: "field" | "supervisor" | "office";
  };
  training: {
    compliantPct: Metric;
    overduePct: Metric;
    byRole: Array<{
      roleBand: "field" | "supervisor" | "office";
      compliantPct: number;
      overduePct: number;
      headcount: number;
    }>;
    industry: IndustryCompare; // training.compliant_pct
  };
  safety: {
    flhaJhaPer1k: Metric;
    incidentRate: Metric;
    nearMissRate: Metric;
    capaClosureDays: Metric;
    highRiskTaskFreq: Metric;
    industry: {
      incidentRate: IndustryCompare;
      nearMissRate: IndustryCompare;
      capaClosureDays: IndustryCompare;
    };
  };
  projectsSummary?: Array<{
    projectId: number;
    name: string;
    alertScore: number;
    trainingCompliantPct: number;
    incidentRate: number | null;
  }>;
  freshness: {
    lastEventAt: string | null;
    lastRebuildAt: string;
    pendingInvalidation: boolean;
  };
};

type IndustryCompare = {
  companyValue: number | null;
  industryMean: number | null;
  percentileRank: number | null;
  cohortSize: number;
  sampleSuppressed: boolean;
  period: string;
};
```

### 4.3 Project dashboard extension

```ts
type VeriCoreProjectDashboard = VeriCoreCompanyDashboard & {
  combined: {
    companyWorkers: SafetySlice;
    contractors: SafetySlice;
    rollup: SafetySlice; // weighted by hours
  };
  contractors: Array<{
    contractorCompanyId: number;
    name: string;
    programScore: Metric; // ISNetworld-style
    dimensions: Array<{ id: string; label: string; score: number; weight: number }>;
    incidentRate: Metric;
    flhaCompletionPct: Metric;
    trainingCompliantPct: Metric;
    linkedDocumentsHref: string;
  }>;
  linkedCompanies: Array<{
    companyId: number;
    name: string;
    linkRole: string;
    includeInRollup: boolean;
    snapshot: SafetySlice;
  }>;
};

type SafetySlice = {
  workHours: number;
  trainingCompliantPct: number;
  flhaJhaPer1k: number | null;
  incidentRate: number | null;
  nearMissRate: number | null;
  capaClosureDays: number | null;
};
```

---

## 5. API endpoints

Base: `/api/v1/core/dashboard`  
Guards: JWT + `@RequireModule('vera.core.dashboard')` (map to existing Core ACP permission)  
Tenant: company scoped; project must belong to tenant.

### 5.1 Snapshots

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/core/dashboard/company` | Company snapshot |
| `GET` | `/api/v1/core/dashboard/project?projectId=` | Project + contractors |
| `POST` | `/api/v1/core/dashboard/refresh` | Force rebuild |
| `GET` | `/api/v1/core/dashboard/revision` | Lightweight `{ revision, generatedAt }` for polling |
| `POST` | `/api/v1/core/dashboard/events` | Preview: simulate training/document events |
| `GET` | `/api/v1/core/dashboard/drill?metricKey=` | Paginated underlying rows + formula |
| `GET` | `/api/v1/core/dashboard/contractors?contractorCompanyId=` | Contractor score profile + docs |

**Preview note:** Implemented as Next.js in-memory routes (not Nest yet). Dynamic path segments under `/api/v1` are avoided because Next rewrites previously proxied unmatched `/api/v1/*` to the backend.

**Query params (company & project):**  
`periodStart`, `periodEnd`, `locationId`, `crewId`, `jobId`, `roleBand`, `refresh=true`

### 5.2 Drill-downs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/core/dashboard/drill/:metricKey` | Paginated underlying rows + formula |
| `GET` | `/api/v1/core/dashboard/drill/training.overdue_pct` | Specialized overdue worker/course list |

**Drill response:**

```ts
{
  metricKey: string;
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
  filters: object;
  page: number;
  pageSize: number;
  total: number;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    dueAt?: string;
    href: string;           // deep link into Core/PM/Document
    documentId?: string;
    documentType?: string;
  }>;
}
```

### 5.3 Contractors & links

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/core/dashboard/project/:projectId/contractors` | Scorecards list |
| `GET` | `/api/v1/core/dashboard/project/:projectId/contractors/:contractorCompanyId` | Detail + docs |
| `PUT` | `/api/v1/core/dashboard/project/:projectId/contractors/:id/assessment` | Upsert program score |
| `GET` | `/api/v1/core/dashboard/project/:projectId/links` | Linked companies |
| `POST` | `/api/v1/core/dashboard/project/:projectId/links` | Link related company |
| `DELETE` | `/api/v1/core/dashboard/project/:projectId/links/:linkId` | Unlink |

### 5.4 Industry comparison

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/core/dashboard/industry-compare` | Batch compare for dashboard metrics |
| `GET` | `/api/v1/hub/industry-safety/company/vs-industry` | Existing VISI engine (reuse) |

`industry-compare` is a **facade** that:
1. Reads company `VeriCoreMetricFact` values  
2. Calls VISI cohort stats (mean + distribution)  
3. Computes percentile  
4. Writes/reads `VeriCoreIndustryComparison` cache  

---

## 6. Contractor program assessment (ISNetworld-style)

Internal rubric (weights configurable per prime company):

| Dimension | Default weight | Inputs |
|-----------|----------------|--------|
| Safety program completeness | 25% | Policy docs, orientations, SMS artifacts |
| Training compliance | 20% | Contractor worker training % |
| Incident / EMR history | 20% | TRIF/LTIF, severity, open investigations |
| Audit / inspection performance | 15% | Open deficiencies, closeout speed |
| Insurance & qualification | 10% | COI current, trade quals |
| Leading indicators | 10% | FLHA completion, near-miss rate |

`overallScore = Σ (dimensionScore × weight)`.  
Scores stored on `VeriCoreContractorAssessment`; evidence links into Document Service / Safety Evidence Index.

---

## 7. Reactive freshness strategy

### 7.1 Event-driven rebuild (primary)

Extend domain events → `vericore.dashboard.invalidate` (same pattern as `safety_hub.invalidate`):

| Source event | Invalidates |
|--------------|-------------|
| `training.*`, `compliance.recalc` | Training snapshot + facts |
| `jha_flha.*` / document FLHA/JHA completed | FLHA rate, high-risk freq |
| `incident.*`, `investigation.*` | Incident / near-miss rates |
| `capa.*`, `cail.*` | CAPA closure |
| `inspection.*` | Contractor audit dimension |
| `document.completed` / `document.status_changed` | Any metric with doc provenance |
| Contractor assessment upsert | Contractor cards |

Handler:
1. Append `PmSafetyHubEventLog`-style event (or `VeriCoreDashboardEventLog`)  
2. Debounce rebuild (e.g. 5–15s coalescing per company/project)  
3. Recompute facts → upsert snapshot → bump `revision`

### 7.2 Polling (client)

```ts
// every 20–30s while dashboard mounted
GET /api/v1/core/dashboard/revision?companyId=&projectId=
// if revision > local → refetch snapshot
```

Optional later: SSE `/api/v1/core/dashboard/stream` for multi-tab live updates.

### 7.3 Document Service bridge

When Document Service ships production events, map:

`document_type ∈ {flha, jha, incident, inspection, training_record, corrective_action}`  
→ domain invalidate → snapshot rebuild → drill lists resolve `documentId`.

Until then, rebuild from Prisma operational tables (JhaFlha, TrainingRecord, PmCorrectiveAction, Incident, etc.).

---

## 8. UI layout & interaction design

### 8.1 Visual language

Use VeriForge industrial kit (`vfSurface`, safety blue `#1E6FB8`, inspection teal, muted amber for overdue, controlled red for critical only).  
Compose with `WorkspaceHero` / metric cards consistent with Safety Hub — **not** a purple SaaS dashboard.

### 8.2 Company dashboard wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ VERICore Dashboard          [Period ▾] [Location] [Crew] [↻] │
│ Company: Acme Civil · Fresh · rev 184 · 2m ago               │
├─────────────────────────────┬────────────────────────────────┤
│ TRAINING SNAPSHOT           │ vs Industry                    │
│ Compliant 87%  Overdue 9%   │ Compliance 87% vs 81% mean     │
│ [████████░░] by role        │ Percentile: 72nd               │
│ Field 84% · Sup 91% · Off 95│                                │
│ ▶ Click Overdue → drill     │                                │
├─────────────────────────────┴────────────────────────────────┤
│ SAFETY PERFORMANCE                                           │
│ [FLHA/1k] [Incident] [Near miss] [CAPA days] [High-risk/1k]  │
│ each card: value · spark · industry delta · formula tooltip  │
├──────────────────────────────────────────────────────────────┤
│ PROJECTS & CONTRACTORS                                       │
│ Project table OR (if project scoped) combined + scorecards   │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Interactions

| Affordance | Behavior |
|------------|----------|
| Click metric value / card | Open drill sheet with rows + formula panel |
| Click “Overdue training” | Drill filtered to `status=overdue`; filters location/crew/job/role |
| Role segment click | Filter training drill to that `roleBand` |
| Industry percentile | Tooltip: cohort size, period, higher/lower-better; link to Hub VISI |
| Contractor score | Expand dimensions; click metric → contractor-scoped drill + docs |
| Linked company chip | Toggle include-in-rollup; open that company’s slice |
| Formula “ⓘ” | Shows formula string + input values used for *this* computation |
| Stale banner | If `pendingInvalidation` or age > threshold → “Updating…” / Retry |

### 8.4 Drill sheet layout

1. **Header:** metric label, value, period  
2. **Formula strip:** `formula` + `inputs` chips  
3. **Filters:** location, crew, job, role (training); status (docs)  
4. **Table:** underlying entities with deep links  
5. **Footer:** export CSV (phase 2), open in Completed Documents Hub with prefilled filters  

---

## 9. Industry benchmark integration strategy

### 9.1 Reuse VISI (do not fork)

- **Plane:** company-plane only for company dashboard comparisons  
- **Gating:** suppress when cohort `n < 5` (`sampleSuppressed: true`)  
- **Isolation:** never mix project-plane into company vs industry  
- **Existing API:** `GET /api/v1/hub/industry-safety/company/vs-industry`  

### 9.2 Percentile rank (new)

VISI today exposes cohort mean/stddev/slope. VERICore adds:

1. Nightly (or on-demand) job builds anonymized value arrays per `{industry, scale, metric, period}`  
2. Percentile = percent of cohort with *worse* performance given metric direction  
   - `lower_better` (incident rate): higher percentile = safer  
   - `higher_better` (training compliance, near-miss reporting*): define product rule explicitly  
3. Cache on `VeriCoreIndustryComparison`  

\*Near-miss reporting: treat as **higher_better** (reporting culture), not as failure rate.

### 9.3 Metrics mapped to VISI

| VERICore metric | VISI / trend field |
|-----------------|--------------------|
| Incident rate | `incident_rate_per_200k` / TRIF |
| Near miss rate | near-miss leading indicator |
| CAPA closure | `VisiCorrectiveAction.on_time_rate` / aging |
| Training compliance | `VisiCompetencyProfile.current_rate` |
| FLHA/JHA per 1k | leading indicator / observation-style (extend if missing) |

### 9.4 Contribution path

Company opt-in → anonymize via `@vera/hub-industry-safety` → normalize → cohort aggregates.  
Dashboard never shows peer identities.

---

## 10. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **A** | Prisma models + company snapshot builder (training + safety from existing tables) + `GET company` + revision poll |
| **B** | Drill APIs + overdue training UI + formula strip |
| **C** | Project dashboard + contractor assessments + company links |
| **D** | Event invalidation handler + Document Service event bridge |
| **E** | Industry compare facade + percentile job + Hub deep links |

---

## 11. Alignment with existing Vera surfaces

| Concern | Reuse |
|---------|--------|
| Snapshot cache + invalidate | `PmSafetyHubSnapshot` / event handler pattern |
| Industry cohorts | VISI + `VisiSelfVsIndustryService` |
| Training source of truth | Core readiness / `TrainingRecord` |
| FLHA/JHA | `JhaFlha` + Document Service types |
| CAPA | `PmCorrectiveAction` |
| Contractor membership | `PmContractorPortalMembership` |
| UI shell | Vera Core nav + VeriForge surfaces |
| Evidence / docs | Completed Documents Hub + Safety Evidence Index |

VERICore Dashboard is the **SMS narrative layer** for Core; Safety Hub remains the **cross-module ops hub** under VeriPM. They share events and can share fact tables later; they should not duplicate navigation.

---

## 12. Acceptance criteria (design → build)

- [ ] Company dashboard shows training compliant %, overdue %, role breakdown  
- [ ] Overdue click → filtered worker/course/due list with location/crew/job/role filters  
- [ ] Training vs industry mean + percentile (or suppressed state)  
- [ ] Five safety metrics with drill to documents/records + visible formula  
- [ ] Industry compare for incident, near miss, CAPA  
- [ ] Project view: combined company+contractor slice, contractor scores & stats, linked companies  
- [ ] Revision polling or event-driven refresh within ~30s of source change  
- [ ] Every card exposes drill-down; no dead metrics  
