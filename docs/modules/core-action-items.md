# VERA Core — Core Action Items

Safety and compliance follow-ups with company scope, priorities, due dates, and CRUD under `/api/v1/core-action-items`.

## Prisma model

Defined in `backend/prisma/schema.prisma` as **`CoreActionItem`** (UUID `id`, `title`, `description`, `status`, `priority`, `dueAt`, `companyId`, `createdById`, timestamps). No migration is required for this module beyond the existing schema.

## Backend layout

```
backend/src/modules/core-action-items/
  core-action-items.module.ts
  core-action-items.controller.ts
  core-action-items.service.ts
  core-action-item.verification.ts
  dto/
    create-core-action-item.dto.ts
    update-core-action-item.dto.ts
    list-core-action-items.query.dto.ts
  entities/
    core-action-item.entity.ts
```

- **DB:** `PrismaService`
- **Validation:** `class-validator` DTOs
- **Errors:** `HttpException` + `HttpStatus` (including `NOT_FOUND`, `BAD_REQUEST`)
- **Verification:** `CoreActionItemVerification` (title required, `dueAt` sanity, overdue OPEN hint on create response)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/core-action-items` | List (`companyId`, `status`, `skip`, `take`) |
| GET | `/api/v1/core-action-items/:id` | Get one (UUID) |
| POST | `/api/v1/core-action-items` | Create |
| PATCH | `/api/v1/core-action-items/:id` | Update |
| DELETE | `/api/v1/core-action-items/:id` | Delete |

## Frontend layout

```
vera-frontend/src/api/core-action-items.ts
vera-frontend/src/hooks/useCoreActionItems.ts
vera-frontend/src/components/core-action-items/
  core-action-item.schema.ts   # Zod
  CoreActionItemForm.tsx
  CoreActionItemsTable.tsx
vera-frontend/src/pages/core-action-items/
  list.tsx
  new.tsx
```

App Router entry points re-export pages:

- `app/core/action-items/page.tsx` → `@/src/pages/core-action-items/list`
- `app/core/action-items/new/page.tsx` → `@/src/pages/core-action-items/new`

## Tests

Jest specs under `backend/src/modules/core-action-items/`:

- `core-action-item.verification.spec.ts`
- `core-action-items.service.spec.ts`
- `core-action-items.controller.spec.ts`

Run: `npx jest src/modules/core-action-items --runInBand` (from `backend/`).

## Related

- [VERA Core API overview](./vera-core.md)
- [VERA Core platform architecture](../architecture/vera-core-platform.md)
