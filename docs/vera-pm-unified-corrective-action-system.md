# Vera PM Unified Corrective Action Engine

Production architecture for the single corrective-action model used across JHA/FLHA, SIF/HECA, inspections, incidents, equipment, SDS, training, site access, safety stations, emergency response, and PM scheduling.

**Primary API:** `/api/v1/pm/unified-corrective-action`  
**Spec alias API:** `/api/v1/pm/corrective-action`  
**Legacy API/UI:** `/api/v1/pm/corrective-actions`, `/pm/corrective-actions` (core CRUD; unified layer orchestrates)  
**UI hub:** `/pm/unified-corrective-action`  
**Developer pack:** `docs/vera-pm-unified-corrective-action-developer-pack.md`

---

## 1. Backend architecture

### Layering

```
pm-unified-corrective-action/          # Orchestration + cross-module gates
├── pm-unified-corrective-action.service.ts
├── pm-unified-corrective-action.controller.ts
├── pm-corrective-action.controller.ts   # spec alias /pm/corrective-action
├── pm-unified-corrective-action-cail.service.ts
├── pm-unified-corrective-action.module.ts
├── capa-generation.engine.ts          # Severity/priority/verification role classification
├── capa-enforcement.engine.ts         # Worker/equipment/zone/task/permit/JHA/PM blocks
├── capa-publish.engine.ts               # Draft → published version snapshot
└── cross-module-integration.engine.ts # JHA approval, PM task start, permits, safety stations

pm-corrective-actions/                 # Core persistence + workflows
├── pm-corrective-actions.service.ts   # CRUD, assign, escalate, verify, attachments, audit
├── pm-capa-auto-generate.service.ts     # Module-specific generators
├── capa-assignment.engine.ts
├── capa-escalation.engine.ts
└── capa-verification.engine.ts
```

### Multi-tenant isolation

- Every row scoped by `companyId`; project-scoped rows include `projectId`.
- RBAC via `JwtAuthGuard` + `RolesGuard`: workers read/act on assigned items; supervisors+ create, assign, verify, publish, override.
- All mutations write `corrective_action_audit` with `eventType` prefixed `unified_` when routed through orchestration.

### Wired integrations (runtime)

| Consumer | Hook | Behavior |
|----------|------|----------|
| `JhaFlhaService.supervisorReview(approve)` | `jhaApprovalGate` | Blocks approval if open JHA-linked or SIF-linked CAPA exist |
| `PmProjectManagementService.evaluateTaskStartGate` | `pmTaskStartGate` per project + each assigned worker | Adds CAPA blockers to task-start safety gate |
| `PmSiteAccessControlService` | `PmCorrectiveActionsService.workerAccessCheck` | Worker access denial when overdue/critical CAPA |
| `PmCapaAutoGenerateService` | JHA submit, inspections, incidents, SIF, equipment, emergency, training, SDS, access | Auto-create published CAPA |

---

## 2. Database schema

Migration: `backend/prisma/migrations/20260521280000_pm_unified_corrective_action` (requires `20260521270000` unified hazard/control).

### `corrective_actions` (Prisma `PmCorrectiveAction`)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| companyId | Int FK | Tenant |
| projectId | Int? FK | Project scope |
| siteId | Int? | |
| title | String | |
| description | Text? | |
| actionType | Enum/string | immediate, permanent, training_requirement, equipment_repair, … |
| status | `PmCorrectiveActionStatus` | draft → closed workflow |
| severityLevel | String? | Unified label |
| priorityLevel | String? | Unified label |
| severityScore | Int | 0–100 for enforcement |
| priorityScore | Int | Scheduling sort |
| escalationLevel | Int | 0–5 |
| sourceModule | String | jha_flha, inspection, sif_heca, equipment, … |
| sourceId | String | Originating entity id |
| sourceItemId | String? | Sub-item (training code, chemical name) |
| hazardId | UUID? FK → hazards | Unified H&C |
| controlId | UUID? FK → controls | Unified H&C |
| rootCauseId | String? | Incident RCA link |
| workerId | Int? | Primary worker link |
| equipmentId | Int? | Equipment link |
| dueAt | DateTime? | Escalation trigger |
| publishVersion | Int | Increments on publish |
| publishedAt | DateTime? | |
| evidenceRequirementsJson | Json | Required evidence types |
| verificationRequirementsJson | Json | Required verifier roles |
| clientSyncId | String? unique | Offline idempotency |
| deletedAt | DateTime? | Soft delete |
| createdByUserId | Int | |

**Indexes:** `(companyId, projectId, status)`, `(dueAt)`, `(workerId)`, `(equipmentId)`, `(sourceModule, sourceId)`, `(clientSyncId)`.

### `corrective_action_versions`

| Field | Type |
|-------|------|
| id | UUID PK |
| actionId | FK corrective_actions |
| version | Int |
| snapshotJson | Json full row snapshot |
| publishedByUserId | Int? |
| createdAt | DateTime |

### `corrective_action_assignments` (assignees)

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| userId | Int? |
| workerId | Int? |
| role | primary \| secondary \| delegate |
| assignedAt | DateTime |
| assignedByUserId | Int? |

### `corrective_action_escalations`

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| level | 1–5 |
| reason | String |
| triggeredAt | DateTime |
| notifiedUserIds | Json |

### `corrective_action_verifications`

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| role | supervisor, safety_officer, project_manager, equipment_owner |
| outcome | approve \| reject |
| notes | Text? |
| verifiedByUserId | Int |
| verifiedAt | DateTime |

### `corrective_action_attachments`

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| phase | creation \| completion \| verification |
| fileName, mimeType, storageKey / dataUrl | Evidence |
| uploadedByUserId | Int |
| createdAt | DateTime |

### `corrective_action_links`

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| linkType | `PmCorrectiveActionLinkType`: hazard, control, jha_flha, inspection, incident, equipment, sds, training, site_access, emergency, pm_task, sif_heca, worker |
| linkedId | String |

### `corrective_action_audit`

| Field | Type |
|-------|------|
| id | UUID |
| actionId | FK |
| eventType | String |
| actorId | Int? |
| payload | Json |
| createdAt | DateTime |

### `pm_capa_overrides`

| Field | Type |
|-------|------|
| id | UUID |
| companyId, projectId?, actionId? | Scope |
| ruleType, ruleKey | e.g. worker/OVERDUE |
| reason | Text |
| expiresAt | DateTime |
| active | Boolean |
| createdByUserId | Int |

### `pm_capa_offline_cache`

Project-scoped JSON bundle for field sync.

**Partitioning strategy:** partition `corrective_action_audit` by `createdAt` monthly at scale; tenant isolation remains `companyId` on parent tables.

---

## 3. API contract

All routes: `JwtAuthGuard` + `RolesGuard`. Supervisor+ where noted.

### Dashboard & analytics

**GET `/dashboard?companyId=&projectId=`**  
Response: `{ companyId, projectId, metrics: { total, open, overdue, critical, escalated, companyCapaScore }, cail: { insights } }`  
Errors: `401`, `403`

**GET `/analytics?companyId=&projectId=`** — closure rates, counts (delegates core service).

**GET `/analytics/trends?companyId=&projectId=`**  
Response: analytics + `{ trends: { created30d, closed30d, escalations30d }, overdueRiskScore, leadingIndicators }`

### List & detail

**GET `/list?companyId=&projectId=&overdueOnly=`** — array of CAPA rows with assignees, escalations.

**GET `/:id`** — full detail + module links + CAIL entry if present.

### Create & lifecycle

**POST `/create`** (Supervisor+)  
Body: `{ companyId, projectId?, title, description?, actionType?, severity?, sourceModule, sourceId, hazardId?, controlId?, workerId?, equipmentId?, publish?: boolean, links?: [{ linkType, linkedId }] }`  
Response: created action + optional version row.  
Validation: required `companyId`, `title`, `sourceModule`, `sourceId`.  
Errors: `400` invalid source, `404` project/hazard not found.

**PUT `/:id`** (Supervisor+) — update metadata; blocked if status in verified/closed/cancelled.

**POST `/:id/publish`** — draft → version snapshot → open/assigned.

**PUT `/:id/assign`** — `{ userId?, workerId?, role?: primary|secondary }`.

**POST `/:id/auto-assign`** — applies `CapaAssignmentEngine` rules from severity/source/SIF.

**POST `/:id/in-progress`** — assignee marks work started.

**POST `/:id/submit`** — moves to `verification_pending`.

**POST `/:id/verify`** (Supervisor+)  
Body: `{ outcome: approve|reject, role, notes? }`  
On approve: closes linked inspection deficiencies, unlocks equipment lockout (core service).  
Reject: returns to `in_progress`.

**POST `/:id/signature`** — `{ role, signatureData? }`.

**POST `/:id/links`** — `{ linkType, linkedId }`.

### Generation

**POST `/generate/batch`** — `{ projectId }` → scans JHA, inspections, SIF, H&C gaps, PM blocked tasks, equipment failures, emergencies, training, access denials.

**POST `/generate/source`** — `{ source, sourceId, rootCauseId?, deficiencyId? }` where source ∈ jha_flha, inspection, incident, sif_heca, equipment, emergency, training, sds, site_access.

### Escalation & enforcement

**POST `/escalation/sweep`** — `{ projectId }` runs levels 1–5 for overdue/SIF/equipment rules.

**POST `/enforcement/evaluate`**  
Body: `{ companyId, projectId?, workerId?, equipmentId? }`  
Response: `{ allowed, blockers[], waived[], blocks: { workerAccess, equipmentAccess, zoneAccess, taskStart, permitApproval, jhaApproval, pmScheduling } }`

**GET `/jha/:jhaId/approval-gate`** — `{ allowed, module: jha_flha, blockers[] }`

**GET `/projects/:projectId/task-gate?workerId=`** — PM task start CAPA gate.

### Worker / equipment views

**GET `/workers/:workerId/actions?projectId=`**  
**GET `/equipment/:equipmentId/actions?projectId=`**

### Overrides

**POST `/overrides`** — temporary waiver with `expiresAt`.  
**POST `/overrides/revoke-expired`** — cron-style revoke.

### Offline

**GET `/sync/bundle?companyId=&projectId=`** — actions + hazard/control subset + worker/equipment profiles.

**POST `/sync/apply`**  
Body: `{ companyId, projectId, actions: [{ clientSyncId, title, status?, ... }] }`  
Idempotent on `clientSyncId`; returns `{ applied[], bundle }`.

### Attachments & CAIL

**POST `/attachments`** — `{ actionId, fileName?, mimeType?, dataUrl?, phase? }`

**GET `/cail/insights?companyId=&projectId=`** — explainable insight cards.

**GET `/cail/bundle?companyId=&projectId=`** — insights, predictions, worker/equipment risk, chronic deficiencies, weak controls, scores.

### Spec alias (`/api/v1/pm/corrective-action`)

| Method | Path | Maps to |
|--------|------|---------|
| POST | `/` | `createUnified` |
| POST | `/assign` | `assign` |
| POST | `/escalate` | `runEscalationSweep` |
| POST | `/verify` | `verify` + deficiency close |
| POST | `/offline/sync` | `applyOfflineSync` |
| GET | `/{id}` | `getAction` |

---

## 4. Frontend architecture

| Route | Components |
|-------|------------|
| `/pm/unified-corrective-action` | `dashboard.tsx` — tabs: Actions, Escalation, Enforcement, CAIL; batch generate; escalation sweep; enforcement evaluate |
| `/pm/unified-corrective-action/[id]` | `detail.tsx` — publish, auto-assign, in-progress, submit, verify approve/reject |
| `/pm/corrective-actions/*` | Legacy forms (still supported) |

**Libs:** `vera-frontend/lib/pm-unified-corrective-action.ts` (primary), `vera-frontend/lib/pm-corrective-action.ts` (spec paths).

**Offline:** field sync `pmUnifiedCorrectiveAction.sync` — download by default; upload when `actions`, `verifications`, or `attachments` present.

**Nav:** `PmModuleNav` → Unified corrective actions.

---

## 5. Workflow logic

### State machine

```
draft ──publish──► open | assigned ──assign──► assigned
assigned | open ──in_progress──► in_progress
in_progress ──submit──► verification_pending
verification_pending ──approve──► verified ──close──► closed
verification_pending ──reject──► in_progress
any open state + past due ──escalation──► escalationLevel 1..5
cancelled (supervisor only, from draft/open)
```

### Permissions

| Transition | Roles |
|------------|-------|
| Create draft | Supervisor+ |
| Publish | Supervisor+ |
| Assign / auto-assign | Supervisor+ |
| In progress / submit | Assignee or Supervisor+ |
| Verify approve/reject | Supervisor, safety officer, PM per `verificationRequirementsJson` |
| Override enforcement | Supervisor+ with reason + expiry |

### Validations

- Cannot update closed/verified rows.
- Verify approve requires evidence attachments when `evidenceRequirementsJson` non-empty (core service).
- Equipment CAPA on verify → clears equipment lockout if no other open equipment CAPA.
- Training CAPA on verify → re-evaluates worker training gate.

### Escalation triggers

| Level | Name | Trigger |
|-------|------|---------|
| 1 | Reminder | 1 day before due |
| 2 | Supervisor | Overdue 1–3 days |
| 3 | Safety | Overdue 3+ or severity ≥ 75 |
| 4 | Project manager | Level 3 + SIF-linked |
| 5 | Company | Level 4 + still open 7 days |

### Overrides

- Stored in `pm_capa_overrides`; auto-revoked when `expiresAt < now`.
- Revoke does not auto-close CAPA — only removes block.

---

## 6. CAIL intelligence logic

**Service:** `PmUnifiedCorrectiveActionCailService`

### Inputs → outputs

| Function | Inputs | Output | Rule |
|----------|--------|--------|------|
| `overdueRiskScore` | openCount, overdueCount, avgDaysToDue, escalationLevelMax | 0–100 | Base 10 + 15×overdue + 3×open + 8×escalation + 10 if due < 3 days |
| `companyCapaScore` | open, overdue, closureRate, criticalOpen | 0–100 | 100 − 6×overdue − 10×critical − 0.4×(50−closureRate) |
| `insights` | companyId, projectId | Insight[] | Overdue, critical, repeat inspection (groupBy sourceId > 2), chronic hazard-linked CAPA in 60d |

### Explainable insight shape

```json
{
  "id": "capa-overdue-1",
  "category": "overdue",
  "severity": "high",
  "title": "...",
  "explanation": "...",
  "inputs": {},
  "recommendation": "...",
  "correlatedModules": ["jha-flha", "inspections"]
}
```

### Predictive generation (orchestration)

`CapaGenerationEngine.classify()` sets severity/priority/verification role from source module + SIF flag + equipment criticality before `createUnified`.

---

## 7. Offline mode logic

1. **Pull:** `GET /sync/bundle` stores actions, assignments, hazards, controls, worker/equipment profiles in IndexedDB via `pmUnifiedCorrectiveAction.sync`.
2. **Create offline:** client generates `clientSyncId` (UUID); status `draft` or `verification_pending`.
3. **Push:** `POST /sync/apply` upserts by `clientSyncId`; submits verification if status pending.
4. **Conflict resolution:** server wins on status regression; client wins on new attachments if `updatedAt` client > server (logged in audit).
5. **Background sync:** field worker queue retries with exponential backoff.

---

## 8. Cross-module integration map

| Module | Auto-generate trigger | Enforcement | Close hook |
|--------|----------------------|-------------|------------|
| Company/project safety context | Policy non-compliance | Project context gate | — |
| Worker safety profile | Training gaps | Worker access | Training re-check on verify |
| Unified H&C | Missing/weak controls | Hazard publish | Link hazard/control |
| JHA/FLHA | Submit weak controls | **Approval gate** | Link jha_flha |
| SIF/HECA | High-risk events | Supervisor review CAPA | Link sif_heca |
| Inspections | Deficiencies | — | Auto-close deficiency on verify |
| Incidents | Root causes | Safety verify required | Link incident |
| Equipment | Failures | Lock until resolved | Unlock on verify |
| SDS | Missing/improper storage | — | Link sds |
| Training | Expired required training | Worker access block | Link training |
| Site access | Denials | Access block | Link site_access |
| Safety stations | Real-time enforcement API | worker/equipment blocked | — |
| Emergency | Post-event | Suspend enforcement during active emergency | Link emergency |
| PM Module | Blocked tasks | **Task start gate** | Link pm_task |

---

## 9. Analytics & scoring models

### Project corrective action score

```
projectScore = 100 - (openOverdue × 8) - (criticalOpen × 12) - (escalated × 5)
```

### Company score

Uses `companyCapaScore()` (see CAIL).

### Leading indicators (trends endpoint)

- `overdueRate` = overdue / created (30d)
- `criticalOpen` = count severity ≥ 75
- `escalations30d` = escalation events
- `closureRate` from core analytics

### Dashboards

- Unified hub: totals, open, overdue, critical, escalated, company score.
- Escalation tab: sweep + level distribution (from list).
- Enforcement tab: live evaluate with blockers list.
- CAIL tab: insight cards with correlated modules.

---

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

On Windows, stop the dev server before `prisma generate` if EPERM locks the client.
