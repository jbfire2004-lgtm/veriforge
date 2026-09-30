# Vera PM Project Management Module

Production module at `/api/v1/pm/project-management` · Spec alias: `/api/v1/pm/project` · UI `/pm/project-management`.  
Developer pack: `docs/vera-pm-project-management-developer-pack.md`  
Integrates company/project/worker safety context, equipment safety, emergency locks, JHA/FLHA, inspections, CAPA, and CAIL.

## 1. Backend architecture

```
pm-project-management/
├── pm-project-management.module.ts
├── pm-project-management.controller.ts
├── pm-project-management.service.ts          # Orchestration
├── pm-project-management-cail-intelligence.service.ts
├── safety-gating.engine.ts                   # Task/schedule/assignment gates
├── scheduling.engine.ts                      # Conflict detection
└── work-package.engine.ts                    # Publish + progress rollup
```

**Dependencies:** `PmProjectSafetyContextService`, `PmCompanySafetyContextService`, `PmWorkerSafetyProfileService`, `PmEquipmentSafetyService`, `PrismaService`.

**Flows:**
- `configureProject` → `ProjectAssignment` / `EquipmentProjectAssignment` + `autoGenerateProfile` + `publishProfile`
- `createWorkPackage` → auto-import published hazards/controls from project safety context
- `startTask` → `SafetyGatingEngine` (JHA, training, equipment, zone, SIF review, emergency lock)
- `createScheduleEntry` → safety block + conflict flags
- `assignWorker` / `assignEquipment` → enforcement engines, status `blocked` when violations
- Permits: `draft` → `pending_approval` → `approved` → `active` with `permit_versions` snapshots

## 2. Database schema

| Table | Model | Purpose |
|-------|-------|---------|
| `pm_project_config` | `PmProjectConfig` | Project type, scope, zones, schedule, PM id, progress/safety scores |
| `work_packages` | `PmWorkPackage` | Versioned work packages, hazard/control links, publish state |
| `tasks` | `PmPmTask` | Task metadata, JHA/PPE/training requirements, progress |
| `project_schedules` | `PmProjectSchedule` | Gantt slots (worker/equipment/task/zone), conflict + safety flags |
| `pm_worker_assignments` | `PmPmWorkerAssignment` | Worker ↔ project/task with validation JSON |
| `pm_equipment_assignments` | `PmPmEquipmentAssignment` | Equipment ↔ task with operator |
| `permits` | `PmPermit` | Hot work, confined space, LOTO, etc. |
| `permit_versions` | `PmPermitVersion` | Immutable permit snapshots |
| `pm_attachments` | `PmPmAttachment` | Media linked to any PM entity |
| `pm_audit` | `PmPmAuditLog` | Full audit trail |
| `pm_project_offline_cache` | `PmProjectOfflineCache` | Offline bundle storage |

Migration: `prisma/migrations/20260521260000_pm_project_management/migration.sql`

Multi-company isolation via `Project.companyId`. Soft delete on work packages/tasks via `deletedAt`.

## 3. API contract

### Spec alias (`/api/v1/pm/project`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create project |
| POST | `/work-package`, `/task`, `/schedule`, `/assign/worker`, `/assign/equipment`, `/permit`, `/progress` |
| POST | `/offline/sync` | Offline upload |
| GET | `/{id}/dashboard`, `/{id}/cail`, `/{id}/analytics` |

### Primary (`/api/v1/pm/project-management`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `project` | Supervisor+ | Create project |
| GET | `project/:id/dashboard` | PM | Dashboard + CAIL forecast |
| GET | `project/:id/cail` | PM | Full CAIL bundle |
| GET | `project/:id/analytics` | PM | Utilization, permit trends, leading indicators |
| PUT | `project/:id/configure` | Supervisor+ | Setup project + safety auto-gen |
| GET/POST | `project/:id/work-packages` | POST: Supervisor+ | List/create work packages |
| POST | `work-packages/:id/publish` | Supervisor+ | Publish workflow |
| GET/POST | `project/:id/tasks` | POST: Supervisor+ | Tasks CRUD |
| POST | `tasks/:id/start` | PM | Safety-gated task start |
| POST | `tasks/:id/progress` | PM | Progress % + rollup |
| POST | `tasks/:id/gate` | PM | Evaluate start gate without starting |
| GET/POST | `project/:id/schedule` | POST: Supervisor+ | Gantt entries + conflicts |
| POST | `project/:id/assignments/worker` | PM | Worker assignment + gate |
| POST | `project/:id/assignments/equipment` | PM | Equipment assignment + gate |
| GET/POST | `project/:id/permits` | POST: Supervisor+ | Permit lifecycle |
| POST | `permits/:id/submit|approve|activate` | Approve: Supervisor+ | Workflow transitions |
| GET/POST | `attachments` | PM | Media |
| GET/POST | `sync/:projectId` | PM | Offline bundle / apply sync |
| GET | `project/:id/cail/insights` | PM | Explainable insights |

Errors: `404` not found, `400` validation/safety gate with violation messages in body.

## 4. Frontend architecture

- Route: `vera-frontend/app/pm/project-management/page.tsx`
- Dashboard: `src/pages/pm/project-management/dashboard.tsx`
- API client: `lib/pm-project-management.ts`
- Tabs: Overview, Work packages, Tasks, Schedule (Gantt data), Permits, CAIL insights
- Nav: `PmModuleNav`, `PM_MODULE_LINKS` in `lib/navigation/pm-workflow.ts`

## 5. Workflow logic

**Project setup:** `draft config` → assign workers/equipment → `autoGenerateProfile` → `publishProfile` → `setupComplete=true`.

**Work package:** `draft` → validate hazards/JHA/controls → `published` (version++).

**Task:** `draft` → schedule → assign workers/equipment → `POST start` → gates pass → `in_progress` → progress → `completed`.

**Permit:** `draft` → `pending_approval` → `approved` (+ version snapshot) → `active` → `expired|closed`.

**Emergency:** active `pm_site_emergency_lock` blocks schedule, assignments, and task start.

## 6. CAIL intelligence

`PmProjectManagementCailIntelligenceService`:
- `taskRiskScore` — SIF, hazards, CAPA, blocked tasks
- `projectSafetyForecast` — 0–100 score, trend
- `projectInsights` — correlated PM ↔ JHA ↔ inspections ↔ CAPA with explainable recommendations

## 7. Offline mode

- Sync action: `pmProjectManagement.sync` in `lib/field/sync-handlers.ts`
- GET `sync/:projectId` — full bundle (config, WPs, tasks, schedule, assignments, permits, attachments, project safety requirements)
- POST `sync/:projectId` — upsert work packages, tasks, schedule, assignments, permits, progress, attachments
- Spec `POST /project/offline/sync` — same payload with `projectId` in body
- Cache table: `pm_project_offline_cache` key `full_bundle`

## 8. Integration map

| Module | Integration point |
|--------|-------------------|
| Project safety context | Auto-gen on configure; `enforcementGate` on task start |
| Company safety context | Corporate training/policy via worker gate |
| Worker safety profile | `enforcementGate` on assignment and task start |
| Equipment safety | `validateAssignment` on equipment assign/start |
| Site access / emergency | `pm_site_emergency_lock` |
| JHA/FLHA | `requiredJhaId`, status `APPROVED`/`LOCKED`, supervisor signatures |
| SIF/HECA | `sifReviewRequired` on tasks from hazard library |
| Inspections / CAPA | CAIL correlation counts |
| CAIL entries | Dashboard open-item counts (via project safety context) |

## 9. Analytics and scoring

- **Project safety score:** config `safetyScore` updated from CAIL forecast
- **Progress:** task → work package → project rollup (`WorkPackageEngine.rollupProgress`)
- **Schedule utilization:** non-blocked, non-conflict slots / total slots
- **Leading indicators:** blocked tasks, schedule conflicts, safety forecast trend
- **Permit trends:** `groupBy` status on `permits`

## Deployment

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Register module in `app.module.ts` (`PmProjectManagementModule`).
