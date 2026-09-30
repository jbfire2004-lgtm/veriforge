# Incidents, Near Miss & Observations — Developer-Ready Pack

Unified PM safety event management: intake wizard, injury tracking, RCA (5-Why / Fishbone), SIF/HECA auto-detection, CAPA/CAIL, equipment lockout, witness statements, offline sync, and deterministic CAIL inference.

**API base:** `/api/v1/pm/incidents`  
**UI:** `/pm/incidents`  
**Offline sync:** `pmIncidents.sync`  
**Backend module:** `backend/src/pm-safety-events/` (`PmSafetyEventsModule`)  
**Legacy:** Company `Incident` table + `/incidents` API; VSI investigations at `/pm/safety-intelligence/incidents`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| incident-service | `PmSafetyEventsService` |
| incident-timeline-service | `addTimelineEntry` / `listTimeline` (audit-backed) |
| root-cause-analysis-service | `RcaEngine` + `addRootCause` / `suggestRootCauses` |
| sif-heca-integration-service | `PmSafetyEventsIngestionService` → `SifHecaService.ingest` |
| corrective-action-service | `generateCorrectiveForRootCause` + `PmCapaAutoGenerateService.fromSafetyEvent` |
| attachment-service | `addAttachment` |
| witness-statement-service | `addWitness` + `addStatement` |
| offline-sync-service | `syncOffline` |
| cail-inference-service | `PmSafetyEventsCailService` + `PmSafetyEventsIntelligenceService` |
| audit-service | `audit()` → `pm_safety_event_audit` |

### Core components (engines)

| Spec component | File | Responsibility |
|----------------|------|----------------|
| Incident Creation Engine | `PmSafetyEventsService.createDraft` | Draft + auto classify + risk score |
| Incident Classification Engine | `event-classification.engine.ts` | Keyword type + HECA energy hint |
| SIF/HECA Auto-Detection Engine | `pm-safety-events-ingestion.service.ts` | High/critical, injury, near_miss → SIF event |
| Root Cause Analysis Engine | `rca.engine.ts` | 5-Why chain, fishbone categories, suggestions |
| Injury/Illness Tracking Engine | `addInjury` | WCB, medical aid, lost time |
| Equipment Involvement Engine | `linkEquipment` + `PmSafetyEventsEquipmentService` | Lockout on failure/critical |
| Worker Involvement Engine | `addPerson` + `workerAccessCheck` | Roles + site access gate |
| Timeline Builder Engine | Timeline audit entries | Chronological narrative |
| Corrective Action Generator | RCA + submit high-severity auto CAPA | CAIL-linked rows |
| Incident Review & Approval Engine | `submit` + `review` + `close` | Workflow gates |
| Offline Incident Engine | `syncOffline` | Idempotent `clientSyncId` |

### Module wiring

- `SifHecaModule` — scoring + ingestion
- `SafetyIntelligenceModule` — legacy CAIL emitter
- `PmCorrectiveActionsModule` — unified CAPA (`sourceModule: incident`)
- Registered in `app.module.ts` as `PmSafetyEventsModule`

---

## 2. Database schema

Primary table **`pm_safety_event`** maps to spec `incidents`.

### `pm_safety_event` (spec: `incidents`)

| Field | Type | Spec alias |
|-------|------|------------|
| id | UUID PK | id |
| companyId | Int | company_id |
| projectId | Int | project_id |
| createdByUserId | Int | reported_by |
| eventType | `PmSafetyEventType` | incident_type (see mapping below) |
| severity | `PmSafetyEventSeverity` | severity |
| riskScore | Int | internal risk 0–100 |
| sifEventId | String? FK | linked SIF event |
| hecaCategoryCode | String? | heca_category |
| status | `PmSafetyEventStatus` | workflow status |
| occurredAt | DateTime | occurred_at |
| locationNote | String? | location |
| description | Text | description |
| latitude, longitude | Float? | GPS |
| clientSyncId | String? unique | offline |
| deletedAt | DateTime? | soft delete |
| createdAt, updatedAt | DateTime | timestamps |

**SIF score:** Not stored on incident row; read via `GET /:id/score` from linked `sif_heca_event` or dry-run evaluate.

### Event type mapping (spec → `PmSafetyEventType`)

| Spec `incident_type` | Vera enum |
|----------------------|-----------|
| injury | `incident_injury` |
| near_miss | `near_miss` |
| property_damage | `incident_property` |
| environmental | `incident_environmental` |
| security | `security_event` |
| equipment_failure | `equipment_failure` / `incident_equipment` |
| (observations) | `hazard_observation`, `positive_observation`, `behavioral_observation` |

### `pm_safety_event_person` (spec: `incident_people`)

| Field | Notes |
|-------|-------|
| workerId | worker_id |
| role | injured, witness, reporter, involved, … |
| name, companyId, notes | Non-worker parties |

**Injury detail:** Use `pm_safety_event_injury` for `injury_type`, `medicalAid` (= medical_treatment_required), body part, WCB.

### `pm_safety_event_injury` (spec injury fields on people)

| Field | Spec |
|-------|------|
| injuryType | injury_type |
| medicalAid | medical_treatment_required |
| lostTime, firstAid, wcbClaimNumber | extended tracking |

### `pm_safety_event_equipment` (spec: `incident_equipment`)

| Field | Spec |
|-------|------|
| equipmentId | equipment_id |
| conditionScore | damage_level (0–100 style) |
| failureNotes | damage narrative |
| lockoutApplied | taken_out_of_service |

### `pm_safety_event_root_cause` (spec: `incident_rca`)

| Field | Spec |
|-------|------|
| method | five_why, fishbone, taproot |
| whyChain | JSON 5-Why chain |
| fishboneJson | fishbone data (jsonb) |
| description, libraryCode | RCA narrative |
| (no completed_by column) | use audit `rca_added` + createdAt |

### Timeline (spec: `incident_timeline`)

Stored as **audit rows** with `eventType: timeline` and payload `{ timestamp, description }` — avoids separate migration; query via `GET /:id/timeline`.

### `pm_safety_event_attachment` (spec: `incident_attachments`)

| Field | Notes |
|-------|-------|
| storageKey, fileName, mimeType | file_path / file_type |
| dataUrl | inline mobile capture |
| coreFileId | Vera core file bridge |

### `pm_safety_event_audit` (spec: `incident_audit`)

| Field | Spec |
|-------|------|
| eventType | event_type |
| payload | event_data (JSON) |
| actorId | actor_id |
| createdAt | timestamp |

### Related tables

| Table | Purpose |
|-------|---------|
| `pm_safety_event_witness` | Witness registry |
| `pm_safety_event_statement` | Signed statements |
| `pm_safety_event_corrective_action` | Event-scoped CAPA |
| `pm_safety_event_version` | Edit snapshots |
| `pm_safety_event_contributing_factor` | Fishbone / factor inputs |
| `pm_root_cause_library` | Company RCA library |

**Migration:** `20260519200000_pm_safety_events`

---

## 3. API contract

Base: `/api/v1/pm/incidents` — JWT + PM roles (WORKER+ create/read; SUPERVISOR+ review/close/library seed).

### Incidents (spec paths)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/` | query: projectId, companyId, status, eventType | List |
| POST | `/` | companyId, projectId, title, … | **Create** (spec `POST /incident`) |
| GET | `/:id` | | Full detail + audit |
| PUT | `/:id` | partial fields | Update draft only |
| POST | `/:id/submit` | | Submit → SIF + CAPA + lockout |
| POST | `/:id/review` | action, notes | approve \| reject \| request_changes |
| POST | `/:id/approve` | notes? | **Alias** for review approve |
| POST | `/:id/close` | | Closeout (CAPA assigned + RCA for medium+) |
| GET | `/:id/score` | | **SIF/HECA score** (persisted or dry-run) |
| GET | `/:id/predict` | | CAIL inference bundle |
| GET | `/:id/timeline` | | Timeline entries |
| POST | `/:id/timeline` | description, timestamp? | Add timeline event |
| POST | `/:id/people` | role, workerId, … | People involved |
| POST | `/:id/equipment` | equipmentId, failureNotes | Equipment link |
| POST | `/:id/injuries` | injury fields | Injury record |
| POST | `/:id/rca` | method, description, whyChain, fishboneJson | RCA + auto CAPA |
| GET | `/:id/rca/suggest` | | Suggested root causes |
| POST | `/:id/witnesses` | name, contact, workerId | Witness |
| POST | `/:id/statements` | statementText, signatureData | Statement |
| POST | `/:id/attachments` | file metadata | Attachment |
| POST | `/:id/contributing-factors` | label, category | Contributing factor |
| POST | `/sync` | offline payload | Idempotent sync |
| POST | `/offline/sync` | | **Alias** for sync |

### Libraries & analytics

| Method | Path |
|--------|------|
| GET | `/library/root-causes?companyId=` |
| GET | `/library/contributing-factors?companyId=` |
| POST | `/library/seed?companyId=` |
| GET | `/analytics/project/:projectId` |
| GET | `/access/worker?workerId=&projectId=` |

### Score response (`GET /:id/score`)

```json
{
  "source": "sif_heca",
  "sifEventId": "uuid",
  "sif_score": 72,
  "sif_category": "high",
  "heca_category": "gravity",
  "heca_category_label": "Gravity / Falling Objects",
  "risk_score": 65,
  "requires_supervisor_review": true
}
```

### Predict response (`GET /:id/predict`)

```json
{
  "sif_score": 72,
  "heca_category": "gravity",
  "root_cause_suggestions": [{ "code": "TRAIN", "label": "Inadequate training", "score": 3 }],
  "recommended_corrective_actions": [{ "title": "Address: …", "priority": "high" }],
  "predictive_recurrence_likelihood": 78,
  "worker_risk_impacts": [{ "workerId": 1, "riskScore": 35 }],
  "equipment_risk_impact": { "equipmentInvolved": 1, "lockoutsApplied": 1 },
  "requires_safety_review": true,
  "explainability": [{ "rule": "recurrence", "detail": "…" }]
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/incidents` | List + analytics | `dashboard.tsx` |
| `/pm/incidents/new` | 4-step intake wizard | `wizard.tsx` |
| `/pm/incidents/[id]` | Detail, RCA, review | `detail.tsx` |

**Lib:** `vera-frontend/lib/pm-incidents.ts`

| Function | API |
|----------|-----|
| `createPmIncidentDraft` | POST `/` |
| `addPmIncidentInjury` | POST `/:id/injuries` |
| `addPmIncidentRca` | POST `/:id/rca` |
| `submitPmIncident` | POST `/:id/submit` |
| `reviewPmIncident` / `approvePmIncident` | review / approve |
| `closePmIncident` | POST `/:id/close` |
| `fetchPmIncidentScore` | GET `/:id/score` |
| `predictPmIncident` | GET `/:id/predict` |
| `addPmIncidentTimeline` | POST `/:id/timeline` |
| `syncPmIncidentsOffline` | POST `/sync` |

### Spec screen mapping

| Spec screen | Vera |
|-------------|------|
| Incident List | `/pm/incidents` dashboard |
| Incident Report Form | `/pm/incidents/new` wizard |
| People Involved | Wizard step + `POST /:id/people` |
| Equipment Involved | `POST /:id/equipment` |
| Timeline Builder | `POST /:id/timeline` (UI can be extended on detail) |
| RCA Builder | Detail RCA section + fishbone JSON on RCA POST |
| Supervisor Review | Detail approve/review when `review_required` |
| Incident Closeout | `closePmIncident` |
| Offline Incident Queue | `pmIncidents.sync` |
| Incident Analytics Dashboard | Dashboard + `/analytics/project/:id` |

### Spec components (implementation status)

| Component | Status |
|-----------|--------|
| InjurySelector | Wizard + `addPmIncidentInjury` |
| EquipmentDamageCard | Equipment link API; UI partial |
| TimelineEventCard | API ready; dedicated UI optional |
| RCA5WhyEditor | Detail text + suggestions |
| FishboneDiagram | `fishboneJson` on RCA POST |
| SIFScoreBadge | Use `fetchPmIncidentScore` |
| HECAIndicator | `hecaCategoryCode` on event row |
| AttachmentUploader | `POST /:id/attachments` |

---

## 5. Workflow logic

### States (`PmSafetyEventStatus`)

| Spec | Vera |
|------|------|
| Draft | `draft` |
| Submitted | `submitted` |
| Under Review | `review_required` |
| Approved | `locked` (approve sets locked + closedAt) |
| Closed | `closed` (explicit closeout) |

Also: `rejected`, `approved` (enum reserved; primary path uses `locked`).

### Transitions

```
draft ──submit──► submitted | review_required
review_required | submitted ──approve──► locked (+ closedAt)
                              ──reject──► rejected
                              ──request_changes──► draft
locked | submitted ──close──► closed  (CAPA assigned, RCA if medium+)
```

### Validation rules

| Rule | Enforcement |
|------|-------------|
| Required fields on submit | Title, description recommended; wizard step ≥ 1 |
| RCA for medium/high/critical | `rootCauses.length > 0` on submit |
| SIF/HECA threshold → safety review | `requiresSupervisorReview` or sif_score ≥ 70 → `review_required` |
| CAPA assigned before close | Open CAPAs must have `assignedUserId` |
| RCA before close (medium+) | Same as submit |

---

## 6. CAIL intelligence logic

### Inputs (available at predict time)

- Event type, severity, description
- Injuries (medical, lost time)
- People + equipment links
- Contributing factors
- Historical root causes (company library)
- Project context via `projectId`

### Outputs (`GET /:id/predict`)

| Output | Source |
|--------|--------|
| SIF score | Linked SIF event or `evaluateDryRun` |
| HECA category | Classification engine + SIF HECA |
| Root cause suggestions | `RcaEngine.suggestRootCauses` |
| Recommended corrective actions | Top 3 suggestions → CAPA titles |
| Predictive recurrence likelihood | risk + RCA depth + severity |
| Worker risk impact | `workerRiskProfile` per involved worker |
| Equipment risk impact | Count + lockouts |

### Risk scoring (on create/update)

```
riskScore = min(100, severityScore×12 + likelihood×8)
requiresSupervisorReview = high/critical | medical | lost time | equipment_failure
```

---

## 7. Offline mode

### Local storage

- Draft event with `clientSyncId`
- Injuries array, equipment IDs
- Optional `submitted: true` on sync

### Sync payload

```json
{
  "clientSyncId": "uuid",
  "companyId": 1,
  "projectId": 1,
  "title": "Near miss — falling material",
  "description": "…",
  "eventType": "near_miss",
  "injuries": [],
  "equipmentIds": [12],
  "submitted": true
}
```

**Handler:** `pmIncidents.sync` in `vera-frontend/lib/field/sync-handlers.ts`

### Conflict resolution

- Duplicate `clientSyncId` → return existing; re-submit if still `draft`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Corrective Actions | `PmCapaAutoGenerateService.fromSafetyEvent`; CAIL on RCA + submit |
| Worker Safety Profiles | `workerAccessCheck`; `workerRiskProfile` |
| Equipment Safety | `PmSafetyEventsEquipmentService` lockout |
| JHA/FLHA | Shared project hazard context |
| Inspections | Deficiencies can ingest to SIF; incidents ingest on submit |
| SDS | Environmental events via `environmentalImpactJson` |
| Emergency Response | High-severity events align with emergency CAIL rules |
| PM Module | Project/site scoping |
| Safety Stations | Field offline queue |
| SIF/HECA | `ingestToSifHeca` on submit; score via `/:id/score` |
| Unified CAIL | `PmSafetyEventsCailService.emitFromEvent` |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| totalEvents | All events |
| byType / bySeverity | Distributions |
| rootCauseDistribution | RCA categories |
| injuryCount | Injury-type events |
| nearMissTrend | Near-miss count |
| projectIncidentScore | Leading composite 0–100 |
| complianceLeadingIndicator | Same as project score |
| trends.events90d | Events in 90 days |
| trends.injuryRate90d | % injury among recent events |
| workerInvolvementByRole | groupBy role |
| equipmentInvolvementCount | Equipment links |
| sifHecaLinkedCount | Events with SIF ingestion |
| hecaCategoryTrend | HECA code distribution |

### Leading indicators

- Near-miss reporting rate
- `projectIncidentScore` / compliance score
- Open CAPA closure velocity

### Lagging indicators

- Injury count
- Critical/high severity distribution
- SIF-linked event count
- Root cause pattern repeats (`rootCauseDistribution`)

---

## File index

```
backend/src/pm-safety-events/
  pm-safety-events.service.ts
  pm-safety-events.controller.ts
  pm-safety-events-intelligence.service.ts
  pm-safety-events-ingestion.service.ts
  pm-safety-events-equipment.service.ts
  pm-safety-events-cail.service.ts
  event-classification.engine.ts
  severity-risk.engine.ts
  rca.engine.ts

vera-frontend/
  lib/pm-incidents.ts
  src/pages/pm/incidents/*
  app/pm/incidents/**

docs/
  vera-pm-incidents-system.md          (shorter overview)
  vera-pm-incidents-developer-pack.md  (this document)
```

## Deploy

Uses migration `20260519200000_pm_safety_events`. No new migration for timeline (audit-backed) or API aliases.

```bash
cd backend
npx prisma generate
```
