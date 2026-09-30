# VeriForge Cron Jobs

Background jobs run in `services/veriforge-saas-service` via **node-cron**.

## Process

| Mode | How |
|------|-----|
| Production worker | `npm run start:worker` → `src/worker.ts` → `startAllCronJobs()` |
| API attach (dev / `RUN_CRON_IN_API=true`) | `src/index.ts` also starts the scheduler |

## Jobs

| Script | Schedule (UTC) | Service |
|--------|----------------|---------|
| `jobs/complianceExpiryCheck.ts` | `0 2 * * *` (daily 2 AM) | `complianceService.checkExpiries()` — expire artifacts, queue notifications, recalc scorecards |
| `jobs/scorecardRecalculation.ts` | `0 * * * *` (hourly) | `complianceScorecardService.recalculateAll()` — `compliance_score` + `global_score` → `Scorecard` |
| `jobs/notificationDispatcher.ts` | `*/5 * * * *` | `notificationDispatchService.dispatchQueued()` — email + in-app; mark `sent` |
| `jobs/billingCycleCheck.ts` | `0 3 * * *` (daily 3 AM) | `billingCycleService.checkBillingCycles()` — overdue → suspend modules; paid → restore |
| `jobs/moduleUsageTracker.ts` | `0 * * * *` (hourly) | `moduleUsageTrackerService.trackHourlyUsage()` → `module_usage_metrics` |
| `jobs/trial-workflow.job.ts` | `15 9 * * *` (+ hourly expiry) | Trial expire + notifications |

Scheduler entry: `jobs/scheduler.ts`.

## Data

- **Notification** queue (`notifications`) — `queued` → `sent` / `failed`
- **ModuleUsageMetric** (`module_usage_metrics`) — hourly per-org / per-module snapshots

Migration: `prisma/migrations/20260826080000_cron_notifications_usage`

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

## Manual triggers (scaffold)

tRPC `cron.*` procedures in `backend/src/server/api/routers/cron.ts` document the jobs for operators; execution remains on the SaaS worker.
