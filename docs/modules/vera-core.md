# VERA Core — Developer documentation

This document describes the **VERA Core** HTTP APIs used by the frontend’s Core flows: **file uploads**, **training-ingestion**, **training-record verification**, and **PM safety workflows**. Base URLs assume the Nest backend default (`http://localhost:3001`); all routes live under **`/api/v1`**.

---

## Overview

VERA Core provides:

| Area | Purpose |
|------|---------|
| **Core uploads** | Upload arbitrary files with configurable storage (`local`, `S3`, or client-direct via presigned URLs). |
| **Training ingestion** | Upload certification/training evidence (PDF, images, JSON); OCR/metadata parsing creates or updates training records. |
| **Verification** | Structured checks on a training record (expiry, provider, worker identity). |
| **PM safety workflows** | CRUD and state transitions for permit-to-work / JSA–style workflows (stub PDF export included). |

Authentication and authorization depend on how you deploy Nest guards; the public controllers shown here do not add JWT decorators in code paths reviewed for this doc—confirm your environment before exposing externally.

For the **full platform view** (models, jobs, permissions, notifications, audit), see **[VERA Core platform architecture](../architecture/vera-core-platform.md)**.

**Core Action Items** (CRUD follow-ups): see **[core-action-items.md](./core-action-items.md)**.

**Safety observations** (field hazards / near misses): see **[safety-observation.md](../safety-observation.md)**.

---

## Data flow (ASCII)

### Core file upload (multipart → server)

```
 Browser                    API                          Storage
   |                         |                              |
   |-- GET /core/uploads/config --------------------------->|
   |<-- JSON { mode, maxBytes, allowedMimeTypes } ---------|
   |                         |                              |
   |-- POST /core/uploads ---multipart/file--------------->|
   |                         |-- validate mime/size ------->|
   |                         |-- write stream/disk or S3 -->|
   |<-- CoreFile JSON -------|<----------------------------|
```

### Core file upload (direct / presigned)

```
 Browser                    API                          S3 (optional)
   |                         |                              |
   |-- POST /core/uploads/presign { filename, mime... } ->|
   |<-- { uploadUrl, method: PUT, headers, id } -----------|
   |                         |                              |
   |-- PUT uploadUrl (binary) ---------------------------->|
   |                         |                              |
   |-- POST /core/uploads/complete { id } ---------------->|
   |<-- CoreFile JSON -------------------------------------|
```

### Training ingestion

```
 Browser                    API                     Workers / DB
   |                         |                           |
   |-- POST /training-ingestion/upload (file + ---------->|
   |     companyId, metadata?)                             |
   |                         |-- OCR / parse metadata --->|
   |                         |-- persist run + rows ----->|
   |<-- TrainingIngestionRun JSON ------------------------|
   |                         |                           |
   |-- GET /training-ingestion/runs/:id ------------------>|
   |<-- same shape (poll status) -------------------------|
```

### Training record verification

```
 Client                     API                     Prisma / rules
   |                         |                           |
   |-- GET /core/verification/training/:id -------------|
   |     ?expectedWorkerId= (optional)                     |
   |                         |-- load record + checks --->|
   |<-- VerificationResult JSON ----------------------------|
```

### PM safety workflow

```
 Client                     API                     DB
   |                         |                           |
   |-- GET /pm/safety-workflows/definition ------------->|
   |-- POST /pm/safety-workflows { title, ... } -------->|
   |-- GET /pm/safety-workflows/:id/state ---------------->|
   |-- POST /pm/safety-workflows/:id/transition --------->|
   |     { action, note? }                               |
   |<-- workflow + available actions ---------------------|
```

---

## API reference

Global path prefix: **`/api/v1`**.

### Core uploads — `/core/uploads`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/core/uploads/config` | Public limits: `mode`, `maxBytes`, `allowedMimeTypes`. |
| `POST` | `/core/uploads` | Multipart: field **`file`** (required), optional **`purpose`** (string ≤200). |
| `POST` | `/core/uploads/presign` | JSON body for direct upload; returns presigned URL + record `id`. |
| `POST` | `/core/uploads/complete` | JSON `{ "id": number }` after client finished PUT to S3. |
| `GET` | `/core/uploads/:id` | Fetch metadata for uploaded file. |

**Presign body (`POST /core/uploads/presign`):**

- `filename` (string, required)
- `mimeType` (string, required)
- `sizeBytes` (integer, 1 … 250 MiB)
- `purpose` (optional string)

---

### Training ingestion — `/training-ingestion`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/training-ingestion/runs/:id` | Load ingestion run by ID (includes company, OCR text, validation, result summary). |
| `POST` | `/training-ingestion/upload` | Multipart: **`file`** (required), **`companyId`** (required), optional **`metadata`** (JSON string). |

Multipart max size for upload: **30 MiB** (controller limit).

---

### Verification — `/core/verification`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/core/verification/training/:id` | Structured verification for training record `id`. Query: **`expectedWorkerId`** (optional integer) tightens worker-identity check. |

---

### PM safety workflows — `/pm/safety-workflows`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pm/safety-workflows/definition` | Schema / definition payload for UI. |
| `GET` | `/pm/safety-workflows` | List workflows; query `companyId`, `status`. |
| `POST` | `/pm/safety-workflows` | Create; body requires **`title`**; optional `kind`, `companyId`, `siteId`, text fields, `validFrom` / `validTo` (ISO dates). |
| `GET` | `/pm/safety-workflows/:id` | Single workflow. |
| `GET` | `/pm/safety-workflows/:id/state` | Workflow + **available actions** for transitions. |
| `POST` | `/pm/safety-workflows/:id/sign-worker` | Body `{ "attestationText": string }` to record worker signature (requires actor headers). |
| `POST` | `/pm/safety-workflows/:id/transition` | Body `{ "action": "submit" \| "approve" \| …, "note"?: string }`. |
| `GET` | `/pm/safety-workflows/:id/events` | Event log. |
| `GET` | `/pm/safety-workflows/:id/export/pdf` | Stub JSON (not a binary PDF yet). |

---

## Example requests and responses

### `GET /api/v1/core/uploads/config`

**Response `200`:**

```json
{
  "mode": "local",
  "maxBytes": 10485760,
  "allowedMimeTypes": ["application/pdf", "image/png", "image/jpeg"]
}
```

---

### `POST /api/v1/core/uploads` (multipart)

**Form fields:** `file` = binary, optional `purpose` = string.

**Response `201` (illustrative):**

```json
{
  "id": 12,
  "storage": "LOCAL",
  "status": "COMPLETED",
  "objectKey": "core/550e8400-e29b-41d4-a716-446655440000_scan.pdf",
  "originalName": "scan.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 90210,
  "publicUrl": "http://localhost:3001/uploads/core/550e8400-e29b-41d4-a716-446655440000_scan.pdf",
  "purpose": null,
  "createdAt": "2026-05-03T12:00:00.000Z",
  "completedAt": "2026-05-03T12:00:01.000Z"
}
```

---

### `POST /api/v1/training-ingestion/upload` (multipart)

**Form fields:**

- `file` — PDF, image, or JSON.
- `companyId` — integer (required).
- `metadata` — optional JSON string describing rows (required for PDF/images per product rules).

**Response `201` (shape mirrors Prisma + service; illustrative):**

```json
{
  "id": 5,
  "companyId": 1,
  "status": "COMPLETED",
  "sourceMime": "application/pdf",
  "originalFilename": "cert.pdf",
  "sizeBytes": 120000,
  "ocrText": "…extracted text…",
  "metadataSnapshot": { "workerId": 42 },
  "validationErrors": null,
  "resultSummary": {
    "created": 1,
    "recordIds": [101]
  },
  "errorMessage": null,
  "createdAt": "2026-05-03T12:00:00.000Z",
  "completedAt": "2026-05-03T12:00:05.000Z",
  "company": { "id": 1, "name": "Acme Co" }
}
```

---

### `GET /api/v1/core/verification/training/101?expectedWorkerId=42`

**Response `200` (illustrative):**

```json
{
  "trainingRecordId": 101,
  "overallStatus": "VERIFIED",
  "certification": { "id": 3, "name": "First Aid", "code": "FA-1" },
  "worker": { "id": 42, "firstName": "Jane", "lastName": "Doe" },
  "checks": {
    "expiry": {
      "check": "expiry",
      "status": "PASS",
      "issuedAt": "2025-01-01",
      "expiresAt": "2027-01-01",
      "daysUntilExpiry": 245,
      "message": "…"
    },
    "provider": { "check": "provider", "status": "PASS", "message": "…" },
    "workerIdentity": { "check": "workerIdentity", "status": "PASS", "message": "…" }
  },
  "summary": ["…"],
  "verifiedAt": "2026-05-03T12:00:00.000Z"
}
```

---

### `POST /api/v1/pm/safety-workflows`

**Body:**

```json
{
  "title": "Roof work — Building A",
  "kind": "PERMIT_TO_WORK",
  "companyId": 1,
  "siteId": 2
}
```

**Response `201`:** workflow entity (ids, status `DRAFT`, timestamps, etc.).

---

### `POST /api/v1/pm/safety-workflows/7/transition`

**Body:**

```json
{ "action": "submit", "note": "Ready for review" }
```

**Response `200`:** updated workflow.

---

## Error codes and response shape

HTTP status codes follow Nest conventions. Typical cases:

| Status | Meaning |
|--------|---------|
| `400` | Validation error, missing `file`, bad query/body (`BadRequestException`). |
| `404` | Resource not found (`NotFoundException`), e.g. unknown ingestion run or training record. |
| `503` | Dependency unavailable (`ServiceUnavailableException`), e.g. S3 not configured when required. |
| `500` | Unhandled error (generic message). |

The app registers a global **`HttpExceptionFilter`** (`backend/src/common/filters/http-exception.filter.ts`). Error JSON looks like:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "file is required",
  "timestamp": "2026-05-03T12:00:00.000Z"
}
```

For validation failures, **`error`** may be an **object** (Nest’s default validation payload) rather than a plain string—clients should stringify or traverse `message` arrays inside that object when present.

**Frontend note:** Shared helpers in `vera-frontend/lib/core/` (`errorFromApiResponse` in `api-error.ts`) check top-level **`message`** and the global filter’s **`error`** field. For new callers, import from `@/lib/core`.

---

## Frontend usage

Environment: set **`NEXT_PUBLIC_API_URL`** to your API origin (e.g. `http://localhost:3001`).

### Recommended modules

| Module | Path | Role |
|--------|------|------|
| HTTP helpers | `@/lib/core` | `fetchJson`, `errorFromApiResponse`, `unknownToErrorMessage` |
| Core uploads | `@/lib/core-upload` | Config, multipart/XHR/S3 upload helpers |
| Training ingest | `@/lib/training-ingestion-v1` | Upload with progress, fetch run |
| Verification | `@/lib/verification-core` | `fetchTrainingRecordVerification` |
| PM safety | `@/lib/pm-safety-workflow` | Definition, CRUD, transitions, events |

### Example: fetch upload config and upload a file

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  fetchCoreUploadConfig,
  uploadCoreFile,
} from "@/lib/core-upload";
import { unknownToErrorMessage } from "@/lib/core";

export function DemoUpload() {
  const [config, setConfig] = useState<Awaited<
    ReturnType<typeof fetchCoreUploadConfig>
  > | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetchCoreUploadConfig()
      .then(setConfig)
      .catch((e) => setErr(unknownToErrorMessage(e)));
  }, []);

  async function onFile(f: File) {
    if (!config) return;
    try {
      await uploadCoreFile(f, config, {
        purpose: "training-evidence",
        onProgress: (p) => console.log(p),
      });
    } catch (e) {
      setErr(unknownToErrorMessage(e));
    }
  }

  return (
    <div>
      {err && <p role="alert">{err}</p>}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
    </div>
  );
}
```

### Example: training ingestion with metadata

```ts
import {
  uploadTrainingIngestFile,
  fetchTrainingIngestRun,
} from "@/lib/training-ingestion-v1";

const metadata = JSON.stringify({
  workerId: 1,
  certificationCode: "FIRST-AID",
  issuedAt: "2026-01-15",
  expiresAt: "2028-01-15",
});

const run = await uploadTrainingIngestFile(file, companyId, {
  metadata,
  onProgress: (pct) => {},
});

const latest = await fetchTrainingIngestRun(run.id);
```

### Example: verification

```ts
import { fetchTrainingRecordVerification } from "@/lib/verification-core";

const result = await fetchTrainingRecordVerification(101, {
  expectedWorkerId: 42,
});
```

### UI components (reference)

Under `vera-frontend/src/components/core/`:

- **`CoreFileUpload`** — wired to core upload API.
- **`TrainingIngestPipeline`** — upload + run review.
- **`TrainingRecordVerificationView`** — verification demo UI.
- **`CoreAlert`** — consistent banners for errors / warnings / success.

---

## Related docs

- [vera-core-platform.md](../architecture/vera-core-platform.md) — architecture: jobs, permissions, notifications, audit  
- [DEVELOPER.md](../DEVELOPER.md) — repo-wide developer notes  
- [verification-and-trust.md](../architecture/verification-and-trust.md) — trust / verification architecture  
