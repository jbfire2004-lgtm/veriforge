# Unified Corrective Action Engine — Developer-Ready Pack

Single corrective-action model across JHA/FLHA, SIF/HECA, inspections, incidents, equipment, SDS, training, site access, safety stations, emergency response, and PM scheduling — with assignment, escalation, verification, enforcement, CAIL predictions, and offline field sync.

**Primary API:** `/api/v1/pm/unified-corrective-action`  
**Spec alias API:** `/api/v1/pm/corrective-action`  
**Legacy API:** `/api/v1/pm/corrective-actions` (core CRUD)  
**UI:** `/pm/unified-corrective-action`  
**Offline sync:** `pmUnifiedCorrectiveAction.sync` (download + upload)  
**Backend:** `backend/src/pm-unified-corrective-action/` + `backend/src/pm-corrective-actions/`  
**Migration:** `20260521280000_pm_unified_corrective_action`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| corrective-action-service | `PmUnifiedCorrectiveActionService.createUnified`, `getAction`, `updateUnified`, `publishAction` |
| assignment-service | `assign`, `autoAssign` → `CapaAssignmentEngine` + `PmCorrectiveActionsService.assign` |
| escalation-service | `runEscalationSweep` → `CapaEscalationEngine` |
| verification-service | `verify`, `submitForVerification` → `CapaVerificationEngine` |
| deficiency-ingestion-service | `PmCapaAutoGenerateService` + `generateFromSource` / `generateFromAllModules` |
| enforcement-service | `unifiedEnforcement` → `CapaEnforcementEngine` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmUnifiedCorrectiveActionCailService` |
| audit-service | `corrective_action_audit` (+ `unified_*` events) |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Corrective Action Model Engine | `pm-corrective-actions.service.ts` | Persistence, status transitions, CAIL entry sync |
| Corrective Action Generation Engine | `capa-generation.engine.ts` | Severity, priority, verification role from source |
| Assignment Engine | `capa-assignment.engine.ts` | Primary/secondary assignee suggestions |
| Escalation Engine | `capa-escalation.engine.ts` | Levels 1–5 for overdue/SIF/equipment |
| Verification Engine | `capa-verification.engine.ts` | Role gates, evidence, approve/reject |
| Enforcement Engine | `capa-enforcement.engine.ts` | Worker/equipment/zone/task/permit/JHA/PM blocks |
| Offline Corrective Action Engine | `applyOfflineSync` | Idempotent actions, verifications, attachments |
| Publish Engine | `capa-publish.engine.ts` | Draft → published version snapshot |
| Cross-Module Integration | `cross-module-integration.engine.ts` | JHA approval gate, PM task start gate |

### Module wiring

- Controllers: `PmUnifiedCorrectiveActionController`, `PmCorrectiveActionSpecController`
- Exported: `PmUnifiedCorrectiveActionService`, `PmUnifiedCorrectiveActionCailService`
- Consumers: JHA/FLHA, PM project management, site access, equipment safety, inspections, incidents, SIF/HECA

---

## 2. Database schema

### `corrective_actions` → `PmCorrectiveAction` (`corrective_actions`)

| Spec field | Vera column |
|------------|-------------|
| id | `id` (UUID) |
| company_id | `companyId` |
| project_id | `projectId` |
| source_type | `sourceModule` |
| source_id | `sourceId` |
| action_type | `actionType` |
| severity | `severityLevel`, `severityScore` |
| priority | `priorityLevel`, `priorityScore` |
| root_cause | `rootCauseId` |
| hazard_id | `hazardId` |
| control_id | `controlId` |
| equipment_id | `equipmentId` |
| worker_id | `workerId` |
| due_date | `dueAt` |
| status | `status` (`PmCorrectiveActionStatus`) |
| created_by | `createdByUserId` |
| created_at | `createdAt` |

### `corrective_action_assignments` → `PmCorrectiveActionAssignee`

| Spec field | Vera column |
|------------|-------------|
| corrective_action_id | `actionId` |
| assignee_id | `userId` / `workerId` |
| assigned_by | audit `assigned` event `actorId` |
| assigned_at | `assignedAt` |
| role | `role` (primary / secondary / delegate) |

### `corrective_action_escalations` → `PmCorrectiveActionEscalation`

| Spec field | Vera column |
|------------|-------------|
| level | `level` |
| triggered_at | `triggeredAt` |
| notified_roles | `payload` JSON (`notifiedUserIds`, roles) |

### `corrective_action_verifications` → `PmCorrectiveActionVerification`

| Spec field | Vera column |
|------------|-------------|
| verified_by | `verifierUserId` |
| verified_at | `verifiedAt` |
| verification_notes | `notes` |
| evidence | `evidenceJson` |

### `corrective_action_attachments` → `PmCorrectiveActionAttachment`

| Spec field | Vera column |
|------------|-------------|
| file_path | `storageKey` / `dataUrl` |
| uploaded_by | audit `attachment_added` `actorId` |
| uploaded_at | `createdAt` |
| phase | `phase` (creation / completion / verification) |

### Supporting tables

- `corrective_action_versions` — publish snapshots
- `corrective_action_links` — module cross-links (hazard, jha_flha, inspection, …)
- `corrective_action_audit` — audit trail
- `pm_capa_overrides` — enforcement waivers
- `pm_capa_offline_cache` — offline bundles

---

## 3. API contract

### Spec paths (`/api/v1/pm/corrective-action`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create corrective action (`companyId`, `projectId`, `title`, `sourceModule`, `sourceId`) |
| POST | `/assign` | Assign primary/secondary (`actionId`, `userId`/`workerId`) |
| POST | `/escalate` | Run escalation sweep (`projectId`) |
| POST | `/verify` | Verify approve/reject (`actionId`, `outcome`, `role`, `notes`) |
| POST | `/offline/sync` | Upload offline changes; returns `serverState` bundle |
| GET | `/{id}` | Full action detail + assignees, escalations, verifications |

### Primary paths (`/api/v1/pm/unified-corrective-action`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Metrics + company CAPA score + CAIL insights |
| GET | `/analytics` | Dashboard + project closure analytics |
| GET | `/analytics/trends` | 30d trends + overdue risk score |
| GET | `/list` | Filtered CAPA list |
| GET | `/:id` | Detail (delegates core service) |
| POST | `/create` | Unified create + optional publish |
| PUT | `/:id` | Update metadata |
| POST | `/:id/publish` | Publish + version snapshot |
| PUT | `/:id/assign` | Assign |
| POST | `/:id/auto-assign` | Rule-based assignment |
| POST | `/:id/in-progress` | Mark in progress |
| POST | `/:id/submit` | Submit for verification |
| POST | `/:id/verify` | Verify (closes deficiencies on approve) |
| POST | `/generate/batch` | Scan all modules for new CAPA |
| POST | `/generate/source` | Generate from single source |
| POST | `/escalation/sweep` | Project escalation sweep |
| POST | `/enforcement/evaluate` | Enforcement simulation |
| GET | `/sync/bundle` | Offline download |
| POST | `/sync/apply` | Offline upload |
| GET | `/cail/bundle` | Full CAIL bundle |
| GET | `/cail/insights` | Explainable insights |

### Frontend clients

- Spec: `vera-frontend/lib/pm-corrective-action.ts`
- Primary: `vera-frontend/lib/pm-unified-corrective-action.ts`
- Legacy: `vera-frontend/lib/pm-corrective-actions.ts`

---

## 4. Frontend architecture

### Screens (UI routes)

| Screen | Route | Purpose |
|--------|-------|---------|
| Corrective Action List | `/pm/unified-corrective-action` | Dashboard tabs: actions, escalation, enforcement, CAIL |
| Corrective Action Detail | `/pm/unified-corrective-action/[id]` | Publish, assign, submit, verify |
| Assignment Screen | Detail + `PUT .../assign` | Primary/secondary owners |
| Escalation Dashboard | Dashboard escalation tab + sweep | Level distribution |
| Verification Screen | Detail verify panel | Approve/reject with role |
| Offline Queue | Field sync handler | Download bundle / upload changes |

### Components (recommended / partial)

- `CorrectiveActionCard`, `AssignmentCard`, `EscalationBadge`, `VerificationChecklist`

Nav: `PmModuleNav` → Unified Corrective Actions

---

## 5. Workflow logic

### States (spec → Vera `PmCorrectiveActionStatus`)

| Spec state | Vera status |
|------------|-------------|
| Draft | `draft` |
| Assigned | `assigned` / `open` |
| In Progress | `in_progress` |
| Submitted | `verification_pending` |
| Verified | `verified` |
| Closed | `closed` |
| Overdue | computed (`dueAt < now` + open status) |
| Escalated | `escalationLevel` ≥ 1 |

### Transitions

- Draft → Assigned: `POST .../publish` or create with `publish: true`
- Assigned → In Progress: `POST .../in-progress`
- In Progress → Submitted: `POST .../submit`
- Submitted → Verified: `POST .../verify` (`outcome: approve`)
- Verified → Closed: auto `closedAt` on approve
- Any open + past due → Escalated: `POST /escalate` or scheduler sweep
- Submitted → In Progress: verify `reject`

### Validation

- Evidence required when `evidenceRequirementsJson` non-empty (core verify)
- High-severity (`severityScore ≥ 75`) requires safety officer role in `verificationRequirementsJson`
- Cannot update `verified` / `closed` / `cancelled` rows

---

## 6. CAIL intelligence logic

`PmUnifiedCorrectiveActionCailService`:

| Capability | Method |
|------------|--------|
| Predictive corrective action generation | `predictCapaGeneration` (open deficiencies/incidents without CAPA) |
| Predictive overdue risk | `overdueRiskScore` |
| Worker risk scoring | `workerRiskScoring` |
| Equipment risk scoring | `equipmentRiskScoring` |
| Chronic deficiency detection | `chronicDeficiencyDetection` (repeat sourceId > 2 in 180d) |
| Weak control detection | `weakControlDetection` (low effectiveness / unverified H&C links) |
| Company corrective action score | `companyCapaScore` |
| Project corrective action score | `projectCapaScore` |

Bundle: `GET /cail/bundle`.

---

## 7. Offline mode

**Download:** `GET /sync/bundle?companyId=&projectId=` or field handler without upload payload.

Bundle: open actions, assignments, hazard/control subset, `syncedAt`. Cache: `pm_capa_offline_cache`.

**Upload:** `POST /corrective-action/offline/sync` or `POST /sync/apply` with:

```json
{
  "companyId": 1,
  "projectId": 1,
  "actions": [{ "clientSyncId": "local-1", "title": "...", "sourceModule": "manual", "sourceId": "local-1" }],
  "verifications": [{ "actionId": "<uuid>", "outcome": "approve", "role": "supervisor" }],
  "attachments": [{ "actionId": "<uuid>", "fileName": "photo.jpg", "dataUrl": "..." }]
}
```

Field action `pmUnifiedCorrectiveAction.sync` — download by default; upload when `actions`, `verifications`, or `attachments` present (requires `projectId`).

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| JHA / FLHA | Auto-generate on submit; **approval gate** blocks if open CAPA |
| SIF/HECA | Auto-generate; critical verification role |
| Inspections | Deficiency → CAPA; auto-close deficiency on verify |
| Incidents | Root-cause CAPA generation |
| Equipment Safety | Failure → CAPA; lockout until resolved |
| SDS | Gap CAPA generation |
| Training | Expired training → CAPA; worker access block |
| Site Access | Access denial → CAPA |
| PM Module | Blocked tasks → CAPA; **task start gate** |
| Safety Stations | Real-time enforcement API |
| Company / Project Safety Context | Policy and library alignment |
| Unified Hazard & Control | Weak/missing control batch generation |

---

## 9. Analytics

`GET /analytics` and `GET /analytics/trends` return:

| Metric | Source |
|--------|--------|
| Corrective action trends | Status groupBy + 30d created/closed |
| Overdue trends | `dueAt < now` counts |
| Escalation patterns | `corrective_action_escalations` 30d |
| Worker performance | `workerRiskScoring` |
| Equipment performance | `equipmentRiskScoring` |
| Project corrective action score | `projectCapaScore` |
| Company corrective action score | `companyCapaScore` / dashboard `companyCapaScore` |
| Leading indicators | Overdue rate, critical open, `overdueRiskScore` |

---

## Quick start

```bash
# Create corrective action
POST /api/v1/pm/corrective-action
{ "companyId": 1, "projectId": 1, "title": "Install guard", "sourceModule": "inspection", "sourceId": "def-123" }

# Assign and verify
POST /api/v1/pm/corrective-action/assign
{ "actionId": "<uuid>", "userId": 42 }
POST /api/v1/pm/corrective-action/verify
{ "actionId": "<uuid>", "outcome": "approve", "role": "supervisor" }

# Offline sync (field)
# action: pmUnifiedCorrectiveAction.sync
# payload: { companyId: 1, projectId: 1 }  # download
# payload: { companyId: 1, projectId: 1, actions: [...] }  # upload
```

See also: `docs/vera-pm-unified-corrective-action-system.md`
