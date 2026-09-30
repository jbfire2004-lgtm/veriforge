# Project Management Module (Safety-Integrated) — Developer-Ready Pack

Safety-gated project execution: work packages, tasks, Gantt scheduling, worker/equipment assignments, permits, progress tracking, attachments, CAIL predictions, and offline field sync.

**Primary API:** `/api/v1/pm/project-management`  
**Spec alias API:** `/api/v1/pm/project`  
**UI:** `/pm/project-management`  
**Offline sync:** `pmProjectManagement.sync`  
**Backend:** `backend/src/pm-project-management/`  
**Migration:** `20260521260000_pm_project_management`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| project-service | `createProject`, `configureProject`, `getProjectDashboard` |
| work-package-service | `createWorkPackage`, `publishWorkPackage`, `listWorkPackages` |
| task-service | `createTask`, `startTask`, `updateTaskProgress`, `evaluateTaskGateById` |
| scheduling-service | `createScheduleEntry`, `listSchedule` + `SchedulingEngine` |
| worker-assignment-service | `assignWorker` + worker `enforcementGate` |
| equipment-assignment-service | `assignEquipment` + equipment `validateAssignment` |
| permit-service | `createPermit`, submit/approve/activate workflow |
| progress-tracking-service | `updateTaskProgress`, `recalculateProjectProgress` |
| pm-safety-gating-service | `SafetyGatingEngine`, `evaluateTaskStartGate` |
| attachment-service | `addAttachment`, `listAttachments` → `PmPmAttachment` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmProjectManagementCailIntelligenceService` |
| audit-service | `PmPmAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Project Creation Engine | `createProject`, `configureProject` | Project + config + safety auto-gen |
| Work Package Engine | `work-package.engine.ts` | Publish validation, progress rollup |
| Task Engine | task CRUD + `startTask` | Safety-gated execution |
| Scheduling Engine (Gantt) | `scheduling.engine.ts` | Conflict detection on worker/equipment slots |
| Worker Assignment Engine | `assignWorker` | Validation JSON + block status |
| Equipment Assignment Engine | `assignEquipment` | Operator + equipment safety gate |
| Permit Management Engine | permit lifecycle | draft → pending → approved → active |
| Progress Tracking Engine | task → WP → project rollup |
| Safety Gating Engine | `safety-gating.engine.ts` | JHA, training, equipment, zone, SIF, emergency |
| PM Corrective Action Engine | `unifiedCapa.pmTaskStartGate` | CAPA blocks on task start |
| Offline PM Engine | `applyOfflineSync` | clientSyncId upserts + bundle refresh |

### Module wiring

- `PmProjectSafetyContextModule`, `PmCompanySafetyContextModule`
- `PmWorkerSafetyProfileModule`, `PmEquipmentSafetyModule`
- `PmUnifiedCorrectiveActionModule` (optional)
- Offline batch router: `pmProjectManagement.sync`

---

## 2. Database schema

Prisma models map to spec table names via `@@map`.

### `projects` → `Project` + `PmProjectConfig` (`pm_project_config`)

| Spec field | Vera column |
|------------|-------------|
| company_id | `Project.companyId` |
| name | `Project.name` |
| type | `PmProjectConfig.projectType` |
| scope | `PmProjectConfig.scopeOfWorkJson` |
| start_date / end_date | `Project.startDate`, `Project.endDate` |
| risk_level | `PmProjectConfig.safetyScore` / project safety profile |

### `work_packages` → `PmWorkPackage` (`work_packages`)

| Spec field | Vera column |
|------------|-------------|
| required_equipment | `requiredEquipmentIds` (jsonb) |
| required_workers | `requiredWorkerIds` (jsonb) |
| required_training | `requiredTraining` (jsonb) |
| required_jha | `requiredJhaIds` (jsonb) |
| required_permits | `requiredPermitTypes` (jsonb) |
| version / status | `version`, `status` |

### `tasks` → `PmPmTask` (`tasks`)

| Spec field | Vera column |
|------------|-------------|
| task_type | `taskType` |
| required_skills | `requiredSkills` (jsonb) |
| required_controls | `requiredControls` (jsonb) |
| required_ppe | `requiredPpe` (jsonb) |
| status | `status` (`PmPmTaskStatus`) |

### `project_schedules` → `PmProjectSchedule` (`project_schedules`)

| Spec field | Vera column |
|------------|-------------|
| start_time / end_time | `startAt`, `endAt` |
| status | implied via `safetyBlocked`, `conflictFlag` |

### `worker_assignments` → `PmPmWorkerAssignment` (`pm_worker_assignments`)

| Spec field | Vera column |
|------------|-------------|
| validation_status | mapped: `passed` / `failed` / `pending` from `status` |
| validation_reason | `blockedReason` |

### `equipment_assignments` → `PmPmEquipmentAssignment` (`pm_equipment_assignments`)

Same validation mapping as worker assignments.

### `permits` → `PmPermit` (`permits`)

| Spec field | Vera column |
|------------|-------------|
| permit_type | `permitType` |
| issued_by / issued_at | `approvedById`, `approvedAt` (on approve) |
| expires_at | `validTo` |

### `pm_attachments` → `PmPmAttachment`

| Spec field | Vera column |
|------------|-------------|
| module_type | `entityType` |
| module_record_id | `entityId` |
| file_path | `storageKey` or `dataUrl` |

### `pm_audit` → `PmPmAuditLog`

| Spec field | Vera column |
|------------|-------------|
| event_type | `eventType` |
| event_data | `payload` (jsonb) |
| actor_id | `actorId` |
| timestamp | `createdAt` |

---

## 3. API contract

### Spec paths (`/api/v1/pm/project`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create project (+ optional auto-configure safety) |
| POST | `/work-package` | Create work package (`projectId` in body) |
| POST | `/task` | Create task |
| POST | `/schedule` | Create schedule entry (Gantt slot) |
| POST | `/assign/worker` | Assign worker with safety gate |
| POST | `/assign/equipment` | Assign equipment with safety gate |
| POST | `/permit` | Create permit |
| POST | `/progress` | Update task progress % |
| POST | `/offline/sync` | Upload offline PM data |
| GET | `/{id}/dashboard` | Project dashboard + CAIL forecast |
| GET | `/{id}/cail` | Full CAIL bundle (delays, conflicts, recommendations) |
| GET | `/{id}/analytics` | Utilization + leading indicators |

### Primary paths (`/api/v1/pm/project-management`)

See `docs/vera-pm-project-management-system.md` for full route table including `configure`, `publish`, permit workflow, and `tasks/:id/gate`.

### Frontend clients

- Spec: `vera-frontend/lib/pm-project.ts`
- Primary: `vera-frontend/lib/pm-project-management.ts`

---

## 4. Frontend architecture

### Screens (`/pm/project-management`)

| Screen | Purpose |
|--------|---------|
| Project Dashboard | Metrics, safety score, CAIL forecast |
| Work Package Manager | Draft/publish WPs with hazard/control links |
| Task Manager | Tasks, start gate, progress |
| Gantt Scheduler | Schedule entries + conflict flags |
| Worker Assignment Screen | Assignments with validation status |
| Equipment Assignment Screen | Operator + equipment gate |
| Permit Manager | Full permit lifecycle |
| Progress Tracker | Task and project rollup |
| Safety Gating Alerts | Blocked tasks, gate evaluation |
| Offline PM Queue | Field sync |

### Components (recommended)

- `WorkPackageCard`, `TaskCard`, `GanttChart`, `WorkerAssignmentCard`
- `EquipmentAssignmentCard`, `PermitCard`, `ProgressBar`, `SafetyGateIndicator`

---

## 5. Workflow logic

### Project flow

Create Project → Work Packages → Tasks → Scheduling → Assignments → Execution

`configureProject` triggers project safety profile auto-generate + publish.

### Safety gating

| Condition | Action |
|-----------|--------|
| Worker training incomplete | Block assignment / task start |
| Equipment unsafe (LOTO, status) | Block assignment |
| JHA not approved | Block task start |
| Zone / project context fail | Block via `enforcementGate` |
| Emergency active (`pm_site_emergency_lock`) | Auto-lock schedule + assignments |
| SIF review required | Supervisor JHA signature required |
| Open CAPA | `pmTaskStartGate` blocks |

### Permit flow

`draft` → `pending_approval` → `approved` (+ version snapshot) → `active` → `expired`

---

## 6. CAIL intelligence logic

| Capability | Method |
|------------|--------|
| Predictive schedule delays | `predictScheduleDelays` |
| Predictive resource conflicts | `predictResourceConflicts` |
| Predictive hazard emergence | `predictHazardEmergence` |
| Task risk scoring | `taskRiskScore` |
| Worker risk scoring | `workerRiskScoresForProject` |
| Equipment risk scoring | `equipmentRiskScoresForProject` |
| Recommended controls | `recommendControlsForTask` |
| Recommended training | `recommendTrainingForTask` |
| Recommended schedule adjustments | `recommendScheduleAdjustments` |
| Project safety forecast | `projectSafetyForecast` |

Bundle: `GET /project/{id}/cail` or `getCailBundle`.

---

## 7. Offline mode

**Download:** `GET /sync/:projectId` or field handler without upload payload.

Bundle: config, work packages, tasks, schedule, assignments, permits, attachments, project safety requirements.

**Upload:** `POST /offline/sync` with:

```json
{
  "projectId": 1,
  "workPackages": [{ "clientSyncId": "wp-1", "code": "WP01", "title": "Foundation" }],
  "tasks": [{ "clientSyncId": "t-1", "code": "T01", "title": "Excavation", "progressPct": 50 }],
  "schedule": [{ "title": "Crew A", "startAt": "...", "endAt": "..." }],
  "workerAssignments": [{ "workerId": 42, "taskId": "..." }],
  "progress": [{ "taskId": "...", "progressPct": 75 }]
}
```

Field action `pmProjectManagement.sync` — upload when any sync payload arrays present.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Project Safety Context | Auto-gen on configure; `enforcementGate`; offline bundle |
| Company Safety Context | Corporate training/policy via worker gate |
| Worker Safety Profiles | `enforcementGate` on assignment + task workers |
| Equipment Safety | `validateAssignment` on equipment assign |
| JHA / FLHA | `requiredJhaId`, APPROVED/LOCKED status, supervisor sig |
| Inspections | Hazard emergence forecast from deficiencies |
| Incidents / CAPA | CAIL counts; `pmTaskStartGate` |
| SDS / Policies | Site access checks in worker gate |
| Site Access / Emergency | Emergency lock; access validation logs |
| Safety Stations | Via site access module |
| PM Attachments Media | `PmPmAttachment` entity linking |
| Offline Mode Engine | `pmProjectManagement.sync` in batch router |
| Unified Hazard/Control | Work package hazard/control JSON links |

---

## 9. Analytics

`GET /project/{id}/analytics` returns:

| Metric | Source |
|--------|--------|
| Project safety score trends | CAIL `projectSafetyForecast` on dashboard |
| Schedule utilization | Non-blocked, non-conflict slots / total |
| Permit trends | `groupBy` status on permits |
| Leading indicators | Blocked tasks, schedule conflicts, safety forecast |
| Progress | `PmProjectConfig.progressPct` rollup from tasks |

---

## Quick start

```bash
POST /api/v1/pm/project
{ "companyId": 1, "name": "Site Alpha", "autoConfigure": true }

GET /api/v1/pm/project/1/dashboard

POST /api/v1/pm/project/assign/worker
{ "projectId": 1, "workerId": 42, "taskId": "..." }

POST /api/v1/pm/project/tasks/:id/start
# primary: POST /api/v1/pm/project-management/tasks/:id/start
```

See also: `docs/vera-pm-project-management-system.md`
