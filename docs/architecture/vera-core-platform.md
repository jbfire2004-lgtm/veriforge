# VERA Core — full platform architecture

This document expands **VERA Core** from a set of HTTP features into an end-to-end architecture: persistence, APIs, services, async processing, UI, access control, notifications, and audit. It is grounded in the current Nest + Prisma codebase and calls out **proposed** additions where the product is not fully wired yet.

**Scope of “VERA Core” in this doc**

- Generic **file uploads** (`CoreFile`, local/S3/direct).
- **Training ingestion** pipeline (`TrainingIngestionRun` → training records).
- **Training record verification** (structured checks on `TrainingRecord`).
- **PM safety workflows** (permits / JSA state machine).
- **Core action items** (follow-ups tied to companies).
- Cross-cutting: **notifications**, **audit**, **permissions**.

---

## 1. Data models

### 1.1 Implemented (Prisma)

| Model | Purpose |
|--------|---------|
| **User** | Auth identity; `role` (`ADMIN` \| `SUPERVISOR` \| `WORKER`); links to `coreFiles`, `auditLogs`, `notifications`. |
| **Company** | Tenant boundary; owns `trainingIngestionRuns`, `pmSafetyWorkflows`, `coreActionItems`. |
| **Worker** | Person record; target of ingested training; `trainingRecords`. |
| **CoreFile** | Upload metadata: `storage` (`LOCAL` \| `S3` \| `DIRECT_S3`), `status`, `objectKey`, `publicUrl`, optional `purpose`, `userId`. |
| **TrainingIngestionRun** | One ingestion attempt: `status`, `sourceMime`, `ocrText`, `metadataSnapshot`, `validationErrors`, `resultSummary`, `errorMessage`, `companyId`. |
| **TrainingRecord** | Canonical training row: `workerId`, `certificationId`, `providerId`, `issuedAt`, `expiresAt`. |
| **Certification** / **Provider** | Lookup dimensions for training and verification. |
| **PmSafetyWorkflow** | Workflow header: `kind`, `title`, `status`, company/site, hazard fields, validity window. |
| **PmSafetyWorkflowEvent** | Append-only audit stream per workflow (`eventType`, `channel`, `payload`). |
| **CoreActionItem** | Follow-up task: UUID `id`, `title`, `status`, `priority`, `dueAt`, `companyId`, `createdById`. |
| **Notification** | User inbox row: `channel`, `type`, `payload` (JSON). |
| **AuditLog** | `action`, `entity`, `entityId`, optional `userId`, `metadata`, timestamp. |

### 1.2 Proposed extensions (recommended)

| Change | Rationale |
|--------|-----------|
| **FK `TrainingIngestionRun.coreFileId` → `CoreFile`** | Trace every ingest run to the stored blob; retention and legal hold. |
| **Enum `TrainingIngestionRunStatus`** | Replace free-form `String status` for clearer job/state machines. |
| **`CoreFile.companyId` (optional)** | Company-scoped listing and RBAC without scanning purposes. |
| **`VerificationSnapshot` (optional table or JSON on `TrainingRecord`) | Store last verification result + `verifiedAt` for fast UI and compliance exports. |
| **`CoreDomainJob` (queue outbox)** | Idempotent rows for BullMQ / worker: `type`, `payload`, `status`, `runAt`, `attempts`. |
| **`PmSafetyWorkflow.assigneeUserId` / `reviewerUserId`** | Explicit ownership for notifications and permissions. |

---

## 2. API endpoints

Base path: **`/api/v1`** (no global prefix beyond this in current Nest bootstrap).

### 2.1 Core uploads — `CoreUploadController`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/core/uploads/config` | Public limits for UI. |
| POST | `/core/uploads` | Multipart `file`, optional `purpose`. |
| POST | `/core/uploads/presign` | Direct client upload handshake. |
| POST | `/core/uploads/complete` | Finalize `DIRECT_S3` row. |
| GET | `/core/uploads/:id` | Metadata fetch. |

**Proposed:** `GET /core/uploads` (paginated, company/user scoped), `DELETE /core/uploads/:id` (soft delete + storage GC).

### 2.2 Training ingestion — `TrainingIngestionV1Controller`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/training-ingestion/runs/:id` | Poll run detail. |
| POST | `/training-ingestion/upload` | Multipart `file`, `companyId`, optional `metadata` JSON string. |

**Proposed:** `GET /training-ingestion/runs` (filters: company, status, date), `POST /training-ingestion/runs/:id/retry` (reprocess).

### 2.3 Verification — `VerificationCoreController`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/core/verification/training/:id` | Query `expectedWorkerId` optional. |

**Proposed:** `GET /core/verification/training/:id/history` if snapshots are persisted.

### 2.4 PM safety — `PmSafetyWorkflowController`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/pm/safety-workflows/definition` | UI schema. |
| GET | `/pm/safety-workflows` | List + filters. |
| POST | `/pm/safety-workflows` | Create. |
| GET | `/pm/safety-workflows/:id` | Detail. |
| GET | `/pm/safety-workflows/:id/state` | State + allowed transitions. |
| POST | `/pm/safety-workflows/:id/transition` | Action + note. |
| GET | `/pm/safety-workflows/:id/events` | Event log. |
| GET | `/pm/safety-workflows/:id/export/pdf` | Stub today. |

### 2.5 Core action items (if exposed)

**Proposed REST** under `/api/v1/core/action-items`: list (company), create, patch status, assignee—mirror `CoreActionItem` and existing frontend form routes.

---

## 3. Services (NestJS modules)

| Module / service | Responsibility |
|------------------|----------------|
| **CoreUploadModule** — `CoreUploadService` | Config, mime/size checks, local disk, S3 presign/complete, multipart persistence. |
| **TrainingIngestionModule** — `TrainingIngestionService` | Run lifecycle, metadata parse, OCR hook, row validation, `TrainingRecord` writes. |
| **TrainingIngestionModule** — `OcrExtractionService` | Extract text from PDF/images (stub or provider). |
| **TrainingIngestionModule** — `TrainingMetadataParserService` | Normalize DTOs from JSON / inferred fields. |
| **VerificationModule** — `VerificationService` | `validateTrainingRecord`, rule engine hooks, structured check DTOs. |
| **PmSafetyWorkflowModule** — `PmSafetyWorkflowService` | CRUD, transition rules, event emission, PDF stub. |
| **AuditModule** — `AuditService` | `log({ action, entity, entityId, userId, metadata })`. |
| **NotificationsModule** — `NotificationsService` | Create in-app (and future email/SMS) rows. |
| **PrismaModule** — `PrismaService` | Shared DB access. |

**Proposed service boundaries**

- **CoreOrchestrationService** — coordinates “upload finished → enqueue ingest → notify”.
- **CorePermissionService** — centralize “can this user act on company X / workflow Y”.

---

## 4. Background jobs

Today, much of training ingestion runs **inline** in the request handler. A full architecture should move heavy work off the hot path.

| Job type | Trigger | Work | Proposed tech |
|----------|---------|------|----------------|
| **ingestion.process_file** | Upload complete or retry | OCR, parse metadata, validate, write `TrainingRecord`s, update run `status` | BullMQ + Redis, or Nest `@nestjs/bull` |
| **ingestion.reconcile_stuck_runs** | Cron every N minutes | Mark stale `PENDING` runs failed or retry | `@nestjs/schedule` |
| **core_file.gc_orphan_direct** | Cron daily | Delete `PENDING` `DIRECT_S3` rows past TTL | Cron |
| **verification.batch_company** | Scheduled or manual | Re-verify records nearing expiry | Queue |
| **pm_safety.transition_reminders** | Cron | Notify approvers of `UNDER_REVIEW` aging | Cron + notifications |
| **pm_safety.export_pdf** | Async request | Real PDF generation | Queue worker |

**Flow (target)**

```
HTTP upload → persist CoreFile + TrainingIngestionRun (PENDING)
           → enqueue ingestion.process_file
Worker     → OCR + parse + DB transaction
           → COMPLETED | FAILED + errorMessage
           → emit domain events → notifications + audit
```

---

## 5. UI components

### 5.1 Existing (`vera-frontend`)

| Area | Component / route |
|------|-------------------|
| Upload demo | `src/components/core/CoreFileUpload.tsx`, `app/core/upload/page.tsx` |
| Training ingest | `src/components/core/TrainingIngestPipeline.tsx`, `app/core/training-ingest/page.tsx` |
| Verification | `src/components/core/TrainingRecordVerificationView.tsx`, `app/core/verification/page.tsx` |
| Alerts | `src/components/core/CoreAlert.tsx` |
| Action items | `src/components/core/CoreActionItemForm.tsx`, `app/core/action-items/new/page.tsx` |
| API clients | `lib/core-upload.ts`, `lib/training-ingestion-v1.ts`, `lib/verification-core.ts`, `lib/pm-safety-workflow.ts`, `lib/core/` (`fetchJson`, `errorFromApiResponse`) |

### 5.2 Proposed

| Component | Purpose |
|-----------|---------|
| **CoreFileTable** | Company-scoped file list, filters, link to ingest run. |
| **TrainingIngestRunTimeline** | Status steps, errors, link to created records. |
| **VerificationBadge** | Compact PASS/WARN/FAIL on worker / record cards (reuse badge atoms). |
| **PmSafetyWorkflowWizard** | Create + transition UX with `definition`-driven steps. |
| **CoreNotificationBell** | Surface `Notification` rows for current user. |
| **CoreAuditFeed** | Read-only stream for admins (`AuditLog` filtered by entity). |

---

## 6. Permissions

Use existing **`User.role`** as the primary coarse gate; add **resource checks** (company/site ownership) for multi-tenant safety.

### 6.1 Suggested matrix

| Capability | ADMIN | SUPERVISOR | WORKER |
|------------|-------|------------|--------|
| View `/core/uploads/config` | ✓ | ✓ | ✓ (or restrict if abuse) |
| Upload core file for company | ✓ | ✓ (same company) | Proposed: ✓ self / assigned only |
| List all core files | ✓ | company-scoped | own only |
| Start training ingestion | ✓ | company-scoped | deny or “self-upload only” |
| View any ingestion run | ✓ | company-scoped | deny |
| Run training verification API | ✓ | company-scoped | optional read-only self |
| Create / transition PM workflow | ✓ | company/site scoped | deny or read-only |
| Create core action item | ✓ | company-scoped | deny |
| View audit / all notifications | ✓ | limited | own notifications only |

### 6.2 Implementation pattern (proposed)

- **JWT + `RolesGuard`** on controllers (already used elsewhere in repo).
- **`CompanyScopeGuard`** — inject `companyId` from route/body and compare to `user.worker.companyId` or admin bypass.
- **Row-level**: for `PmSafetyWorkflow`, ensure `companyId` / `siteId` matches supervisor’s assignments.

---

## 7. Notifications

Leverage **`Notification`** (`userId`, `channel`, `type`, `payload`).

| Event | Suggested `type` | Recipients | `payload` sketch |
|-------|------------------|------------|------------------|
| Ingestion completed | `training_ingestion.completed` | Uploader + company admins | `{ runId, recordIds, companyId }` |
| Ingestion failed | `training_ingestion.failed` | Same | `{ runId, errorMessage }` |
| Training expiring | `training.expiry_warning` | Worker + supervisor | `{ trainingRecordId, daysLeft }` |
| Verification ATTENTION/FAIL | `training.verification_attention` | Supervisor | `{ trainingRecordId, overallStatus }` |
| PM workflow submitted | `pm_safety.submitted` | Reviewers | `{ workflowId, title }` |
| PM workflow approved/rejected | `pm_safety.decision` | Submitter | `{ workflowId, status, note? }` |
| Core action item due | `core_action.due_soon` | Assignee | `{ actionItemId, dueAt }` |

**Channels:** start with `in_app`; extend `notifications` module with email/SMS adapters already stubbed under `backend/src/notifications/channels/`.

---

## 8. Audit logging

Use **`AuditService.log`** with consistent **`action`** and **`entity`** strings so `findForEntity` stays useful.

### 8.1 Recommended conventions

| `entity` | Example `action` values |
|----------|-------------------------|
| `CoreFile` | `core_file.uploaded`, `core_file.presign_created`, `core_file.completed`, `core_file.deleted` |
| `TrainingIngestionRun` | `training_ingestion.started`, `training_ingestion.completed`, `training_ingestion.failed` |
| `TrainingRecord` | `training_record.created_via_ingest`, `training_record.updated` |
| `TrainingRecordVerification` | `verification.run` (metadata: overall status, record id) |
| `PmSafetyWorkflow` | `pm_safety.created`, `pm_safety.transition`, `pm_safety.export_pdf` |
| `CoreActionItem` | `core_action.created`, `core_action.status_changed` |

**Metadata** should include non-PII identifiers (`id`s), `companyId`, correlation id (e.g. `runId`), and redacted filenames if policy requires.

### 8.2 Wiring (proposed)

- **Interceptor** on `/api/v1/core/*` and `/api/v1/training-ingestion/*` for automatic “request audit” (optional, noisy).
- Prefer **explicit** `auditService.log` in services at business milestones (upload complete, ingest done, transition).

---

## 9. Diagram — logical architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERA Frontend (Next.js)                   │
│  CoreFileUpload │ IngestPipeline │ VerificationView │ PM pages  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS /api/v1
┌────────────────────────────▼────────────────────────────────────┐
│                     NestJS — VERA Core APIs                      │
│  Controllers → Services → Prisma                                 │
│  AuditService │ NotificationsService (on milestones)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌──────────┐        ┌──────────┐        ┌─────────────┐
   │ Postgres │        │ S3/local │        │ Job queue   │
   │ (Prisma) │        │ storage  │        │ (proposed)  │
   └──────────┘        └──────────┘        └─────────────┘
```

---

## 10. Related documentation

- [VERA Core API (HTTP reference)](../modules/vera-core.md)
- [Verification and trust](./verification-and-trust.md)
- [Developer guide](../DEVELOPER.md)
