# Vera Core: Phase 1 -> 1.25 -> 1.5 Architecture

This document locks the implementation baseline for Vera Core across:

- Phase 1: ingestion, upload, verification
- Phase 1.25: operational records and compliance context
- Phase 1.5: PM safety workflows and advanced CRUD surfaces

## System Layers

- Frontend: Next.js (`app/` routes + client pages in `src/pages/`)
- Backend: NestJS controllers/services + Prisma
- DB: PostgreSQL via Prisma schema + SQL migrations
- Auth/session: NextAuth session + cookie credentials on API calls

## Phase 1 (Core Pipeline)

- Upload:
  - `GET /api/v1/core/uploads/config`
  - `POST /api/v1/core/uploads` (multipart)
  - `POST /api/v1/core/uploads/presign`
  - `POST /api/v1/core/uploads/complete`
- Ingestion:
  - `POST /api/v1/training-ingestion/upload`
  - `GET /api/v1/training-ingestion/runs/:id`
- Verification:
  - `GET /api/v1/core/verification/training/:id`
  - `POST /api/v1/core/verification/training/:id/complete`

## Phase 1.25 (Operational Context)

- Core meeting records: `/api/v1/core-meeting-records/*`
- Core daily logs: `/api/v1/core-daily-logs/*`
- Core compliance notes: `/api/v1/core-compliance-notes/*`
- Core action items: `/api/v1/core-action-items/*`
  - parent linkage invariant: meeting XOR daily-log

## Phase 1.5 (PM Safety + Extended Core)

- PM safety workflows: `/api/v1/pm/safety-workflows/*`
  - state machine + events + worker sign + transition + PDF stub
- Site risks: `/api/v1/core-site-risks/*`
- Safety observations: `/api/v1/safety-observations/*`
- Sites and contacts:
  - `/api/v1/sites/*`
  - `/api/v1/site-contacts/*`

## Required End-to-End Journey

1. Login (`/auth/login`) -> redirect to callback URL when present
2. Dashboard (`/admin`)
3. Upload or ingest (`/core/upload`, `/core/training-ingest`)
4. Verification (`/core/verification`, `/verify/core/training/:id`)
5. Completion handoff (`/pm/safety/assess`)
6. PM safety review/transition (`/pm/safety/:id`)
7. Phase 1.25/1.5 CRUD management screens

## Security/Guard Baseline

- Server-routed pages for core/pm workflow are session-guarded with
  `getServerSession(authOptions)` and redirect to `/auth/login?callbackUrl=<path>`.
- API clients use `credentials: "include"` for session continuity.
- PM transitions/signatures additionally send actor headers:
  - `x-pm-actor-user-id`
  - `x-pm-actor-role`

## DB Invariants

- `CoreActionItem.status` valid values include `CANCELLED`.
- `CoreActionItem` cannot simultaneously link both:
  - `coreMeetingRecordId`
  - `coreDailyLogId`
- Additional phase hardening constraints/indexes live in
  `backend/prisma/migrations/2026051208*` through `2026051209*`.

