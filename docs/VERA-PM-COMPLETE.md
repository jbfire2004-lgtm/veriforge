# Vera PM — Complete Project Management Module

Operational project management integrated with Vera safety execution.

## Architecture

```
/api/v1/pm/project-management
├── projects                          GET list
├── project                           POST create
├── project/:id/dashboard             GET metrics
├── project/:id/readiness             GET readiness score
├── project/:id/activity              GET activity feed
├── project/:id/work-packages         GET/POST
├── project/:id/tasks                 GET/POST + start/progress/gate
├── project/:id/schedule              GET/POST
├── project/:id/assignments/worker    GET/POST
├── project/:id/assignments/equipment GET/POST
├── project/:id/scheduling/optimize   POST (predictive_scheduling tier)
├── project/:id/scheduling/apply      POST
├── project/:id/dispatch/run          POST (autonomous_dispatch tier)
├── project/:id/dispatch/apply        POST
└── sync/:id                          GET/POST offline bundle
```

## Database (Prisma)

| Model | Table | Purpose |
|-------|-------|---------|
| `Project` | `Project` | Base project entity |
| `PmProjectConfig` | `pm_project_config` | PM setup |
| `PmWorkPackage` | `work_packages` | Work packages |
| `PmPmTask` | `tasks` | Tasks |
| `PmProjectSchedule` | `project_schedules` | Schedule entries |
| `PmPmWorkerAssignment` | `pm_worker_assignments` | Worker assignments |
| `PmPmEquipmentAssignment` | `pm_equipment_assignments` | Equipment assignments |
| `PmPmAuditLog` | `pm_audit` | Activity audit trail |
| `PmPermit` | `permits` | Hot work, LOTO, etc. |

## Backend services

| Service | Path |
|---------|------|
| `PmProjectManagementService` | Core CRUD + safety gating |
| `PmSchedulingBridgeService` | Predictive + autonomous → PM persistence |
| `SchedulingEngine` | Conflict detection |
| `SafetyGatingEngine` | Task start gates |

## Frontend routes

| Route | Component |
|-------|-----------|
| `/pm/projects` | `PmProjectsList` |
| `/pm/projects/[id]` | `PmProjectWorkspace` |
| `/pm/project-management` | `PmProjectWorkspace` (legacy alias) |

### Workspace tabs

- Overview — work packages
- Tasks — create, start, complete
- Schedule — schedule blocks + conflicts
- Assignments — worker & equipment
- Readiness — project readiness scoring
- Activity — audit feed + daily log links
- Predictive scheduling — tier-gated optimize + apply
- Autonomous dispatch — tier-gated run + apply

## Access control

- `@RequireModule('pm')` on project-management controller
- `@RequireFeature('predictive_scheduling')` on scheduling endpoints
- `@RequireFeature('autonomous_dispatch')` on dispatch endpoints

## Client SDK

`lib/pm-project-management.ts` — full API client

## Verify

```bash
cd backend && npm run start:dev
cd vera-frontend && npm run dev
```

Visit `/pm/projects` → create project → open workspace → tasks, schedule, assignments, readiness.
