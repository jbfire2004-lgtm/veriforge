# Vera PM — Equipment Safety Management System

Production module at `/api/v1/pm/equipment-safety` and UI `/pm/equipment-safety`.

## Architecture

| Layer | Path |
|-------|------|
| API | `backend/src/pm-equipment-safety/` |
| Core equipment | `Equipment`, `EquipmentLockout`, `EquipmentComplianceService` |
| PM inspections | `PmInspection` + `PmInspectionsEquipmentService` (lockout on critical deficiency) |
| Migration | `20260521210000_pm_equipment_safety` |

### Engines

- **EquipmentConditionEngine** — 0–100 score, risk band from compliance, LOTO, deficiencies, certs, chronic failures
- **EquipmentAssignmentEngine** — auth, cert, inspection, condition threshold, LOTO rules
- **LotoWorkflowEngine** — `active → verified → removed`
- **FailureWorkflowEngine** — `reported → supervisor_review → owner_review → locked_out → capa_open → verified → closed`
- **PmEquipmentCailIntelligenceService** — project insights, operator risk, cross-module correlation

### Tables (`@@map`)

| Model | Table |
|-------|-------|
| `PmEquipmentCertification` | `equipment_certifications` |
| `PmEquipmentInspection` | `equipment_inspections` |
| `PmEquipmentInspectionItem` | `equipment_inspection_items` |
| `PmEquipmentFailure` | `equipment_failures` |
| `PmEquipmentLoto` | `equipment_loto` |
| `PmWorkerEquipmentAuthorization` | `worker_equipment_authorizations` |
| `PmEquipmentConditionScore` | `equipment_condition_scores` |
| `PmEquipmentAssignmentAudit` | `equipment_assignment_audit` |
| `PmEquipmentSafetyAudit` | `equipment_audit` |

Extended `Equipment`: `operationalStatus`, `safetyCategory`, `capacity`, `loadChartJson`, `pmSafetyMetadataJson`, `deletedAt`.

## Workflows

### Equipment lifecycle

`active → in_service | out_of_service | locked_out | decommissioned`

Certification: `draft → pending_approval → approved → expired` (auto `out_of_service` on expiry scan)

### Failure

1. **POST** `/failures` — auto LOTO + CAPA (`sourceModule: equipment_failure`)
2. Supervisor/owner transitions via **PUT** `/failures/:id/status`
3. LOTO removal after verification

### LOTO

1. **POST** `/loto` — creates `equipment_loto` + legacy `EquipmentLockout`, sets equipment `locked_out`
2. **POST** `/loto/:id/verify` — authorized verification
3. **POST** `/loto/:id/remove` — clears lockout when no active LOTO remains

### Assignment validation

**POST** `/assignments/validate` — checks authorization, certification, inspection due, condition score ≥ 50, not under LOTO; writes `equipment_assignment_audit`.

### Site access

`SiteAccessService` calls `workerAccessCheck()` — blocks if any assigned equipment fails validation.

## API summary

| Method | Path | Notes |
|--------|------|-------|
| GET | `/profiles` | Fleet list |
| GET | `/profiles/:id` | Full profile |
| PUT | `/profiles/:id` | Update metadata |
| POST | `/profiles/:id/condition` | Recalculate score |
| GET/POST | `/certifications` | Cert CRUD + approve |
| POST | `/inspections/register` | Link PM inspection to equipment layer |
| POST | `/failures` | Report failure |
| GET/POST | `/loto` | LOTO lifecycle |
| GET/POST | `/authorizations` | Operator authorizations |
| POST | `/assignments/validate` | Pre-assignment rules |
| GET | `/access/worker` | Site access gate |
| GET | `/analytics/project/:id` | Dashboard |
| GET | `/intelligence/project/:id` | CAIL insights |
| GET/POST | `/sync/project/:id` | Offline bundle |
| GET | `/station/:companyId` | Station payload |

## Analytics scoring

- **Condition score**: starts 100, deductions for lockout (−100), non-compliant (−40), unsafe (−35), critical deficiencies, expired certs, chronic failures (≥3 in 90d)
- **Project equipment score**: average of latest condition scores
- **Leading indicators**: `failureRate`, `lockoutRate`
- **CAIL insight score**: `100 - condition.score` for high/critical bands

## Integrations

| Module | Hook |
|--------|------|
| PM Inspections | Register via `/inspections/register`; existing lockout on critical deficiency |
| CAPA | `fromDocumentDeficiency` on failures |
| Site access | `workerAccessCheck` in `evaluateAccess` |
| Safety stations | `/station/:companyId` status + LOTO + reminders |
| Compliance engine | `recalculate()` on cert approve, LOTO, unlock |

## Frontend

- Dashboard: `src/pages/pm/equipment-safety/dashboard.tsx`
- Profile: `app/pm/equipment-safety/[id]/page.tsx`
- Client: `lib/pm-equipment-safety.ts`
- Offline: `pmEquipment.sync`
