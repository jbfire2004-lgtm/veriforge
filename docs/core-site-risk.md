# Site Risk (VERA Core)

**Feature name:** `core-site-risk`  
**REST resource:** `/api/v1/core-site-risks`

Structured site hazards and mitigations with optional company, site, and owner user.

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | Required, max 500 |
| `description` | string? | Optional, long text |
| `category` | enum | `STRUCTURAL` \| `ELECTRICAL` \| `ERGONOMIC` \| `ENVIRONMENTAL` \| `OTHER` (default `OTHER`) |
| `severity` | enum | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` (default `MEDIUM`) |
| `status` | enum | `OPEN` \| `IN_PROGRESS` \| `MITIGATED` \| `CLOSED` (default `OPEN`) |
| `identifiedAt` | datetime | Required, ISO-8601 |
| `mitigatedAt` | datetime? | Optional, ISO-8601 |
| `locationNote` | string? | Optional, max 500 |
| `companyId` | int? | FK → `Company` |
| `siteId` | int? | FK → `Site` |
| `ownerUserId` | int? | FK → `User` (relation name `CoreSiteRiskOwner`) |

## 1. Prisma

- **File:** `backend/prisma/schema.prisma`
- **Enums:** `CoreSiteRiskCategory`, `CoreSiteRiskSeverity`, `CoreSiteRiskStatus`
- **Model:** `CoreSiteRisk`
- **Migration:** `backend/prisma/migrations/20260510120000_core_site_risk/migration.sql`

Apply:

```bash
cd backend && npx prisma migrate deploy
npx prisma generate
```

## 2. Backend module

Path: `backend/src/modules/core-site-risk/`

- `core-site-risk.module.ts`
- `core-site-risk.controller.ts`
- `core-site-risk.service.ts`
- `dto/create-core-site-risk.dto.ts`
- `dto/update-core-site-risk.dto.ts`
- `dto/list-core-site-risk.query.dto.ts`
- `entities/core-site-risk.entity.ts`

Registered in `app.module.ts` as `CoreSiteRiskModule`.

Errors use `HttpException` + `HttpStatus`. Data access uses `PrismaService`.

## 3. API

| Method | Path |
|--------|------|
| GET | `/api/v1/core-site-risks` |
| GET | `/api/v1/core-site-risks/:id` |
| POST | `/api/v1/core-site-risks` |
| PATCH | `/api/v1/core-site-risks/:id` |
| DELETE | `/api/v1/core-site-risks/:id` |

List query: `companyId`, `siteId`, `status`, `category`, `severity`, `skip`, `take`.

## 4. Frontend

| File | Role |
|------|------|
| `vera-frontend/src/api/core-site-risk.ts` | REST client (`fetchJson`) |
| `vera-frontend/lib/core-site-risk.ts` | Re-exports API types and functions |
| `vera-frontend/src/hooks/useCoreSiteRisk.ts` | List + refetch |
| `vera-frontend/src/components/core-site-risk/CoreSiteRiskForm.tsx` | RHF + Zod |
| `vera-frontend/src/components/core-site-risk/CoreSiteRiskTable.tsx` | Table UI |
| `vera-frontend/src/components/core-site-risk/core-site-risk.schema.ts` | Zod schema |
| `vera-frontend/src/pages/core-site-risk/list.tsx` | List + filters + delete |
| `vera-frontend/src/pages/core-site-risk/new.tsx` | Create form |

App Router:

- `/core/site-risks` → `app/core/site-risks/page.tsx` (re-exports list page)
- `/core/site-risks/new` → `app/core/site-risks/new/page.tsx`

Configure the frontend API base URL with the same env as other Core modules (see [VERA Core API](./modules/vera-core.md) if present).

## 5. Tests

`backend/src/modules/core-site-risk/__tests__/`

```bash
cd backend && npx jest src/modules/core-site-risk --runInBand
```

## Related

- [Safety Observation](./safety-observation.md)
- [VERA Core API](./modules/vera-core.md)
