# PM Safety workflow (VERA PM)

**REST base:** `/api/v1/pm/safety-workflows`

Unified safety workflows for **Permit to Work**, **JHA / FLHA**, **SIF**, **HECA**, **Energy Wheel** (checklist JSON), and **Inspection**, using the same state machine as the legacy `PERMIT_TO_WORK` and `JOB_SAFETY_ANALYSIS` kinds.

## Workflow kinds (`PmSafetyWorkflowKind`)

| Kind | Notes |
|------|--------|
| `PERMIT_TO_WORK` | Legacy; worker sign-off not required before submit. |
| `JOB_SAFETY_ANALYSIS` | Legacy alias for JSA-style processes; worker sign-off required before submit. |
| `JHA` | Job Hazard Analysis |
| `FLHA` | Field-Level Hazard Analysis |
| `SIF` | Significant Incident / severity focus (workflow fields shared; use title/body to scope). |
| `HECA` | Hazard / exposure controls assessment |
| `ENERGY_WHEEL` | Use `taskStepsJson` for Energy Wheel checklist rows |
| `INSPECTION` | Inspection-driven safety workflow |

Kinds listed as “JHA-class” in code require a **worker signature** (`workerSignedAt`) before the `submit` transition.

## State machine

`DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` | `REJECTED` → `CLOSED` / `CANCELLED`

Edges are defined in `backend/src/pm-safety-workflow/pm-safety-workflow.types.ts` (`PM_SAFETY_TRANSITIONS`).

## RBAC (optional headers)

When `x-pm-actor-user-id` and `x-pm-actor-role` are present (`ADMIN` | `SUPERVISOR` | `WORKER`):

- **`start_review`**, **`approve`**, **`reject`**: require `SUPERVISOR` or `ADMIN`.
- **`POST .../sign-worker`**: always requires these headers; only `WORKER` or `ADMIN` may sign.

If headers are **omitted** on `POST .../transition`, legacy behaviour is preserved (no role checks) for local demos. Production deployments should terminate TLS and enforce JWT → headers or embed the actor in the token on the server.

`approve` / `reject` record `supervisorUserId`, `supervisorApprovedAt`, and optional note as supervisor attestation text.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/definition` | State machine + kind lists + permission hints |
| GET | `/` | List |
| POST | `/` | Create draft |
| GET | `/:id` | Detail |
| GET | `/:id/state` | Workflow + available actions |
| POST | `/:id/sign-worker` | Worker attestation (body: `attestationText`) |
| POST | `/:id/transition` | Transition (`action`, optional `note`) |
| GET | `/:id/events` | Activity / notifications / PDF stub audit |
| GET | `/:id/export/pdf` | PDF JSON stub |

## Frontend

| Path | Description |
|------|-------------|
| `vera-frontend/app/pm/safety/new/page.tsx` | New workflow |
| `vera-frontend/app/pm/safety/[id]/page.tsx` | Review / sign / transition |
| `vera-frontend/src/components/pm/PmSafetyWorkflowForm.tsx` | RHF + Zod create form |
| `vera-frontend/src/components/pm/PmSafetyWorkflowReviewScreen.tsx` | Review UI + actor session |
| `vera-frontend/lib/pm-safety-workflow.ts` | API client + actor headers |

Session keys for actor: `vera_pm_actor_user_id`, `vera_pm_actor_role`.

## Database

Apply migrations after pulling:

```bash
cd backend && npx prisma migrate deploy && npx prisma generate
```
