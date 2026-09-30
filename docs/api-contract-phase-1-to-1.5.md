# API Contract Matrix: Phase 1 / 1.25 / 1.5

This contract is the frontend/backend integration baseline for Vera Core.

## Phase 1

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/v1/core/uploads/config` | none | `{ mode, maxBytes, allowedMimeTypes[] }` |
| POST | `/api/v1/core/uploads` | multipart `file`, `purpose?` | `CoreFileDto` |
| POST | `/api/v1/core/uploads/presign` | `{ filename, mimeType, sizeBytes, purpose? }` | `{ id, uploadUrl, method, headers, objectKey, expiresInSeconds }` |
| POST | `/api/v1/core/uploads/complete` | `{ id }` | `CoreFileDto` |
| POST | `/api/v1/training-ingestion/upload` | multipart `file`, `companyId`, `metadata?` | `TrainingIngestionRun` |
| GET | `/api/v1/training-ingestion/runs/:id` | path `id` | `TrainingIngestionRun` |
| GET | `/api/v1/core/verification/training/:id` | optional expected* query | `TrainingRecordVerificationResult` |
| POST | `/api/v1/core/verification/training/:id/complete` | none | `{ ok: true }` |

## Phase 1.25

| Method | Path | Request | Response |
|---|---|---|---|
| GET/POST | `/api/v1/core-meeting-records` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/core-meeting-records/:id` | id + patch payload | record / `{id,deleted:true}` |
| GET | `/api/v1/core-meeting-records/summary` | summary filters | summary object |
| GET/POST | `/api/v1/core-daily-logs` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/core-daily-logs/:id` | id + patch payload | record / `{id,deleted:true}` |
| GET | `/api/v1/core-daily-logs/summary` | summary filters | summary object |
| GET/POST | `/api/v1/core-compliance-notes` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/core-compliance-notes/:id` | id + patch payload | record / `{id,deleted:true}` |
| GET/POST | `/api/v1/core-action-items` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/core-action-items/:id` | id + patch payload | record / `{id,deleted:true}` |

## Phase 1.5

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/v1/pm/safety-workflows/definition` | none | workflow definition |
| GET/POST | `/api/v1/pm/safety-workflows` | list query / create payload | list / workflow |
| GET | `/api/v1/pm/safety-workflows/:id` | id | workflow |
| GET | `/api/v1/pm/safety-workflows/:id/state` | id | `{ workflow, availableActions[] }` |
| POST | `/api/v1/pm/safety-workflows/:id/sign-worker` | `{ attestationText }` + actor headers | workflow |
| POST | `/api/v1/pm/safety-workflows/:id/transition` | `{ action, note? }` + actor headers | workflow |
| GET | `/api/v1/pm/safety-workflows/:id/events` | id | event[] |
| GET | `/api/v1/pm/safety-workflows/:id/export/pdf` | id | pdf stub |
| GET/POST | `/api/v1/core-site-risks` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/core-site-risks/:id` | id + patch payload | record / `{id,deleted:true}` |
| GET/POST | `/api/v1/safety-observations` | list query / create payload | paged list / record |
| GET/PATCH/DELETE | `/api/v1/safety-observations/:id` | id + patch payload | record / `{id,deleted:true}` |
| GET/POST/PATCH/DELETE | `/api/v1/sites*` | CRUD payloads | site entities |
| GET/POST/PATCH/DELETE | `/api/v1/site-contacts*` | CRUD payloads | contact entities |

## Auth + Error Contract

- Frontend must send cookie credentials for all authenticated flows.
- PM workflow transitions/signing require actor headers for role-aware actions.
- Validation and server exceptions return Nest filter shape:
  - `{ success:false, statusCode, error, timestamp }`

