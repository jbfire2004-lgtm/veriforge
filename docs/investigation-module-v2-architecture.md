# Investigation Module v2 — Architecture

*Vera Platform · last updated May 2026*

---

## Overview

The Investigation Module v2 upgrades `PmSafetyEvent` investigations with a **TapRooT-style causal pathway engine**, guided question flows, auto-CAPA generation, contractor dispatch integration, evidence management, and one-click printable reports.

The module extends **existing** `PmSafetyEvent` records — no new incident table is created.

---

## 1. DB schema additions

### New table: `pm_safety_event_investigation`

One-to-one with `pm_safety_event`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `event_id` | TEXT | FK → `pm_safety_event.id` (UNIQUE) |
| `status` | `PmInvestigationStatus` | `not_started → evidence_gathering → analysis → root_cause → capa_planning → review → closed` |
| `current_step` | INT | Which guided question step the investigator is on |
| `narrative` | TEXT | Free-text investigation narrative |
| `immediate_actions` | TEXT | What was done immediately |
| `guided_answers_json` | JSONB | Map of question ID → answer text |
| `causal_tree_json` | JSONB | Serialized `CausalTreeNode` |
| `executive_summary` | TEXT | Auto-generated from root causes + narrative |
| `lead_investigator_id` | INT | FK → User |
| `started_at` | TIMESTAMP | |
| `closed_at` | TIMESTAMP | |

### Modified: `pm_safety_event_corrective_action`

Added:
- `unified_corrective_action_id TEXT` — link to `corrective_actions.id` (PmCorrectiveAction)
- `subcontractor_company_id INT` — direct subcontractor assignment

### New enum: `PmInvestigationStatus`

```
not_started, evidence_gathering, analysis, root_cause, capa_planning, review, closed
```

---

## 2. Root cause engine (`rca.engine.ts`)

### TapRooT causal pathways

Six canonical pathways matching TapRooT methodology:

| Key | Label |
|-----|-------|
| `human_factors` | Human factors |
| `equipment_failure` | Equipment failure |
| `procedures` | Procedures |
| `training_gaps` | Training gaps |
| `management_systems` | Management systems |
| `environmental_conditions` | Environmental conditions |

### Methods

- `taprootPathways()` — returns all pathways with label + description
- `guidedQuestions(eventType)` — dynamic question set (per `PmSafetyEventType`)
- `suggestRootCauses(input)` — scores library entries + pathway keyword matches against description + guided answers
- `suggestContributingFactors(input)` — returns pathway-mapped factors with confidence scores
- `buildTaprootPathway(input)` — generates `snapCharT`-style pathway object for persistence
- `buildCausalTree(input)` — assembles root causes + contributing factors into a hierarchical `CausalTreeNode` tree
- `buildFiveWhyChain(...)` — retained for legacy `five_why` records

---

## 3. Backend services

### `PmSafetyEventsInvestigationService`

Route prefix: `POST/GET/PUT /api/v1/pm/incidents/:id/investigation*`

| Method | Route | Role |
|--------|-------|------|
| `getOrCreate(eventId)` | `GET /:id/investigation` | Returns or creates investigation record |
| `openInvestigation` | `POST /:id/investigation/open` | Starts investigation, sets `evidence_gathering` |
| `guidedQuestions(eventId)` | `GET /:id/investigation/guided-questions` | Returns questions + pathway list + pre-suggested factors |
| `saveGuidedAnswers(eventId, answers)` | `POST /:id/investigation/guided-answers` | Saves answers, auto-creates contributing factors |
| `regenerateCausalTree(eventId)` | `POST /:id/investigation/regenerate-causal-tree` | Re-builds tree from current root causes/factors |
| `getCausalTree(eventId)` | `GET /:id/investigation/causal-tree` | Returns existing or freshly generated tree |
| `suggestFactorsAndRca(eventId)` | `GET /:id/investigation/suggest` | Combined pathway/RCA suggestions using guided context |

### `PmInvestigationCapaIntegrationService`

Links investigation root causes to the unified CAPA (`PmCorrectiveAction`) system.

- Calls `PmCapaAutoGenerateService.fromSafetyEvent(eventId, rootCauseId, actorId)`
- Optionally resolves subcontractor via `PmInspectionSubcontractorResolverService`
- Optionally dispatches to contractor via `PmInspectionContractorDispatchService.dispatchForCorrectiveAction`
- Links CAPA to event via `PmCorrectiveActionLink` with `linkType: 'inspection'`

### `PmInvestigationReportService`

- `buildReport(eventId)` → returns typed `InvestigationReport` including `html` property
- HTML output is self-contained and print-ready (no external CSS dependencies)
- `executiveSummary` is auto-generated from narrative + root causes + CAPA status and persisted to `pm_safety_event_investigation.executive_summary`

### Updated: `PmSafetyEventsService.addRootCause`

- Accepts `pathway?: TaprootPathway` and `responsibleParty?`
- If `pathway` is provided, sets `method = 'taproot'` and builds `taprootJson` via `RcaEngine.buildTaprootPathway`
- Delegates CAPA generation to `PmInvestigationCapaIntegrationService.createFromRootCause` when `actorId` is present
- Falls back to legacy `generateCorrectiveForRootCause` when called without authentication context

---

## 4. API endpoints

All routes require `JwtAuthGuard + RolesGuard`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/pm/incidents/:id/investigation/open` | Supervisor+ | Start investigation |
| `GET` | `/pm/incidents/:id/investigation` | Any PM role | Get investigation |
| `PUT` | `/pm/incidents/:id/investigation` | Any PM role | Update narrative, status, etc. |
| `GET` | `/pm/incidents/:id/investigation/guided-questions` | Any PM role | Get guided question set |
| `POST` | `/pm/incidents/:id/investigation/guided-answers` | Any PM role | Save answers, trigger factor suggestions |
| `GET` | `/pm/incidents/:id/investigation/causal-tree` | Any PM role | Get (or generate) causal tree |
| `POST` | `/pm/incidents/:id/investigation/regenerate-causal-tree` | Any PM role | Force tree rebuild |
| `GET` | `/pm/incidents/:id/investigation/suggest` | Any PM role | TapRooT suggestions |
| `GET` | `/pm/incidents/:id/investigation/report` | Any PM role | Full report JSON |
| `GET` | `/pm/incidents/:id/investigation/report/html` | Any PM role | Printable HTML |
| `POST` | `/pm/incidents/:id/rca` | Any PM role | Add root cause (now accepts `pathway`, `responsibleParty`) |
| `GET` | `/pm/incidents/:id/rca/suggest` | Any PM role | Suggest root causes (now uses guided answers) |

---

## 5. Corrective action + contractor integration

```
addRootCause(pathway: "equipment_failure", responsibleParty: "contractor")
    ↓
PmInvestigationCapaIntegrationService.createFromRootCause
    ├─ PmCapaAutoGenerateService.fromSafetyEvent → PmCorrectiveAction (unified)
    ├─ PmInspectionSubcontractorResolverService.resolveForFinding → subcontractorCompanyId
    ├─ PmCorrectiveAction.update(subcontractorCompanyId)
    ├─ PmInspectionContractorDispatchService.dispatchForCorrectiveAction
    └─ PmCorrectiveActionLink { linkType: 'inspection', linkedId: eventId }
```

Pathway-to-responsible-party defaults:

| Pathway | Default responsible party |
|---------|--------------------------|
| `equipment_failure` | contractor |
| `human_factors` | supervisor |
| `training_gaps` | company |
| `procedures` | supervisor |
| `management_systems` | company |
| `environmental_conditions` | supervisor |

---

## 6. Frontend components

All new components live in `vera-frontend/components/investigation/`.

| Component | Route/Usage |
|-----------|-------------|
| `GuidedInvestigationFlow` | "Guided flow" tab — step-by-step questions, auto-suggest contributing factors |
| `TaprootPathwaySelector` | "Root cause" tab — visual pathway card selection, RCA form, auto-CAPA |
| `CausalTreeDiagram` | "Causal tree" tab — hierarchical tree visualization |
| `EvidencePanel` | "Evidence" tab — photo upload, witnesses, statements |
| `InvestigationReportView` | "Report" tab — executive summary, root cause list, CAPA list, print/PDF |

### Updated: `src/pages/pm/incidents/detail.tsx`

Replaces the minimal RCA textarea with a full **6-tab investigation UI**:

1. **Overview** — description, injuries, root causes, CAPA summary
2. **Guided flow** — `GuidedInvestigationFlow` step wizard
3. **Root cause** — `TaprootPathwaySelector` (pathway cards)
4. **Causal tree** — `CausalTreeDiagram` (interactive tree + regenerate)
5. **Evidence** — `EvidencePanel` (photos, witnesses, statements)
6. **Report** — `InvestigationReportView` (print/PDF button)

---

## 7. Module wiring

`PmSafetyEventsModule` now imports:

- `PmCorrectiveActionsModule` (for `PmCapaAutoGenerateService`, `CapaDueDateEngine`)
- `PmInspectionsModule` (for subcontractor resolver + contractor dispatch)

New providers added:

- `PmSafetyEventsInvestigationService`
- `PmInvestigationCapaIntegrationService`
- `PmInvestigationReportService`

---

## 8. What's not changed

- `PmSafetyEvent`, `PmSafetyEventRootCause`, `PmSafetyEventContributingFactor`, `PmSafetyEventCorrectiveAction`, `PmSafetyEventAttachment`, `PmSafetyEventWitness`, `PmSafetyEventStatement` — schema unchanged except the two new columns on `_corrective_action`
- Existing `POST /rca` endpoint is backward compatible — omitting `pathway` falls back to `five_why`
- `RcaEngine.buildFiveWhyChain` and `fishboneCategories` retained
- Legacy `Investigation` model and `/investigations` API — untouched; migration to this layer is a future step
