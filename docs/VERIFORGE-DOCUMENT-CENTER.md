# Document Center

Versioned contractor documents with upload / replace / expire / exempt workflows, file storage (local | S3 | Supabase), expiry alerts, and Contractor Directory compliance scoring.

**Prerequisite:** Contractor Directory profile (`ContractorProfile`) must exist for the org.

---

## File structure

```
services/veriforge-saas-service/
  prisma/schema.prisma
    # DocumentCenterDocument, DocumentVersion, DocumentCategory, DocumentCenterStatus
  prisma/migrations/20260826110000_document_center/
  src/document-center/category-rules.ts       # insurance, safety_program, license, training
  src/services/document-storage.service.ts   # local | s3 | supabase
  src/services/document-center.service.ts    # workflows + sync + expiry cron logic
  src/routes/documents.routes.ts             # mounted at /documents
  src/jobs/documentCenterExpiry.ts           # daily 02:15 UTC

vera-frontend/
  app/api/documents/…                        # Next → SaaS proxy
  lib/document-center-api.ts
  src/components/document-center/
    DocumentList.tsx
    UploadDocumentModal.tsx
    ExemptionModal.tsx
    VersionViewer.tsx
    DocumentStatusBadge.tsx
  app/verihub/documents/page.tsx             # VeriHub Document Center
  app/verihub/directory/page.tsx             # embeds DocumentList
  app/client/directory/[id]/page.tsx        # read-only DocumentList
```

---

## Schema

| Field | Column / model |
|-------|----------------|
| `document_id` | `DocumentCenterDocument.id` |
| `contractor_id` | `contractorId` (= org id / directory profile) |
| `category` | `insurance \| safety_program \| license \| training` |
| `expiry_date` | `expiryDate` |
| `status` | `valid \| expiring \| expired \| pending_review \| rejected \| exempt \| missing` |
| `exemption_flag` | `exemptionFlag` (+ reason / expiresAt) |
| `version_history[]` | `DocumentVersion[]` |

---

## Category rules

Defined in `category-rules.ts`:

| Category | Required | Warning days | Typical use |
|----------|----------|--------------|-------------|
| `insurance` | yes | 30 | COI / liability / WCB |
| `safety_program` | yes | 60 | HSE manuals, COR |
| `license` | yes | 45 | Trade / business licenses |
| `training` | no | 30 | Certificates |

MIME allow-lists and max sizes are enforced on upload/replace.

---

## Storage

Set `DOCUMENT_STORAGE_PROVIDER`:

| Value | Behavior |
|-------|----------|
| `local` (default) | Writes under `DOCUMENT_STORAGE_LOCAL_PATH` (or `uploads/documents`) |
| `s3` | PUT via `DOCUMENT_S3_PUT_URL` (key substituted), or local mirror + log if unset |
| `supabase` | Uploads to Supabase Storage (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) |

Clients may also pass an already-hosted `fileUrl` and skip binary upload.

---

## API (SaaS Express — `/documents`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/documents/rules` | Org or Hiring Client |
| GET | `/documents/dashboard/:contractorId` | Org (own) or Hiring Client |
| GET | `/documents/:contractorId` | list (+ filters) |
| GET | `/documents/:contractorId/:documentId` | detail + versions |
| POST | `/documents/:contractorId/upload` | Contractor (`org.profile.update`) |
| POST | `/documents/:contractorId/:documentId/replace` | Contractor |
| POST | `/documents/:contractorId/:documentId/expire` | Contractor |
| POST | `/documents/:contractorId/:documentId/exempt` | Contractor `{ reason, exemptionExpiresAt? }` |
| POST | `/documents/:contractorId/:documentId/clear-exemption` | Contractor |

Upload body: `{ category, title, expiryDate?, fileUrl? \| contentBase64?, fileName?, mimeType?, changeNote? }`

Next.js proxies: `/api/documents/*` → SaaS `/documents/*`.

---

## Workflows

1. **Upload** — store file → create doc + v1 → sync `ContractorDocument` → recalculate directory compliance
2. **Replace** — new version, bump `currentVersion`, clear exemption, re-derive status from expiry
3. **Expire** — force `status=expired` (blocked while exempt)
4. **Exempt** — `exemptionFlag=true`, `status=exempt` (counts as satisfied for scoring)
5. **Cron** (`documentCenterExpiry`) — mark expiring/expired, clear lapsed exemptions, create `compliance_expiry` notifications, recalculate scores

Dashboard indicators: expired / expiring counts + missing required categories.

---

## Directory & scoring integration

- Each Document Center write mirrors into `ContractorDocument` with `meta.documentCenterId`.
- `recalculateCompliance` prefers Document Center rows when present (docs 40% / audits 40% / insurance 20%).
- Insurance status derives from Document Center `insurance` category when available.

---

## Integration steps

1. **Migrate**
   ```bash
   cd services/veriforge-saas-service
   npx prisma migrate deploy
   npx prisma generate
   ```
2. **Env** — copy Document Center vars from `infra/veriforge/.env.example` (see also `docs/VERIFORGE-ENV-VARIABLES.md`).
3. **Create directory profile** (VeriHub → Directory) if missing.
4. **Open** VeriHub → **Documents** (`/verihub/documents`) or Directory page embed.
5. **Worker / API cron** — ensure `startAllCronJobs()` runs (API with `RUN_CRON_IN_API` or dedicated worker) so expiry alerts fire.
6. **Production storage** — set `DOCUMENT_STORAGE_PROVIDER=supabase` or `s3` and related credentials; prefer `fileUrl` uploads from a pre-signed client upload for large files.

---

## UI (Vera nav)

- Module feature: VeriHub → **Documents** (`vera-nav-config.ts`)
- Shell: `VeriHubConsoleShell` (global header + module bar)
- Components: list, upload modal, exemption modal, version viewer, dashboard indicators
