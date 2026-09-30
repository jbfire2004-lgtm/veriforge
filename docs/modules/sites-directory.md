# Site directory module (VERA)

Full-stack slice: **PostgreSQL → Prisma → Nest `/api/v1/sites` → React directory UI**.

## 1. Prisma

`Site` includes optional `code` (unique), `region`, plus existing relations.

Apply migrations:

```bash
cd backend
npx prisma migrate dev
```

## 2. NestJS

| File | Role |
|------|------|
| `src/modules/sites/sites.module.ts` | Module |
| `src/modules/sites/sites.controller.ts` | REST controller |
| `src/modules/sites/sites.service.ts` | Prisma + HttpException |
| `src/modules/sites/dto/*.dto.ts` | class-validator DTOs |
| `src/modules/sites/entities/site.entity.ts` | Response shapes |

## 3. API endpoints

| Method | Path | Body / query |
|--------|------|----------------|
| GET | `/api/v1/sites` | `?page=&limit=&search=` |
| GET | `/api/v1/sites/:id` | — |
| GET | `/api/v1/sites/:id/verify` | — (verification) |
| POST | `/api/v1/sites` | `{ "name", "code?", "region?", "active?" }` |
| PATCH | `/api/v1/sites/:id` | partial update |
| DELETE | `/api/v1/sites/:id` | — (409 if FK prevents delete) |

### Example payloads

**Create**

```json
{
  "name": "River Crossing Yard",
  "code": "RCY-01",
  "region": "Northern Division",
  "active": true
}
```

**Verify response**

```json
{
  "ok": true,
  "siteId": 1,
  "name": "River Crossing Yard",
  "active": true,
  "code": "RCY-01",
  "region": "Northern Division",
  "verifiedAt": "2026-05-04T12:00:00.000Z"
}
```

## 4–8. Frontend (`vera-frontend`)

| Path | Role |
|------|------|
| `src/api/sites.ts` | Typed fetch wrappers |
| `src/hooks/useSites.ts` | List CRUD + loading/error |
| `src/lib/site.schema.ts` | Zod schemas |
| `src/components/sites/*` | Form, table, verification panel |
| `src/components/ui/*` | Tailwind + ShadCN-style primitives |
| `app/sites/page.tsx` | Page wiring |

Environment: `NEXT_PUBLIC_API_URL=http://localhost:3001`

## 9. Tests

```bash
cd backend
npm test -- --testPathPattern=sites
```

## 10. Related

- Global API routes (`/verify`, `/incidents`, …) are **not** under `/api/v1`; only modules registered as versioned REST use this prefix unless you add a global `setGlobalPrefix`.
