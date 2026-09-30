# Meeting Record (VERA Core)

**Feature name:** `core-meeting-record`  
**REST resource:** `/api/v1/core-meeting-records`

Structured meeting notes and outcomes for team safety, toolbox talks, and management review sessions.

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | Required, max 500 |
| `body` | string? | Optional, long text |
| `meetingType` | enum | `TEAM_SAFETY` \| `TOOLBOX` \| `MANAGEMENT_REVIEW` \| `OTHER` |
| `heldAt` | datetime | Required, ISO-8601 |
| `companyId` | int? | FK → `Company` |
| `siteId` | int? | FK → `Site` |
| `recordedByUserId` | int? | FK → `User` |

## Backend module

Path: `backend/src/modules/core-meeting-record/`

- `core-meeting-record.module.ts`
- `core-meeting-record.controller.ts`
- `core-meeting-record.service.ts`
- `dto/create-core-meeting-record.dto.ts`
- `dto/update-core-meeting-record.dto.ts`
- `dto/summary-core-meeting-record.query.dto.ts`
- `entities/core-meeting-record.entity.ts`

## API

| Method | Path |
|--------|------|
| GET | `/api/v1/core-meeting-records` |
| GET | `/api/v1/core-meeting-records/:id` |
| POST | `/api/v1/core-meeting-records` |
| PATCH | `/api/v1/core-meeting-records/:id` |
| DELETE | `/api/v1/core-meeting-records/:id` |
| GET | `/api/v1/core-meeting-records/summary` |

List query supports: `companyId`, `siteId`, `meetingType`, `skip`, `take`, `sortBy`, `sortOrder`.

Summary query supports: `companyId`, `siteId`, `heldFrom`, `heldTo`.

## Frontend

| File | Role |
|------|------|
| `vera-frontend/src/api/core-meeting-record.ts` | REST client (`fetchJson`) |
| `vera-frontend/src/hooks/useCoreMeetingRecord.ts` | list + refetch state |
| `vera-frontend/src/components/core-meeting-record/CoreMeetingRecordForm.tsx` | create/edit form |
| `vera-frontend/src/components/core-meeting-record/CoreMeetingRecordTable.tsx` | table view |
| `vera-frontend/src/components/core-meeting-record/CoreMeetingRecordSummaryForm.tsx` | summary filters |
| `vera-frontend/src/components/core-meeting-record/CoreMeetingRecordDataTable.tsx` | table utility variant |
| `vera-frontend/lib/core-meeting-record.ts` | re-export barrel |

## Related

- [VERA Core API](./modules/vera-core.md)
