# VeriForge Compliance Module

Contractor compliance engine for insurance, WCB, COR, SCSA, and custom artifacts — with hiring-client review, scorecard weighting, expiry automation, and notifications.

## Models

| Model | Purpose |
|-------|---------|
| `ComplianceArtifact` | org_id, type, file_url, expiry_date, status, reviewer_id, uploaded_by |
| `Scorecard` (`org_compliance_scorecards`) | global_score, compliance_score, compliance_breakdown, project_scores |
| `ComplianceNotificationLog` | Idempotent notification send log |

### Types
`insurance` | `wcb` | `cor` | `scsa` | `custom`

### Status
`valid` | `expired` | `pending_review` | `rejected`

## Scorecard weighting (required types)

Per-artifact rules (see [VERIFORGE-SAFETY-SCORECARD.md](./VERIFORGE-SAFETY-SCORECARD.md)):

| Type | Rules |
|------|-------|
| Insurance | valid +10, expiring +5, expired −15 |
| WCB | valid +10, expired −20 |
| COR | valid +15, expired −10 |
| SCSA | active +10, inactive −10 |

Base score 50; result clamped 0–100. Stored in `compliance_score` + `compliance_breakdown`.

Recalculated on upload, review, update, expiry cron, and via `POST /scorecard/recalculate`.

## API (`/compliance`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/compliance/upload` | Org JWT |
| GET | `/compliance/:org_id` | Org (same org) or hiring-client JWT |
| GET | `/compliance/pending` | Hiring-client JWT |
| POST | `/compliance/:id/review` | Hiring-client JWT (approve/reject) |
| POST | `/compliance/:id/update` | Org JWT (re-submits to pending_review) |

## Automation

`startComplianceExpiryJob` (node-cron):

- Hourly + daily: mark past-due artifacts `expired`
- Warn on valid artifacts expiring within 30 days
- Recalculate scorecards
- Write `ComplianceNotificationLog` entries

Wired in API (`index.ts` when crons enabled) and worker process.

## UI

`/compliance` — contractor upload + status + reminders, or hiring-client review panel (based on session). `/verihub/compliance` redirects here.

## Bridges

- Next: `/api/compliance/[...path]`
- Nest tRPC: `compliance` router

Env: `VERIFORGE_SAAS_URL`

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma db seed
```
