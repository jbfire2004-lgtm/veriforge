# VERA API contract (frontend ↔ Nest backend)

**Base URL:** `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). The Nest app listens on port **3001** (`backend/src/main.ts`). The Next.js app is **not** the API; do not call `localhost:3000` for REST unless you intentionally proxy through Next.

**Errors:** Global `ValidationPipe` uses `whitelist: true` and `forbidNonWhitelisted: true`. Unknown JSON fields on DTOs return **400** with validation details. Missing entities return **404** via `NotFoundException`. Auth failures return **401**.

**Versioning:** Resource APIs under `api/v1/...` use the `API_V1_PREFIX` constant (`backend/src/config/routes.ts`). Legacy unversioned routes remain at the root (e.g. `workers`, `verify`).

---

## Canonical routes (summary)

| Area | Method | Path | Notes |
|------|--------|------|--------|
| Auth | POST | `/auth/login` | Body: `{ email, password }`. Returns `{ accessToken, user }`. |
| Admin (Nest) | POST | `/admin/login` | Separate **Admin** prisma model; not the same as `/auth/login`. |
| Admin metrics | GET | `/admin/dashboard` | Shape: `{ totals: { workers, equipment, ... } }`. |
| Workers | GET | `/workers` | |
| Workers | GET | `/workers/company/:companyId` | Workers for a company. |
| Workers | CRUD | `/workers`, `/workers/:id` | |
| Equipment | GET | `/equipment/company/:companyId` | |
| Equipment | GET | `/equipment`, `/equipment/:id` | List includes `safetyStatus` (**not** `isSafe`). `OK` = safe. |
| Training records (CRUD) | * | `/training-records` | |
| Training records | GET | `/training-records/worker/:workerId` | |
| Training (aggregate) | GET | `/training` | All records + `isValid` for dashboards. |
| Training | GET | `/training/worker/:id` | Records for worker (same data as above, scoped). |
| Certifications | GET | `/certifications` | |
| Incidents | GET | `/incidents` | Query: `companyId`, `siteId`, `workerId`, `equipmentId`, `status`, `severity`. |
| Incidents | * | `/incidents/:id` | **Plural** path — not `/incident`. |
| Equipment assignments | POST | `/equipment-assignments` | Body: `CreateEquipmentAssignmentDto` (`workerId`, `equipmentId?`, …). **No `notes` field.** |
| Equipment assignments | GET | `/equipment-assignments/worker/:workerId` | |
| Equipment assignments | GET | `/equipment-assignments/equipment/:equipmentId` | |
| Equipment assignments | PATCH | `/equipment-assignments/:id/return` | Ends assignment (`endedAt`); no body required. |
| Equipment training reqs | GET | `/equipment-training-requirements/equipment/:equipmentId` | |
| Equipment training reqs | POST | `/equipment-training-requirements` | Body: `{ equipmentId, certificationId }`. |
| Equipment training reqs | DELETE | `/equipment-training-requirements/:id` | |
| Verify (public card) | GET | `/verify/worker/:id`, `/verify/worker/:id/full`, … | |
| VERA Core verification | GET | `/api/v1/core/verification/training/:id` | Query: `expectedWorkerId`, `expectedTrainingType`, `expectedCertificateNumber`, `expectedProvider`. |
| Legacy verify training checks | GET | `/verify/core/training-record/:id` | Same query params; older path. |
| Supervisor UI feed | GET | `/verification/logs/recent` | Maps **DigitalSignoff** rows to `{ result: SAFE\|UNSAFE, worker, equipment, createdAt }`. |
| Supervisor UI feed | GET | `/verification/logs/worker/:workerId` | |
| Supervisor UI feed | GET | `/verification/logs/equipment/:equipmentId` | |
| Supervisor dashboard | GET | `/supervisor/dashboard` | `{ totalWorkers, totalEquipment, safeChecks, unsafeChecks }`. |
| Supervisor stations | GET | `/supervisor/stations` | Lists **SafetyStation** rows. |
| Supervisor (scoped) | GET | `/supervisor/:id/overview` | `:id` is **worker** id context in current service. |
| QR scan | POST | `/qr/scan` | Body: `{ qr: string }`. **Not** `/verification/scan`. |
| Training ingestion (v1) | POST | `/api/v1/training-ingestion/upload` | Multipart. |
| PM safety worker signature | POST | `/api/v1/pm/safety-workflows/:id/sign-worker` | Body `{ attestationText }`; requires `x-pm-actor-user-id` and `x-pm-actor-role` headers. |
| Training ingestion (legacy) | POST | `/training-ingestion/csv`, `/training-ingestion/rows` | JSON body. |
| Documents | POST | `/documents/upload` | Multipart `file` + fields. |
| Documents | GET | `/documents/worker/:id`, `/documents/company/:id`, `/documents/equipment/:id` | |

---

## Frontend ↔ backend naming (do **not** invent these paths)

| Wrong (historical / broken) | Correct |
|----------------------------|---------|
| `GET /equipment/assignments/:equipmentId` | `GET /equipment-assignments/equipment/:equipmentId` |
| `POST /equipment/unassign` | `PATCH /equipment-assignments/:id/return` (end active row; no `notes` on DTO — store elsewhere if needed) |
| `GET /equipment/requirements/:id` | `GET /equipment-training-requirements/equipment/:equipmentId` |
| `POST /equipment/requirements/add` | `POST /equipment-training-requirements` body `{ equipmentId, certificationId }` |

---

## Error envelope (Nest `HttpExceptionFilter`)

Successful JSON responses vary by route. Failures use:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "<canonical string or structured object from toCanonicalApiError>",
  "timestamp": "2026-05-10T12:00:00.000Z"
}
```

Typical `statusCode` values: **400** validation / bad input, **401** missing/invalid JWT (non-`@Public` routes), **404** `NotFoundException`, **413** oversized upload (multer), **503** upstream (e.g. S3 presign).

---

## Legacy compatibility routes

These routes are maintained for older frontend screens and now map to canonical services:

| Legacy path | Method | Canonical behavior |
|------|--------|--------|
| `/incident` | GET | Alias to `/incidents` list with the same query filters. |
| `/incident/company/:companyId` | GET | Alias to `/incidents?companyId=...`. |
| `/incident/worker/:workerId` | GET | Alias to `/incidents?workerId=...`. |
| `/incident/equipment/:equipmentId` | GET | Alias to `/incidents?equipmentId=...`. |
| `/incidents/analytics` | GET | Returns aggregate counts and matching rows (legacy analytics format). |
| `/verification/combined-status` | GET | Alias to combined verification result for `worker` + `equipment` query params. |
| `/gate/logs` | GET | Digital signoff log stream for gate/supervisor pages. |
| `/logging/stats` | GET | Lightweight counters (`signoffs`, `incidents`, `workers`, `equipment`). |
| `/cache/workers` | GET | Worker cache feed for station clients. |
| `/cache/equipment` | GET | Equipment cache feed for station clients. |
| `/cache/training` | GET | Training record cache feed for station clients. |
| `/cache/requirements` | GET | Equipment training requirement cache feed. |
| `/safety-station/list` | GET | Alias to station list. |
| `/safety-station/monitor` | GET | Station monitor feed with derived `online` state. |
| `/safety-station/:id/config` | PATCH | Alias to station update config. |
| `/safety-station/:id/action/:action` | POST | Legacy action endpoint (ack envelope). |

---

## Response shape mismatches (resolved on backend)

- **Equipment “safe” flag:** Use `safetyStatus === 'OK'` (enum). Frontend `isSafe` was legacy.
- **Training record detail:** `GET /training-records/:id` now includes `company` (from worker) and `isValid` when applicable.
- **Admin training list:** Use `GET /training-records` or `GET /training` (with `isValid`), not `/admin/training`.

---

## Paths that still have no backend implementation

These appear in older frontend pages and still require follow-up: `/map/*` and map live WebSocket support. Legacy REST paths for gate/logging/cache/safety-station/combined-status now have compatibility handlers.
