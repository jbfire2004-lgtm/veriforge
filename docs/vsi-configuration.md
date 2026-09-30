# Vera Safety Intelligence — Configuration

## Photo uploads

Uses Vera Core uploads (`/api/v1/core/uploads`):

| Mode | Behavior |
|------|----------|
| `local` | Multipart to API; files served from `/uploads/...` |
| `s3` | Multipart to API; stored in S3 |
| `direct` | Presigned PUT to S3 (recommended for large files) |

Frontend automatically uses the server `mode` from `GET /api/v1/core/uploads/config`. Files over 5 MiB are intended for `direct` mode when configured.

## AI classification pipeline

`POST /api/v1/pm/safety-intelligence/inspections/ai/classify-photo`

Engines (merged, best available):

1. **Server OCR** — when `coreFileId` is sent, bytes are read from storage and OCR runs server-side
2. **vera-vision** — `@vera/vision` inspection analysis (OCR text + hazard hints)
3. **llm** — optional OpenAI-compatible API with **base64 image** when configured
4. **vase** — `@vera/autonomous-safety` risk scoring

Send `coreFileId` (preferred) or client `ocrText` + `imageUrl`. With `coreFileId`, the API resolves the file from Core uploads and runs the full server-side pipeline.

### Optional LLM (live when configured)

```env
VERA_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
OPENAI_API_KEY=sk-...
VERA_LLM_MODEL=gpt-4o-mini
```

Use a vision-capable model (e.g. `gpt-4o`) for image understanding. If unset, classification falls back to Vision + VASE only.

## CAIL notifications

| Job | Schedule | Behavior |
|-----|----------|----------|
| Overdue | Hourly | Marks past-due open/in_progress CAIL as `overdue`; notifies assignee + company supervisors (`CAIL_OVERDUE`) |
| Due soon | Daily 8:00 | Notifies assignee + supervisors for CAIL due within 3 days (`CAIL_DUE_SOON`) |

Notifications respect user preferences (`assignmentAlerts` toggle) and dedupe keys per day.

## CoreActionItem → CAIL backfill

Migrate legacy safety form actions that still reference `CoreActionItem`:

```http
POST /api/v1/pm/safety-intelligence/admin/backfill-core-actions
Authorization: Bearer <admin token>
Content-Type: application/json

{ "dryRun": true, "limit": 500 }
```

- Requires `ADMIN` or `SUPER_ADMIN`
- Idempotent: skips rows already linked by `(sourceType, formId, actionId)`
- Creates CAIL + `safety_form_cail_link` for each eligible `SafetyFormAction` with `coreActionItemId` and a form `projectId`

Run with `"dryRun": true` first to preview counts, then `"dryRun": false` to apply.

## Project safety roles

Assign per-project RBAC beyond global `UserRole`:

```http
GET  /api/v1/pm/safety-intelligence/project-roles?projectId=42
POST /api/v1/pm/safety-intelligence/project-roles
{ "projectId": 42, "userId": 101, "role": "company_safety_manager" }
```

Roles: `prime_admin`, `company_safety_manager`, `supervisor`, `worker`, `client_readonly`.

Workers only see CAIL assigned to them. `client_readonly` sees high/critical items in summaries.

## Predictive risk

- **Nightly cron (2 AM):** computes `project_safety_risk_snapshot` for active projects (VASE + metrics).
- **Dashboard:** latest snapshot included in `GET /dashboards/project/:id`.
- **Manual refresh:** `POST /dashboards/project/:id/predictive-risk/compute` (PM/Admin).

## CAIL AI analysis

```http
POST /api/v1/pm/safety-intelligence/cail/{id}/ai/analyze
```

Populates `ai_root_cause_suggestions`, `ai_corrective_action_suggestions`, and `ai_classification` on the entry.

## Lesson embedding clusters

- On publish, lessons get a text embedding (`tfidf-sparse` or OpenAI when configured).
- Recluster: `POST /api/v1/pm/safety-intelligence/lessons-learned/recluster?projectId=42`
- Optional OpenAI embeddings:

```env
VERA_EMBEDDING_ENDPOINT=https://api.openai.com/v1/embeddings
VERA_EMBEDDING_MODEL=text-embedding-3-small
```

## Dashboard live refresh

- Domain events (`cail.created`, `cail.verified`, etc.) bump a per-project **revision** counter.
- `GET /dashboards/project/:id/revision` returns `{ revision }`.
- Dashboard API responses include `dashboardRevision`; the UI polls revision every 15s and refetches when it changes.
