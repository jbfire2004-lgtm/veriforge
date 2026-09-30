# VERA Core upload pipeline

End-to-end file upload for Core features: **metadata in PostgreSQL** (`CoreFile`), bytes in **local disk**, **S3 (server-side PutObject)**, or **S3 direct (presigned PUT)**.

## Upload type (`VERA_CORE_UPLOAD_MODE`)

| Mode | Flow | Backend | Best for |
|------|------|---------|----------|
| `local` (default) | Browser → `POST /api/v1/core/uploads` → API writes `./uploads/...` | Multipart, memory storage | Dev, single-node |
| `s3` | Browser → API → `PutObject` to bucket | Multipart | Prod without CORS to S3 |
| `direct` | Browser → `POST .../presign` → `PUT` to S3 URL → `POST .../complete` | Two-step + `HeadObject` verify | Prod, large files, offload bandwidth |

Public config (no secrets): **`GET /api/v1/core/uploads/config`** returns `{ mode, maxBytes, allowedMimeTypes }`.

## Allowed types (default)

If `VERA_CORE_UPLOAD_ALLOWED_MIMES` is unset:

- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Override with a comma-separated list, e.g.:

```bash
VERA_CORE_UPLOAD_ALLOWED_MIMES=application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Validation runs in **three** places:

1. **Multer** `fileFilter` (multipart) — rejects disallowed MIME before buffering beyond limit.
2. **Multer** `limits.fileSize` — rejects oversize early (`MulterExceptionFilter` → 413).
3. **Service** (`assertMimeAllowed` / `assertSizeAllowed`) — same rules for presign body and completed object check.

## Max size

| Layer | Value |
|--------|--------|
| Default limit | **25 MiB** (see `VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES` in `core-upload.constants.ts`) |
| Override | `VERA_CORE_UPLOAD_MAX_BYTES` (integer bytes) |
| Hard cap (presign DTO / sanity) | **250 MiB** (`VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES`) |
| Direct mode post-upload | `HeadObject` size must not exceed configured `maxBytes` |

## Prisma: `CoreFile`

```text
model CoreFile {
  id           Int
  storage      CoreUploadStorage   // LOCAL | S3 | DIRECT_S3
  status       CoreUploadStatus    // PENDING | COMPLETED | FAILED
  bucket       String?
  objectKey    String              @unique
  originalName String
  mimeType     String
  sizeBytes    Int
  publicUrl    String?             // null until direct upload completes
  purpose      String?
  failedReason String?
  createdAt    DateTime
  completedAt  DateTime?
  userId       Int?                // optional linkage
}
```

## REST API (`/api/v1/core/uploads`)

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/config` | Expose `mode`, `maxBytes`, `allowedMimeTypes` to the UI |
| POST | `/` | Multipart field `file` + optional `purpose` (local / s3 only) |
| POST | `/presign` | Body: `filename`, `mimeType`, `sizeBytes`, optional `purpose` (direct only) |
| POST | `/complete` | Body: `{ id }` — verify S3 object, mark `COMPLETED` |
| GET | `/:id` | Fetch metadata by id |

## Backend modules

| File | Role |
|------|------|
| `backend/src/modules/core-upload/core-upload.controller.ts` | Routes, multer interceptor, DTOs |
| `backend/src/modules/core-upload/core-upload.service.ts` | Storage + presign + complete |
| `backend/src/modules/core-upload/core-upload.config.ts` | Env → `getCoreUploadConfig()` |
| `backend/src/modules/core-upload/core-upload.constants.ts` | Default MIME list, default/max bytes |
| `backend/src/modules/core-upload/dto/*.ts` | class-validator DTOs |
| `backend/src/modules/core-upload/validators/*.ts` | Custom MIME/size validators for presign |
| `backend/src/modules/core-upload/filters/multer-exception.filter.ts` | Multer → JSON (413 for size) |

### Environment (summary)

```bash
# Mode: local | s3 | direct
VERA_CORE_UPLOAD_MODE=local

# Optional overrides (defaults in core-upload.constants.ts)
VERA_CORE_UPLOAD_MAX_BYTES=26214400
VERA_CORE_UPLOAD_ALLOWED_MIMES=application/pdf,image/jpeg,image/png

# S3 / direct
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
# Optional public URL prefix / CloudFront
VERA_S3_PUBLIC_BASE_URL=https://cdn.example.com

# Local URLs in links
PUBLIC_API_URL=http://localhost:3001
```

## Frontend

| File | Role |
|------|------|
| `vera-frontend/lib/core-upload.ts` | `fetchCoreUploadConfig`, `uploadCoreFile` (branches on `mode`), XHR **upload progress**, optional **`AbortSignal`** (`signal`) for cancel |
| `vera-frontend/src/api/core-upload.ts` | Re-exports + `isCoreUploadAbortError` |
| `vera-frontend/src/components/core/CoreFileUpload.tsx` | Single file, **progress bar**, staged labels, `CoreAlert` errors/success |
| `vera-frontend/src/components/core/CoreMultiFileUpload.tsx` | **Multi-file**: drag-and-drop, **queue** (FIFO, one active upload), **per-file progress**, **retry**, **cancel** (abort), client-side type/size validation before enqueue |
| `vera-frontend/app/core/upload/page.tsx` | Demo page (single + multi) |

### Progress bar

- **Multipart (local/s3):** `XMLHttpRequest.upload.onprogress` → 0–100% for the single POST.
- **Direct:** weighted progress — presign ~2%, PUT ~8–92% (XHR to S3), complete ~93–100%.

### Error handling

- API errors: `errorFromApiResponse` → user message in `CoreAlert`.
- Client-side: MIME and size checked before upload against `config` from GET `config`.
- Network: `"Network error during upload"` from XHR.

## Apply database

Schema is in `backend/prisma/schema.prisma`; migrate as usual:

```bash
cd backend && npx prisma migrate deploy && npx prisma generate
```

## Related

- [Core upload demo](../vera-frontend/app/core/upload/page.tsx) (App Router)
