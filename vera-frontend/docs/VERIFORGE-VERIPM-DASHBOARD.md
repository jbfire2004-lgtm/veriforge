# VERIPM Dashboard — VeriForge Design Spec

**Domain:** VERIPM (Preventive Maintenance / Assets)  
**Entities:** company · project · contractor · asset · worker  
**Status:** Preview implemented (in-memory store + Next.js API + UI at `/pm/dashboard`)  
**Route:** `/pm/dashboard` (VeriPM module bar)  
**Code:** `lib/veripm-dashboard/*`, `app/api/v1/veripm-dashboard/*`, `components/veripm-dashboard/*`  
**Related:** VERICore Dashboard, Equipment Safety (`/pm/equipment-safety`), Contractor Safety Score, Document Service (VERIPM types), VISI, Safety Hub, [Dashboard System](./VERIFORGE-DASHBOARD-SYSTEM.md)

---

## 1. Product intent

One company- and project-scoped **maintenance + asset safety command surface** that answers:

1. Are PMs on schedule, and which work orders are overdue?
2. How much downtime and failure risk are we carrying?
3. Which maintenance activities are creating (or preventing) safety exposure?
4. How do our contractors perform on *our* projects — PM and safety together?
5. How do we compare to industry on PM completion, downtime, and maintenance-related incidents?

Every metric is **clickable**, shows its **formula**, and drills into **work orders, assets, incidents, FLHA/JHAs, or documents**. Safety slices are **pulled from VERICore** (shared facts / facade), not recalculated with divergent definitions.

---

## 2. Information architecture

```
/pm/dashboard                                      Company VERIPM Dashboard
/pm/dashboard?projectId={id}                       Project-scoped view
/pm/dashboard/drill/{metricKey}                    Drill-down sheet / page
/pm/dashboard/contractors/{contractorCompanyId}    Contractor performance panel
/pm/dashboard/assets/{equipmentId}                 Asset deep link (→ equipment-safety profile)
/pm/dashboard/companies/{companyId}                Related company profile slice
```

**Shell (Vera navigation — non-negotiable):**
- Global header + VeriPM module bar
- `ContentContainer` + `PageLayout` (title, period, site/fleet filters, refresh)
- No sidebars / horizontal module tabs for module switching

**Primary layout (first viewport → scroll):**

| Zone | Purpose |
|------|---------|
| A. Context bar | Company · optional project · period · site/fleet/asset class · live freshness |
| B. Maintenance Snapshot | PM completion, overdue WOs, downtime, failure rate + industry vs |
| C. Maintenance-linked Safety | Incidents on PM work, FLHA/JHAs on WOs, high-risk PM tasks (from VERICore + links) |
| D. Projects & related companies | Project PM+safety; owner/prime/subs with scores |
| E. Contractors | Contractors on this company’s projects (company view) or this project |
| F. Freshness | Last rebuild, recent PM/safety document events |

Drill-downs: **right sheet** (desktop) / **full page** (mobile).

---

## 3. Metric catalog & formulas

### 3.1 Maintenance metrics

| Key | Label | Formula | Denominator | Drill entity |
|-----|-------|---------|-------------|--------------|
| `pm.completion_rate` | PM completion rate | `pm_completed_on_time / pm_due_in_period × 100` | PM tasks/WOs due in period | Work orders / PM tasks |
| `pm.overdue_count` | Overdue PM tasks | `count(status ∈ overdue ∪ open past dueAt)` | — (count) | Work order list |
| `pm.overdue_pct` | Overdue PM % | `overdue / (due_in_period + still_open_overdue) × 100` | Due + carryover overdue | Same as overdue |
| `asset.downtime_hours` | Asset downtime | `Σ downtime_intervals` in period (see §3.3) | — (hours) | Downtime events / lockouts |
| `asset.downtime_pct` | Downtime % | `downtime_hours / available_hours × 100` | Fleet available hours | Same |
| `asset.failure_rate` | Failure rate | `(failures / operating_hours) × 1000` | Operating hours | `PmEquipmentFailure` + docs |
| `asset.mtbf_hours` | MTBF (secondary) | `operating_hours / failure_count` | Failures > 0 | Failures |
| `asset.mttr_hours` | MTTR (secondary) | `avg(restored_at − failed_at)` | Closed failures | Failures |

### 3.2 Safety metrics (from VERICore + maintenance linkage)

These use **VERICore formula IDs** where possible, filtered by maintenance linkage.

| Key | Label | Formula | Linkage rule | Drill entity |
|-----|-------|---------|--------------|--------------|
| `pm_safety.incident_rate` | Maintenance-related incident rate | `(maintenance_linked_incidents / work_hours) × 200000` | Incident ↔ equipment/WO/PM task (§3.4) | Incidents |
| `pm_safety.incident_count` | Incidents related to maintenance | `count(maintenance_linked_incidents)` | Same | Incident list |
| `pm_safety.flha_jha_on_wo` | FLHAs/JHAs linked to PM WOs | `count(completed flha/jha with wo_or_equipment link)` | JHA required on WO / `JhaFlhaEquipment` | FLHA/JHA docs |
| `pm_safety.flha_jha_coverage` | FLHA/JHA coverage on PM work | `wos_with_completed_jha / wos_requiring_jha × 100` | `requiredJhaId` / high-risk flag | WO list missing JHA |
| `pm_safety.high_risk_pm_freq` | High-risk maintenance tasks | `(high_risk_pm_events / work_hours) × 1000` | LOTO, critical energy, HECA on WO/JHA | High-risk WOs / JHAs |

### 3.3 Downtime definition

Priority sources (first available wins per interval; mark `hoursBasis`):

1. Explicit downtime / out-of-service intervals (future `VeriPmDowntimeEvent`)  
2. Active LOTO / `Equipment.lockedOutAt` windows  
3. Failure open → close intervals (`PmEquipmentFailure`)  
4. Estimated from overdue critical inspections (flagged `estimated`)

`available_hours = fleet_assets × period_hours × duty_factor` (duty_factor configurable; default 1.0 for 24/7 fleets, 0.33 for single-shift).

### 3.4 Maintenance ↔ safety linkage rules

An incident / FLHA / JHA is **maintenance-linked** if any of:

- `equipmentId` on the record matches an asset in scope  
- Linked `workOrderId` / `pmTaskId` / `PmPmTask.id`  
- `PmEquipmentFailure.safetyEventId` / CAPA `sourceModule = equipment_failure`  
- Document Service link: VERIPM `WorkOrder`/`PMTask` ↔ VERICORE `Incident`/`FLHA`/`JHA` via `related_document_ids`  
- Inspection on equipment that spawned CAPA/incident in period  

### 3.5 Contractor metrics (company & project)

| Key | Scope | Formula |
|-----|-------|---------|
| `contractor.program_score` | Shared with VERICore | ISNetworld-style weighted rubric |
| `contractor.incident_rate_on_prime` | Company dashboard | Incidents by contractor workers on **this company’s** projects |
| `contractor.training_compliant_pct` | Company / project | Training compliance for contractor workers on this company’s sites / this project |
| `contractor.pm_completion_rate` | Project / company | PM WOs assigned to contractor completed on time |
| `contractor.flha_coverage` | Project | FLHA/JHA coverage on contractor PM work |

Every API metric includes:

```ts
{
  key: string;
  value: number | null;
  unit: string;
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
  asOf: string;
  hoursBasis: "actual" | "estimated" | "unavailable";
  source: "veripm" | "vericore" | "shared";
  sampleSuppressed?: boolean;
}
```

---

## 4. Data model

### 4.1 Operational sources (existing — read)

| Concern | Source |
|---------|--------|
| PM schedules / performed | `MaintenanceSchedule`, `EquipmentMaintenance` |
| Project PM tasks | `PmPmTask`, `PmWorkPackage` |
| Failures / LOTO | `PmEquipmentFailure`, `PmEquipmentLoto`, `Equipment.lockedOutAt` |
| Equipment inspections | `PmEquipmentInspection`, `PmInspection.equipmentId` |
| JHA ↔ equipment | `JhaFlhaEquipment`, `PmPmTask.requiredJhaId` |
| Contractors on project | `PmContractorPortalMembership`, `PmProjectConfig.subcontractorIds` |
| VERIPM documents | Document Service types: `WorkOrder`, `PMTask`, `FailureReport`, `VendorServiceReport`, … |

### 4.2 New VERIPM dashboard tables

```prisma
enum VeriPmMetricScope {
  company
  project
  contractor_on_company
  contractor_on_project
  asset
}

/// Canonical work order facade (bridges PmPmTask, schedules, Document Service).
model VeriPmWorkOrder {
  id                 String   @id @default(uuid())
  companyId          Int      @map("company_id")
  projectId          Int?     @map("project_id")
  equipmentId        Int?     @map("equipment_id")
  contractorCompanyId Int?    @map("contractor_company_id")
  title              String
  woNumber           String?  @map("wo_number")
  woType             String   @map("wo_type") // preventive | corrective | inspection | vendor
  status             String   // draft | open | in_progress | completed | cancelled | overdue
  priority           String   @default("medium")
  dueAt              DateTime? @map("due_at")
  completedAt        DateTime? @map("completed_at")
  completedOnTime    Boolean?  @map("completed_on_time")
  highRisk           Boolean  @default(false) @map("high_risk")
  requiresJha        Boolean  @default(false) @map("requires_jha")
  jhaFlhaId          String?  @map("jha_flha_id")
  pmTaskId           String?  @map("pm_task_id") // PmPmTask
  scheduleId         Int?     @map("schedule_id") // MaintenanceSchedule
  documentId         String?  @map("document_id") // Document Service
  failureId          String?  @map("failure_id")
  vendorReportDocId  String?  @map("vendor_report_doc_id")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@index([companyId, status, dueAt])
  @@index([projectId, status])
  @@index([equipmentId, status])
  @@index([contractorCompanyId, status])
  @@map("veripm_work_order")
}

model VeriPmDowntimeEvent {
  id          String   @id @default(uuid())
  companyId   Int      @map("company_id")
  projectId   Int?     @map("project_id")
  equipmentId Int      @map("equipment_id")
  startedAt   DateTime @map("started_at")
  endedAt     DateTime? @map("ended_at")
  hours       Float?   // denormalized when closed
  reason      String   // failure | loto | planned | inspection_hold | other
  sourceType  String   @map("source_type") // failure | loto | manual | estimated
  sourceId    String?  @map("source_id")
  workOrderId String?  @map("work_order_id")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([companyId, startedAt])
  @@index([equipmentId, startedAt])
  @@map("veripm_downtime_event")
}

model VeriPmDashboardSnapshot {
  id           String   @id @default(uuid())
  companyId    Int      @map("company_id")
  projectId    Int?     @map("project_id")
  periodStart  DateTime @map("period_start")
  periodEnd    DateTime @map("period_end")
  scope        VeriPmMetricScope @default(company)
  snapshotJson Json     @default("{}") @map("snapshot_json")
  revision     Int      @default(1)
  generatedAt  DateTime @default(now()) @map("generated_at")
  sourceHash   String?  @map("source_hash")

  @@unique([companyId, projectId, periodStart, periodEnd, scope])
  @@index([companyId, generatedAt])
  @@map("veripm_dashboard_snapshot")
}

model VeriPmMetricFact {
  id                  String   @id @default(uuid())
  companyId           Int      @map("company_id")
  projectId           Int?     @map("project_id")
  contractorCompanyId Int?     @map("contractor_company_id")
  equipmentId         Int?     @map("equipment_id")
  metricKey           String   @map("metric_key")
  periodStart         DateTime @map("period_start")
  periodEnd           DateTime @map("period_end")
  value               Float?
  unit                String
  inputsJson          Json     @default("{}") @map("inputs_json")
  formulaId           String   @map("formula_id")
  source              String   @default("veripm") // veripm | vericore | shared
  computedAt          DateTime @default(now()) @map("computed_at")

  @@index([companyId, metricKey, periodEnd])
  @@index([projectId, metricKey])
  @@map("veripm_metric_fact")
}

/// Maintenance ↔ safety join index for fast drills.
model VeriPmSafetyLink {
  id           String   @id @default(uuid())
  companyId    Int      @map("company_id")
  projectId    Int?     @map("project_id")
  workOrderId  String?  @map("work_order_id")
  equipmentId  Int?     @map("equipment_id")
  linkType     String   @map("link_type") // incident | flha_jha | capa | inspection
  targetType   String   @map("target_type")
  targetId     String   @map("target_id")
  documentId   String?  @map("document_id")
  occurredAt   DateTime @map("occurred_at")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([companyId, linkType, occurredAt])
  @@index([workOrderId])
  @@index([equipmentId, linkType])
  @@map("veripm_safety_link")
}

model VeriPmIndustryComparison {
  id               String   @id @default(uuid())
  companyId        Int      @map("company_id")
  metricKey        String   @map("metric_key")
  period           String
  industry         String
  scaleBand        String?  @map("scale_band")
  companyValue     Float?   @map("company_value")
  industryMean     Float?   @map("industry_mean")
  industryP25      Float?   @map("industry_p25")
  industryP50      Float?   @map("industry_p50")
  industryP75      Float?   @map("industry_p75")
  percentileRank   Float?   @map("percentile_rank")
  direction        String   @default("higher_better")
  cohortSize       Int      @map("cohort_size")
  sampleSuppressed Boolean  @default(false) @map("sample_suppressed")
  computedAt       DateTime @default(now()) @map("computed_at")

  @@unique([companyId, metricKey, period, industry, scaleBand])
  @@map("veripm_industry_comparison")
}
```

### 4.3 Shared with VERICore (do not duplicate)

| Table / concept | Owner | VERIPM usage |
|-----------------|-------|--------------|
| `VeriCoreContractorAssessment` | VERICore | Program scores on company/project contractor cards |
| `VeriCoreProjectCompanyLink` | VERICore | Related companies (owner/prime/sub/jv); VERIPM reads + may filter `includeInRollup` |
| `VeriCoreMetricFact` (safety keys) | VERICore | Read via facade for non-maintenance-specific safety |
| Training compliance rows | VERICore | Contractor training on company sites |

If VERICore tables are not yet migrated, VERIPM may temporarily mirror contractor assessment fields in snapshot JSON, then converge.

### 4.4 Snapshot JSON (company)

```ts
type VeriPmCompanyDashboard = {
  generatedAt: string;
  revision: number;
  companyId: number;
  projectId: number | null;
  period: { start: string; end: string };
  filtersApplied: {
    siteId?: number;
    fleetId?: string;
    assetClass?: string;
    contractorCompanyId?: number;
  };
  maintenance: {
    pmCompletionRate: Metric;
    overduePmCount: Metric;
    overduePmPct: Metric;
    downtimeHours: Metric;
    downtimePct: Metric;
    failureRate: Metric;
    industry: {
      pmCompletionRate: IndustryCompare;
      downtimePct: IndustryCompare;
      maintenanceIncidentRate: IndustryCompare;
    };
  };
  safetyFromMaintenance: {
    incidentCount: Metric;
    incidentRate: Metric;
    flhaJhaLinkedCount: Metric;
    flhaJhaCoveragePct: Metric;
    highRiskPmFreq: Metric;
  };
  projectsSummary?: Array<{
    projectId: number;
    name: string;
    pmCompletionRate: number;
    overduePmCount: number;
    downtimeHours: number;
    maintenanceIncidentRate: number | null;
    contractorCount: number;
  }>;
  contractors: Array<ContractorCard>;
  freshness: {
    lastEventAt: string | null;
    lastRebuildAt: string;
    pendingInvalidation: boolean;
  };
};

type ContractorCard = {
  contractorCompanyId: number;
  name: string;
  programScore: Metric;
  incidentRateOnPrimeProjects: Metric;
  trainingCompliantPct: Metric;
  pmCompletionRate?: Metric;
  href: string;
};
```

### 4.5 Project dashboard extension

```ts
type VeriPmProjectDashboard = VeriPmCompanyDashboard & {
  projectPerformance: {
    maintenance: SafetyOrMaintSlice;
    safety: SafetyOrMaintSlice;
  };
  relatedCompanies: Array<{
    companyId: number;
    name: string;
    linkRole: "owner" | "prime" | "contractor" | "jv" | "related";
    pmCompletionRate: Metric;
    overduePmCount: Metric;
    downtimeHours: Metric;
    incidentRate: Metric;
    trainingCompliantPct: Metric;
    programScore: Metric | null; // contractors / assessed parties
    href: string;
  }>;
  contractors: Array<ContractorCard & {
    flhaCoveragePct: Metric;
    documentsHref: string;
  }>;
};
```

---

## 5. API endpoints

Base: `/api/v1/pm/dashboard`  
Guards: JWT + `@RequireModule('pm.dashboard')` (or map to existing equipment-safety / PM ACP)  
Tenant-scoped; project must belong to tenant.

### 5.1 Snapshots

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/pm/dashboard/company` | Company VERIPM snapshot |
| `GET` | `/api/v1/pm/dashboard/project/:projectId` | Project + related companies + contractors |
| `POST` | `/api/v1/pm/dashboard/refresh` | Force rebuild |
| `GET` | `/api/v1/pm/dashboard/revision` | `{ revision, generatedAt }` for polling |

**Query:** `periodStart`, `periodEnd`, `siteId`, `fleetId`, `assetClass`, `contractorCompanyId`, `refresh=true`

### 5.2 Drill-downs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/pm/dashboard/drill/:metricKey` | Paginated rows + formula |
| `GET` | `/api/v1/pm/dashboard/drill/pm.overdue_count` | Overdue work orders |
| `GET` | `/api/v1/pm/dashboard/drill/pm_safety.incident_count` | Maintenance-linked incidents |

**Drill item fields:** `id`, `title`, `subtitle`, `status`, `dueAt`, `equipmentId`, `equipmentName`, `href`, `documentId`, `documentType`, `contractorName?`

### 5.3 Contractors & related companies

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/pm/dashboard/company/contractors` | Contractors across company’s projects |
| `GET` | `/api/v1/pm/dashboard/contractors/:contractorCompanyId` | Detail + docs + metrics |
| `GET` | `/api/v1/pm/dashboard/project/:projectId/companies` | Related companies rollup |
| `GET` | `/api/v1/pm/dashboard/companies/:companyId` | Related company profile slice |
| `POST` | `/api/v1/pm/dashboard/project/:projectId/links` | Delegate to VERICore link API or shared service |

### 5.4 Industry + VERICore facade

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/pm/dashboard/industry-compare` | PM completion, downtime, maint. incident vs industry |
| `GET` | `/api/v1/core/dashboard/...` | Read-through for shared safety/training facts |
| `GET` | `/api/v1/hub/industry-safety/company/vs-industry` | VISI engine (reuse) |

### 5.5 Work order sync (internal)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/pm/dashboard/work-orders/reindex` | Rebuild `VeriPmWorkOrder` from schedules/tasks/docs |
| `GET` | `/api/v1/pm/dashboard/work-orders` | Filtered WO list (same as overdue drill generalizer) |

---

## 6. Contractor linking strategy

### 6.1 Sources of truth (merge, don’t fork)

1. **`PmContractorPortalMembership`** — prime ↔ contractor ↔ optional `projectId` (primary)  
2. **`VeriCoreProjectCompanyLink`** — owner / prime / jv / related + `includeInRollup`  
3. **`PmProjectConfig.subcontractorIds` / safety profile** — fallback for legacy projects  
4. **WO assignment** — `VeriPmWorkOrder.contractorCompanyId` for PM performance attribution  

### 6.2 Company dashboard contractor list

```
contractors = distinct contractorCompanyId from memberships
  where primeCompanyId = currentCompany
  and (projectId in companyProjects OR projectId is null with activity on company projects)
```

For each: program score (shared assessment), incident rate on prime’s projects, training compliance on prime’s sites, optional PM completion on assigned WOs.

### 6.3 Project related companies

Show chips/table for each `linkRole`. Click → `/pm/dashboard/companies/{id}?projectId=` with PM + safety + documents (Completed Documents Hub filters + equipment-safety links).

### 6.4 Program assessment

Reuse VERICore ISNetworld-style rubric (`VeriCoreContractorAssessment`). VERIPM adds optional dimension weight tilt toward **equipment/PM performance** when viewing from `/pm/dashboard` (display overlay, same stored score unless product chooses a `context=veripm` variant later).

---

## 7. Reactive freshness strategy

### 7.1 Event-driven (primary)

Emit / listen `veripm.dashboard.invalidate` (parallel to Safety Hub / VERICore):

| Source event | Invalidates |
|--------------|-------------|
| Maintenance schedule/record create/update | PM completion, overdue |
| `PmPmTask` / work package status change | PM metrics, high-risk |
| `PmEquipmentFailure` / LOTO | Downtime, failure rate, safety links |
| Equipment inspection completed | Downtime estimates, links |
| Vendor report / VERIPM document completed | WO index, drills |
| FLHA/JHA completed with equipment/WO link | `pm_safety.flha_jha_*` |
| Incident / CAPA with equipment/failure source | `pm_safety.incident_*` |
| Contractor membership / assessment upsert | Contractor cards |
| VERICore training recalc (contractor workers) | Contractor training % |

Handler: log → debounce 5–15s per company/project → reindex WOs/links as needed → recompute facts → upsert snapshot → bump `revision`.

### 7.2 Client polling

```ts
GET /api/v1/pm/dashboard/revision?companyId=&projectId=
// every 20–30s; refetch snapshot when revision increases
```

### 7.3 Cross-dashboard coherence

When a maintenance-linked safety event fires, invalidate **both** `veripm.dashboard` and `vericore.dashboard` so numbers stay aligned.

---

## 8. UI layout & interaction design

### 8.1 Visual language

VeriForge industrial kit (slate/graphite, safety blue, inspection teal, muted amber for overdue, controlled red for critical failures/LOTO only). Align with Equipment Safety + Safety Hub metric cards — not a separate visual system.

### 8.2 Company wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ VERIPM Dashboard     [Period] [Site] [Fleet] [Asset class] [↻]│
│ Company · Fresh · rev 92 · 1m ago                            │
├─────────────────────────────┬────────────────────────────────┤
│ MAINTENANCE SNAPSHOT        │ vs Industry                    │
│ PM complete 91%  Overdue 14 │ PM 91% vs 86% mean · 68th pct  │
│ Downtime 126h (2.1%)        │ Downtime 2.1% vs 3.4% · 74th   │
│ Failure 0.42 / 1k hrs       │ Maint. incident vs industry    │
│ ▶ Overdue → WO drill        │                                │
├─────────────────────────────┴────────────────────────────────┤
│ MAINTENANCE-LINKED SAFETY (from VERICore + links)            │
│ [Incidents] [FLHA/JHA on WOs] [Coverage %] [High-risk PM/1k] │
│ ▶ Incidents → incident drill                                 │
├──────────────────────────────────────────────────────────────┤
│ PROJECTS                         │ CONTRACTORS ON OUR WORK   │
│ project PM + safety summary      │ score · incident · train  │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Project wireframe additions

- Combined project PM + safety strip  
- **Related companies** table (role, PM%, overdue, downtime, incident, program score)  
- **Contractors on this project** with FLHA coverage + document links  

### 8.4 Interactions

| Affordance | Behavior |
|------------|----------|
| Click Overdue PM | Drill WOs: number, asset, due, assignee/contractor, status |
| Click maintenance incidents | Drill incidents with equipment/WO linkage shown |
| Click any metric card | Drill + formula strip (`formula` + `inputs` chips) |
| Click contractor row | Contractor panel: stats + documents + assessment dimensions |
| Click related company | Company profile slice for this project |
| Click asset name in drill | `/pm/equipment-safety/[id]` |
| Industry percentile | Cohort size, direction, link to Hub VISI |
| Formula ⓘ | Always visible on drill; tooltip on cards |

### 8.5 Drill sheet

1. Metric label, value, period  
2. Formula strip + `source: veripm | vericore`  
3. Filters (site, fleet, asset class, contractor, status)  
4. Table with deep links  
5. “Open in Completed Documents” with VERIPM/VERICORE filters prefilled  

---

## 9. Industry benchmark integration

### 9.1 Reuse VISI

- Company-plane cohorts; n≥5 gating; no project-plane leakage  
- Facade: `/api/v1/pm/dashboard/industry-compare` → VISI + `VeriPmIndustryComparison` cache  

### 9.2 New / extended cohort metrics

| VERIPM metric | Direction | VISI extension |
|---------------|-----------|----------------|
| PM completion rate | higher_better | New leading indicator `pm_completion_rate` (or map from schedule compliance contribution) |
| Asset downtime % | lower_better | New / map from equipment downtime contribution |
| Maintenance-related incident rate | lower_better | Subset of incident rate tagged `maintenance_linked` in anonymized export |

Until VISI stores PM-specific fields, compute company values locally and compare against **opt-in maintenance KPI contributions** in a new anonymized series (`visi_maintenance_metrics` — future). Fallback: suppress industry tile with “Insufficient maintenance cohort” rather than inventing fake peers.

### 9.3 Contribution path

Opt-in companies contribute anonymized `{ pm_completion_rate, downtime_pct, maintenance_incident_rate, industry, scale, period }` via existing anonymization engine (`@vera/hub-industry-safety`). Prefer `maintenance_provider` / industrial company types for cohort matching when relevant.

---

## 10. Relationship to other surfaces

| Surface | Role vs VERIPM Dashboard |
|---------|---------------------------|
| `/pm/equipment-safety` | Asset-level ops; dashboard deep-links here |
| `/admin/maintenance-calibration` | Schedule/record CRUD; feeds WO index |
| `/pm/safety-hub` | Cross-module ops hub; equipment domain card links to VERIPM dashboard |
| `/core/dashboard` (VERICore) | SMS narrative; supplies shared safety/training/contractor assessment |
| `/documents/completed?domain=VERIPM` | Document evidence for drills |
| `/hub/industry-safety` | Full VISI exploration |

VERIPM Dashboard = **maintenance narrative + contractor/asset rollup**. It does not replace equipment profile pages or M&C admin.

---

## 11. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **A** | `VeriPmWorkOrder` reindex from schedules/tasks + company snapshot (PM completion, overdue, downtime, failure) + revision API |
| **B** | Drill APIs (overdue WOs, failures) + formula strip UI |
| **C** | `VeriPmSafetyLink` + maintenance-linked safety metrics (VERICore facade) + incident/FLHA drills |
| **D** | Project dashboard + related companies + contractor cards (shared assessments) |
| **E** | Event invalidation + Document Service bridge |
| **F** | Industry compare + percentile cache + VISI contribution fields |

---

## 12. Acceptance criteria

- [ ] Company dashboard shows PM completion, overdue count, downtime, failure rate  
- [ ] Overdue click → work order drill with asset/due/status  
- [ ] Maintenance-linked incidents + FLHA/JHAs on PM work with drills  
- [ ] Industry vs for PM completion, downtime, maintenance incident rate (or suppressed)  
- [ ] Project view: PM + safety, related companies, contractor scores/stats  
- [ ] Company view: contractors on company’s projects with program score, incident rate, training  
- [ ] Contractor/company click → profile with stats + documents  
- [ ] Every card drills down and exposes formula/inputs  
- [ ] Revision updates within ~30s of PM or linked safety document changes  
