# Site contacts (VERA full stack)

**Feature name:** `SiteContact`  
**Fields:** `siteId`, `fullName`, `email?`, `phone?`, `role?`, `isPrimary`, `createdAt`, `updatedAt`

## 1. Prisma

Model: `SiteContact` in `backend/prisma/schema.prisma` (child of `Site`, `onDelete: Cascade`).

```bash
cd backend && npx prisma migrate dev
```

## 2. NestJS controller

`backend/src/modules/site-contacts/site-contacts.controller.ts`  
`@Controller(\`${API_V1_PREFIX}/site-contacts\`)` → base path **`/api/v1/site-contacts`**.

## 3. NestJS service

`site-contacts.service.ts` — pagination, search, **single primary per site** (transaction clears others when `isPrimary: true`).

## 4. DTOs

| DTO | File |
|-----|------|
| `CreateSiteContactDto` | `dto/create-site-contact.dto.ts` |
| `UpdateSiteContactDto` | `dto/update-site-contact.dto.ts` (no `siteId` move) |
| `QuerySiteContactDto` | `dto/query-site-contact.dto.ts` |

## 5. API endpoint definitions

| Method | Path | Query / body |
|--------|------|----------------|
| `GET` | `/api/v1/site-contacts` | `?siteId=&page=&limit=&search=` |
| `GET` | `/api/v1/site-contacts/:id` | — |
| `POST` | `/api/v1/site-contacts` | JSON body |
| `PATCH` | `/api/v1/site-contacts/:id` | partial JSON |
| `DELETE` | `/api/v1/site-contacts/:id` | — |

### Example payloads

**POST**

```json
{
  "siteId": 1,
  "fullName": "Jamie Smith",
  "email": "jamie.smith@example.com",
  "phone": "+1-555-0100",
  "role": "Site safety lead",
  "isPrimary": true
}
```

**Success response (201):** `SiteContactResponseEntity` JSON.

## 6. React API wrapper

`vera-frontend/src/api/site-contacts.ts` — `fetchSiteContacts`, `fetchSiteContact`, `createSiteContact`, `updateSiteContact`, `deleteSiteContact`.

## 7. React hook

`vera-frontend/src/hooks/useSiteContacts.ts` — list, filters, CRUD, loading/error/mutating.

## 8. React form

`vera-frontend/src/components/site-contacts/SiteContactForm.tsx` — React Hook Form + Zod + site dropdown from `GET /api/v1/sites`.

## 9. React table

`vera-frontend/src/components/site-contacts/SiteContactsTable.tsx` — search, paging, primary toggle, delete.

## 10. TypeScript types

`vera-frontend/src/types/site-contact.ts` — DTOs and payloads.

## 11. Tests

| File | Type |
|------|------|
| `backend/src/modules/site-contacts/site-contacts.service.spec.ts` | Unit |
| `backend/src/modules/site-contacts/site-contacts.integration.spec.ts` | Integration (supertest + mocked Prisma) |

```bash
cd backend && npm test -- --testPathPattern=site-contacts
```

## 12. Page & env

- UI route: **`/site-contacts`** → `app/site-contacts/page.tsx`
- `NEXT_PUBLIC_API_URL` must point at the Nest server (e.g. `http://localhost:3001`).

Module registered in `app.module.ts` as **`SiteContactsModule`**.
