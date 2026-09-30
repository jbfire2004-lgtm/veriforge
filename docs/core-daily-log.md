# Daily Log (VERA Core)

**Feature name:** `core-daily-log`  
**REST resource:** `/api/v1/core-daily-logs`

Day-to-day operational logging for site and company context, with optional shift metadata and reporting summary.

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | Required, max 500 |
| `body` | string? | Optional, long text |
| `logDate` | datetime | Required, ISO-8601 |
| `shift` | enum | `DAY` \| `NIGHT` \| `OTHER` (default `DAY`) |
| `companyId` | int? | FK → `Company` |
| `siteId` | int? | FK → `Site` |
| `createdByUserId` | int? | FK → `User` |

## Backend module

Path: `backend/src/modules/core-daily-log/`

- `core-daily-log.module.ts`
- `core-daily-log.controller.ts`
- `core-daily-log.service.ts`
- `dto/create-core-daily-log.dto.ts`
- `dto/update-core-daily-log.dto.ts`
- `dto/list-core-daily-log.query.dto.ts`
- `dto/summary-core-daily-log.query.dto.ts`
- `entities/core-daily-log.entity.ts`

## API

| Method | Path |
|--------|------|
| GET | `/api/v1/core-daily-logs` |
| GET | `/api/v1/core-daily-logs/:id` |
| POST | `/api/v1/core-daily-logs` |
| PATCH | `/api/v1/core-daily-logs/:id` |
| DELETE | `/api/v1/core-daily-logs/:id` |
| GET | `/api/v1/core-daily-logs/summary` |

List query supports: `companyId`, `siteId`, `shift`, `skip`, `take`, `sortBy`, `sortOrder`.

Summary query supports: `companyId`, `siteId`, `logDateFrom`, `logDateTo`.

## Frontend

| File | Role |
|------|------|
| `vera-frontend/src/api/core-daily-log.ts` | REST client (`fetchJson`) |
| `vera-frontend/src/hooks/useCoreDailyLog.ts` | list + refetch state |
| `vera-frontend/src/components/core-daily-log/CoreDailyLogForm.tsx` | create/edit form |
| `vera-frontend/src/components/core-daily-log/CoreDailyLogTable.tsx` | table view |
| `vera-frontend/src/components/core-daily-log/CoreDailyLogSummaryForm.tsx` | summary filters |
| `vera-frontend/src/components/core-daily-log/CoreDailyLogDataTable.tsx` | table utility variant |
| `vera-frontend/lib/core-daily-log.ts` | re-export barrel |

## Related

- [VERA Core API](./modules/vera-core.md)
