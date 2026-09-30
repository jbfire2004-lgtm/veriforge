# Safety Observation (VERA Core)

**Feature name:** `safety-observation`  
**REST resource:** `/api/v1/safety-observations`

Field-level hazards, near misses, and positive safety notes tied to optional company, site, and reporting user.

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | Required, max 500 |
| `description` | string? | Optional, long text |
| `severity` | enum | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` (default `MEDIUM`) |
| `status` | enum | `OPEN` \| `REVIEWED` \| `CLOSED` (default `OPEN`) |
| `observedAt` | datetime | Required, ISO-8601 |
| `locationNote` | string? | Optional, max 500 |
| `companyId` | int? | FK → `Company` |
| `siteId` | int? | FK → `Site` |
| `reportedByUserId` | int? | FK → `User` |

## 1. Prisma

- **File:** `backend/prisma/schema.prisma`
- **Enums:** `SafetyObservationSeverity`, `SafetyObservationStatus`
- **Model:** `SafetyObservation`
- **Migration:** `backend/prisma/migrations/20260503120000_add_safety_observation/migration.sql`

Apply:

```bash
cd backend && npx prisma migrate deploy
npx prisma generate
```

## 2. Backend module

Path: `backend/src/modules/safety-observation/`

- `safety-observation.module.ts`
- `safety-observation.controller.ts`
- `safety-observation.service.ts`
- `dto/create-safety-observation.dto.ts`
- `dto/update-safety-observation.dto.ts`
- `dto/list-safety-observation.query.dto.ts`
- `entities/safety-observation.entity.ts`

Registered in `app.module.ts` as `SafetyObservationModule`.

Errors use `HttpException` + `HttpStatus`.

## 3. API

| Method | Path |
|--------|------|
| GET | `/api/v1/safety-observations` |
| GET | `/api/v1/safety-observations/:id` |
| POST | `/api/v1/safety-observations` |
| PATCH | `/api/v1/safety-observations/:id` |
| DELETE | `/api/v1/safety-observations/:id` |

List query: `companyId`, `siteId`, `status`, `severity`, `skip`, `take`.

## 4. Frontend

| File | Role |
|------|------|
| `vera-frontend/src/api/safety-observation.ts` | REST client (`fetchJson`) |
| `vera-frontend/src/hooks/useSafetyObservation.ts` | List + refetch |
| `vera-frontend/src/components/safety-observation/SafetyObservationForm.tsx` | RHF + Zod |
| `vera-frontend/src/components/safety-observation/SafetyObservationTable.tsx` | Table UI |
| `vera-frontend/src/components/safety-observation/safety-observation.schema.ts` | Zod schema |

Wire into a route by importing the form/table on an App Router page (e.g. under `app/core/…`).

## 5. Tests

`backend/src/modules/safety-observation/__tests__/`

```bash
cd backend && npx jest src/modules/safety-observation --runInBand
```

## Related

- [VERA Core API](./modules/vera-core.md)
- [Core Action Items](./modules/core-action-items.md)
