# Vera PM Corrective Action Management System

Unified corrective action layer on **CAIL** with assignment, 5-level escalation, verification, deficiency closure, equipment lock/unlock, and cross-module auto-generation.

**API:** `/api/v1/pm/corrective-actions`  
**UI:** `/pm/corrective-actions`

---

## Architecture

```
Source modules (JHA, Inspection, Incident, SIF/HECA, Equipment)
        ↓
PmCapaAutoGenerateService / manual create
        ↓
PmCorrectiveAction (+ CailEntry sync)
        ↓
Assignment → Due dates → Escalation cron/run
        ↓
Verification → Deficiency close → Equipment unblock
```

---

## Database

| Table | Purpose |
|-------|---------|
| `pm_corrective_action` | Core CAPA (1:1 `cailEntryId`) |
| `pm_corrective_action_assignee` | Multi-assignee + delegation |
| `pm_corrective_action_escalation` | Levels 1–5 audit |
| `pm_corrective_action_verification` | Supervisor / safety / PM verify |
| `pm_corrective_action_attachment` | Evidence |
| `pm_corrective_action_signature` | Sign-off |
| `pm_corrective_action_audit` | Full audit |
| `pm_capa_company_config` | Due-day rules per company |

**Migration:** `20260519220000_pm_corrective_actions`

---

## Action types

`immediate`, `interim_control`, `permanent`, `preventive`, `equipment_repair`, `training_requirement`, `policy_update`

---

## Status workflow

| Status | Meaning |
|--------|---------|
| `draft` | Not published to assignees |
| `open` | Created, CAIL open |
| `assigned` | Primary assignee set |
| `in_progress` | Work started |
| `verification_pending` | Awaiting verifier |
| `verified` | Approved with evidence |
| `closed` | Terminal |
| `cancelled` | Cancelled |

---

## Engines

### Priority (`CapaPriorityEngine`)
`priorityScore = severity + actionType boost + SIF(+20) + HECA(+15) + equipment(+25) + overdue(+30)` capped at 100.

### Due dates (`CapaDueDateEngine`)
Company config: critical 1d, high 7d, medium 14d, low 30d (defaults).

### Escalation (`CapaEscalationEngine`)
1. Reminder (overdue)  
2. Supervisor  
3. Safety (SIF/HECA, equipment unsafe)  
4. Project manager (critical)  
5. Company (7+ days overdue)

### Verification (`CapaVerificationEngine`)
Roles: `supervisor`, `safety_officer`, `project_manager`  
Approve → `verified` + CAIL verified + deficiency closed + equipment unblock if no open CAPA  
Reject → `in_progress`

---

## Auto-generation API

| Endpoint | Source |
|----------|--------|
| `POST /auto/jha-flha/:id` | Weak/missing controls |
| `POST /auto/inspection-deficiency/:id` | PM inspection deficiencies |
| `POST /auto/sif-heca/:id` | SIF/HECA events |
| `POST /auto/sync-project` | Batch open deficiencies + SIF |

---

## Integrations

| Module | Integration |
|--------|-------------|
| **CAIL** | Every CAPA creates/updates `CailEntry` |
| **Site access** | `workerAccessCheck` — blocks critical/overdue CAPA |
| **Inspections** | Verify closes `pm_inspection_deficiency` |
| **Equipment** | Escalation lockout; verify unblocks when no open CAPA |
| **Training** | `training_requirement` action type (manual/training module link) |

---

## Key API endpoints

- `GET /` — list (project, overdue filter)  
- `POST /` — create manual CAPA  
- `POST /:id/assign`, `/delegate`  
- `POST /:id/submit-verification`  
- `POST /:id/verify`  
- `POST /escalations/run?projectId=`  
- `POST /sync` — offline  
- `GET /analytics/project/:id`  

---

## Frontend

- `/pm/corrective-actions` — dashboard, KPIs, escalation run  
- `/pm/corrective-actions/new` — manual CAPA  
- `/pm/corrective-actions/[id]` — verify/reject  

Offline: `pmCapa.sync`
