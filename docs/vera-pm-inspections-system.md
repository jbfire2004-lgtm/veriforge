# Vera PM Inspections & Checklists System

Production module for template-driven inspections, deficiency workflow, CAIL integration, SIF/HECA ingest, equipment lockout, site access gates, and offline field sync.

**API base:** `/api/v1/pm/inspections`  
**UI base:** `/pm/inspections`

---

## 1. Database schema

| Table | Purpose |
|-------|---------|
| `pm_inspection_template` | Company/project templates, versioning, publish workflow |
| `pm_inspection` | Field inspection instances |
| `pm_inspection_deficiency` | Auto/manual deficiencies |
| `pm_inspection_attachment` | Photos, PDFs, annotations |
| `pm_inspection_signature` | Inspector/supervisor signatures |
| `pm_inspection_corrective_action` | Linked CAPA rows |
| `pm_inspection_audit` | Full audit trail |

**Enums:** `PmInspectionTemplateCategory`, `PmInspectionTemplateStatus`, `PmInspectionStatus`, `PmDeficiencySeverity`, `PmDeficiencyStatus`, `PmInspectionScoringMode`

**Migration:** `20260519180000_pm_inspections_checklists`

---

## 2. Backend architecture

```
backend/src/pm-inspections/
├── pm-inspections.module.ts
├── pm-inspections.controller.ts
├── pm-inspections.service.ts          # Execution, submit, review, sync
├── pm-inspection-templates.service.ts # Builder + publish + version
├── inspection-template.engine.ts      # Conditional showIf + required validation
├── inspection-scoring.engine.ts       # pass_fail | numeric | weighted
├── deficiency-scoring.engine.ts       # Severity + due dates
├── pm-inspections-cail.service.ts     # CAIL emit (sourceType: inspection)
├── pm-inspections-equipment.service.ts# Lockout on critical / failed
├── pm-inspections-ingestion.service.ts# SIF/HECA for high/critical deficiencies
├── pm-inspections-cail-intelligence.service.ts # Deterministic quality scoring
└── pm-inspections.constants.ts        # Seeded templates (PME, crane, housekeeping, etc.)
```

---

## 3. Workflow logic

### Template publish
`draft` → (supervisor publish) → `published`  
Immutable when published; `POST /templates/:id/version` creates draft child with `parentTemplateId`.

### Inspection execution
| State | Trigger | Next |
|-------|---------|------|
| `draft` | `POST /` create from template | `in_progress` on first save |
| `in_progress` | `PUT /:id/answers` | stays until submit |
| `submitted` | submit, no review required | terminal (or `approved` via auto path) |
| `review_required` | submit with failed/high-energy/high risk | supervisor review |
| `approved` / `rejected` | `POST /:id/review` | audit logged |

### Submit pipeline
1. Validate required signatures (`requiredSignatures` on template)
2. `InspectionScoringEngine.score()` → `scorePercent`, `passed`, `riskScore`
3. For each failed item → `PmInspectionDeficiency` + CAIL entry + corrective action
4. Critical/high-energy → `PmInspectionsIngestionService.ingestDeficiencyToSif`
5. Equipment-linked → `PmInspectionsEquipmentService.applyLockoutIfNeeded`

### Deficiency closure
`open` → `assigned` → `verification_pending` → `closed` via `POST /deficiencies/:id/verify`

---

## 4. API contract (summary)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/templates` | PM | List templates (`companyId`, `projectId?`, `status?`) |
| POST | `/templates/seed` | Supervisor+ | Seed default checklists |
| POST | `/templates` | Supervisor+ | Create template |
| POST | `/templates/:id/publish` | Supervisor+ | Publish |
| GET | `/` | PM | List inspections |
| POST | `/` | PM | Create from template |
| PUT | `/:id/answers` | PM | Save checklist answers |
| POST | `/:id/submit` | PM | Score + deficiencies + CAIL |
| POST | `/:id/review` | Supervisor+ | Approve / reject / request changes |
| POST | `/sync` | PM | Offline idempotent sync |
| GET | `/analytics/project/:id` | PM | KPIs |
| GET | `/intelligence/project/:id` | PM | CAIL quality + hazard patterns |
| GET | `/access/worker` | PM | Site access gate input |

---

## 5. Integrations

| Module | Integration |
|--------|-------------|
| **CAIL** | Every deficiency emits `CailEntry` (`sourceType: inspection`) |
| **SIF/HECA** | High/critical deficiencies → `SifHecaEvent` via ingestion service |
| **Site access** | `SiteAccessService.evaluateAccess` checks `pmInspections.workerAccessCheck` |
| **Equipment** | Critical deficiencies / failed inspection → equipment lockout |
| **VSI inspections** | Legacy `SafetyInspection` remains at `/pm/safety-intelligence/inspections` |
| **Inspection core** | Equipment pre-use at `/api/v1/inspections` (vera-core) unchanged |

---

## 6. Frontend

| Route | Screen |
|-------|--------|
| `/pm/inspections` | Dashboard — KPIs, list, links |
| `/pm/inspections/new` | Pick published template → create |
| `/pm/inspections/[id]` | Checklist editor, submit, supervisor review |
| `/pm/inspections/templates` | Template library view |

**Offline:** field handler `pmInspections.sync` → `POST /sync` with `clientSyncId`.

---

## 7. Scoring models

### Inspection score
- **weighted:** sum(pass weights) / sum(weights) × 100
- **pass_fail:** 100 if zero failed items else 0
- **Supervisor review** if: not passed, `riskScore ≥ 50`, or failed item has `energyType`

### Deficiency severity
- `critical` if checklist item has `energyType`
- `high` if required item weight ≥ 20 or category CRANE/PME
- else `medium` (escalation days from constants)

---

## 8. CAIL intelligence (deterministic)

`PmInspectionsCailIntelligenceService.projectInsights`:
- `inspectionQualityScore` = 100 − avgRisk − failed×5
- `hazardPatterns` — top deficiency categories with monitor/elevated prediction
- `inspectorPerformance` — pass rate and review escalation rate per inspector

---

## 9. Default seeded templates

- PME — Pre-use inspection  
- Crane / lifting — Daily  
- Site housekeeping  
- Fall protection — Work at height  
- Environmental — Spill prevention  

Seed via dashboard load or `POST /templates/seed?companyId=&projectId=`.
