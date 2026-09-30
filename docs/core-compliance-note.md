# VERA Core — Compliance notes

Structured notes for **regulatory**, **audit**, and **internal** compliance context. Lives alongside other VERA Core modules (action items, meeting records, safety observations).

## Data model (Prisma)

- **`CoreComplianceNote`**: `title`, `body`, `category`, `status`, `priority`, optional `dueAt`, optional `companyId`, `siteId`, `createdByUserId`, timestamps.
- **Enums**: `CoreComplianceNoteCategory`, `CoreComplianceNoteStatus`, `CoreComplianceNotePriority`.
- **Relations**: optional `Company`, `Site`, `User` (author).

Apply schema changes:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## REST API (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/core-compliance-notes` | List (query: `companyId`, `siteId`, `status`, `category`, `skip`, `take`) |
| `GET` | `/core-compliance-notes/:id` | One row |
| `POST` | `/core-compliance-notes` | Create |
| `PATCH` | `/core-compliance-notes/:id` | Update |
| `DELETE` | `/core-compliance-notes/:id` | Delete |

### Example create body

```json
{
  "title": "MSHA citation follow-up",
  "body": "Corrective actions scheduled for line 2.",
  "category": "REGULATORY",
  "status": "ACTIVE",
  "priority": "HIGH",
  "dueAt": "2026-05-15T17:00:00.000Z",
  "companyId": 1,
  "siteId": 2,
  "createdByUserId": 3
}
```

Errors use Nest **`HttpException`**; the global filter returns JSON with an **`error`** field (see `vera-frontend/lib/core/api-error.ts`).

## Frontend

| Area | Path |
|------|------|
| API client | `vera-frontend/src/api/core-compliance-note.ts` |
| Hook | `vera-frontend/src/hooks/useCoreComplianceNote.ts` |
| Form / table | `vera-frontend/src/components/core-compliance-note/` |
| Pages | `vera-frontend/src/pages/core-compliance-note/` |
| App routes | `vera-frontend/app/core/compliance-notes/` |

## Tests

Backend service unit tests:

```bash
cd backend
npx jest src/modules/core-compliance-note/__tests__/core-compliance-note.service.spec.ts
```
