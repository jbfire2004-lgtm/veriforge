# Vera Adoption & Usage Tracking — Integration Guide

## Overview

The adoption analytics subsystem tracks company geography, module usage, growth metrics, and user feedback. It lives in the Nest monolith (`backend/src/modules/adoption-analytics`) and admin UI (`vera-frontend/app/admin/adoption`).

## Database

Run migration:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

New tables: `company_analytics`, `analytics_events`, `company_usage_daily`, `feedback_requests`, `feedback_votes`.

`Company` gains optional `city`, `province`, `lat`, `lng` for the adoption map.

## API Endpoints

All admin routes require `ADMIN` or `SUPER_ADMIN` JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/adoption-map` | Companies + analytics for map |
| GET | `/api/v1/admin/growth-stats` | Monthly new companies/workers/projects |
| GET | `/api/v1/admin/module-usage` | Aggregated module usage |
| GET | `/api/v1/admin/feedback` | All feedback (admin) |
| PATCH | `/api/v1/admin/feedback/:id/status` | Update status + internal notes |
| POST | `/api/v1/analytics/event` | Queue analytics event (authenticated) |
| POST | `/api/v1/feedback` | Submit feedback |
| GET | `/api/v1/feedback` | List feedback (scoped by role) |
| POST | `/api/v1/feedback/:id/vote` | Upvote |

Responses are cached in-memory for 60 seconds on read endpoints.

## Event Types

```ts
worker_created | equipment_created | training_uploaded | verification_run
digital_signoff_submitted | incident_created | project_created
jha_created | flha_created | sif_logged | user_login
```

## Automatic Tracking (wired)

- `WorkersService.create` → `worker_created`
- `EquipmentService.create` → `equipment_created`
- `IncidentsService.create` → `incident_created`
- `ProjectsService.create` → `project_created`
- `JhaFlhaService.create` → `jha_created` / `flha_created`
- `AuthService.login` → `user_login`

## Manual / Client Tracking

```ts
await fetch(`${API}/api/v1/analytics/event`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 1,
    event: 'verification_run',
    metadata: { runId: 'abc' },
  }),
});
```

Or inject `AdoptionEventService` in any Nest provider:

```ts
constructor(private readonly adoption: AdoptionEventService) {}

this.adoption.track({ companyId, userId, event: ADOPTION_EVENT_TYPES.VERIFICATION_RUN });
```

## Nightly Cron

`AdoptionAnalyticsScheduler` runs at **3:00 AM** — flushes event queue, rolls up `analytics_events` → `company_usage_daily`, refreshes `company_analytics` and churn scores.

## Churn Risk Score (0–100)

Factors: low module usage (&lt;2 modules), low active users, declined feedback, no events in 14+ days.

## Frontend

- Admin: `/admin/adoption` (map, usage, growth, feedback manager)
- Users: `/feedback` (submit, browse, upvote)

## Company Map Pins

Set `lat` / `lng` on companies via admin company edit or API. Companies without coordinates are listed but omitted from the map layer.
