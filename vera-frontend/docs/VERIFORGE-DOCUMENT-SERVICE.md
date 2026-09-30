# VeriForge Document Service — Schema & API Design

**Version:** 1.0.0  
**Scope:** Multi-tenant document system for **VERICore** (safety/SMS) and **VERIPM** (preventive maintenance)  
**Store:** PostgreSQL 15+  
**API style:** REST + JSON  

---

## 1. Design principles

- **Global identity:** Every document has a UUID `document_id` unique across tenants.
- **Tenant isolation:** Every row that holds tenant data includes `company_id`; all queries filter by it.
- **Template-driven content:** `template_id` → JSON Schema; `content_data` must validate against it.
- **Immutability on lock:** Once `locked_at` is set, content/signatures/attachments metadata cannot change (except archive metadata via controlled endpoints).
- **Audit first:** Lifecycle events write to `document_audit_log` (append-only).
- **Context is relational, content is JSON:** Workers/jobs/assets/programs are first-class FKs/arrays for indexing; form payloads stay in `content_data`.

---

## 2. Enums

```sql
CREATE TYPE document_domain AS ENUM ('VERICORE', 'VERIPM');

CREATE TYPE document_status AS ENUM (
  'Draft',
  'InProgress',
  'Completed',
  'RequiresReview',
  'Archived',
  'Cancelled'
);

-- VERICore
-- FLHA, JHA, Incident, Inspection, SafetyPolicy, Procedure,
-- TrainingRecord, CorrectiveAction, Audit

-- VERIPM
-- WorkOrder, PMTask, AssetInspection, FailureReport,
-- VendorServiceReport, WarrantyDocument

CREATE TYPE document_type AS ENUM (
  -- VERICore
  'FLHA',
  'JHA',
  'Incident',
  'Inspection',
  'SafetyPolicy',
  'Procedure',
  'TrainingRecord',
  'CorrectiveAction',
  'Audit',
  -- VERIPM
  'WorkOrder',
  'PMTask',
  'AssetInspection',
  'FailureReport',
  'VendorServiceReport',
  'WarrantyDocument'
);

CREATE TYPE signature_method AS ENUM (
  'Drawn',
  'Typed',
  'Pin',
  'SSO',
  'WetInkScan',
  'System'
);

CREATE TYPE document_audit_event AS ENUM (
  'created',
  'edited',
  'status_changed',
  'signed',
  'completed',
  'locked',
  'unlocked',          -- break-glass only; always audited
  'approved',
  'rejected',
  'archived',
  'cancelled',
  'exported',
  'attachment_added',
  'attachment_removed',
  'retention_applied'
);
```

---

## 3. Relational schema

### 3.1 Tenancy & retention

```sql
CREATE TABLE companies (
  company_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE retention_policies (
  retention_policy_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  name                  TEXT NOT NULL,
  -- ISO-8601 duration or days; keep both for clarity
  retain_for_days       INTEGER NOT NULL CHECK (retain_for_days > 0),
  applies_to_domain     document_domain,          -- NULL = all domains
  applies_to_type       document_type,            -- NULL = all types in domain
  legal_hold_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);
```

### 3.2 Templates (JSON Schema definitions)

Canonical table name: **`document_templates`** (do not use a separate `templates` table).

```sql
CREATE TABLE document_templates (
  template_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID REFERENCES companies(company_id), -- NULL = platform template
  domain                document_domain NOT NULL,
  document_type         document_type NOT NULL,
  name                  TEXT NOT NULL,
  version               INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  -- JSON Schema Draft 2020-12 (column name: schema)
  schema                JSONB NOT NULL,
  ui_schema             JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_content       JSONB NOT NULL DEFAULT '{}'::jsonb,
  label_pack            JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  published_at          TIMESTAMPTZ,
  deprecated_at         TIMESTAMPTZ,
  replaced_by           UUID REFERENCES document_templates(template_id),
  created_by            UUID,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, domain, document_type, name, version)
);
```

> **Note:** Older drafts used `json_schema` / table `templates`. Canonical names are `document_templates.schema` and `ui_schema`.

### 3.3 Core documents

```sql
CREATE TABLE documents (
  document_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity & classification
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  domain                document_domain NOT NULL,
  document_type         document_type NOT NULL,
  status                document_status NOT NULL DEFAULT 'Draft',
  version               INTEGER NOT NULL DEFAULT 1,  -- optimistic / content revision

  -- Template & payload (template_version frozen at create — never update)
  template_id           UUID NOT NULL REFERENCES document_templates(template_id),
  template_version      INTEGER NOT NULL,
  content_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  signatures            JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Worker context
  worker_id             UUID,
  crew_ids              UUID[] NOT NULL DEFAULT '{}',

  -- Job / project context
  job_id                UUID,
  project_id            UUID,
  client_id             UUID,
  location_id           UUID,

  -- Asset context (VERIPM)
  asset_id              UUID,
  asset_group_id        UUID,
  site_id               UUID,

  -- Program context (VERICore)
  policy_id             UUID,
  procedure_id          UUID,
  cor_element_id        UUID,

  -- Compliance
  retention_policy_id   UUID REFERENCES retention_policies(retention_policy_id),
  external_reference    TEXT,                     -- client/regulator ID
  title                 TEXT,
  summary               TEXT,

  -- Lifecycle / immutability
  locked_at             TIMESTAMPTZ,
  locked_by             UUID,                     -- user_id
  completed_at          TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  -- Audit timestamps
  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Domain/type consistency
  CONSTRAINT documents_domain_type_check CHECK (
    (domain = 'VERICORE' AND document_type IN (
      'FLHA','JHA','Incident','Inspection','SafetyPolicy','Procedure',
      'TrainingRecord','CorrectiveAction','Audit'
    ))
    OR
    (domain = 'VERIPM' AND document_type IN (
      'WorkOrder','PMTask','AssetInspection','FailureReport',
      'VendorServiceReport','WarrantyDocument'
    ))
  ),

  -- Locked documents must have locked_by
  CONSTRAINT documents_locked_pair_check CHECK (
    (locked_at IS NULL AND locked_by IS NULL)
    OR (locked_at IS NOT NULL AND locked_by IS NOT NULL)
  )
);

-- Signatures: JSONB on documents for atomic reads + document_signatures for queries.
-- MANDATORY: service layer writes BOTH in one transaction via apply_document_signatures().
-- Do not update documents.signatures without upserting document_signatures rows.

-- signatures JSON shape:
-- [
--   {
--     "signature_id": "uuid",
--     "user_id": "uuid",
--     "role": "Supervisor",
--     "signed_at": "2026-07-10T18:22:00Z",
--     "method": "Drawn",
--     "statement": "I verify this FLHA is accurate"
--   }
-- ]
```

### 3.4 Normalized signatures (queryable)

```sql
CREATE TABLE document_signatures (
  signature_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           UUID NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  user_id               UUID NOT NULL,
  role                  TEXT NOT NULL,
  signed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  method                signature_method NOT NULL,
  statement             TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, user_id, role)
);
```

### 3.5 Attachments

```sql
CREATE TABLE document_attachments (
  attachment_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           UUID NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  file_name             TEXT NOT NULL,
  content_type          TEXT NOT NULL,
  byte_size             BIGINT NOT NULL CHECK (byte_size >= 0),
  storage_provider      TEXT NOT NULL DEFAULT 's3',
  storage_key           TEXT NOT NULL,            -- bucket key / blob path
  checksum_sha256       TEXT,
  uploaded_by           UUID NOT NULL,
  uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ,              -- soft delete
  UNIQUE (document_id, storage_key)
);
```

### 3.6 Audit log (append-only)

```sql
CREATE TABLE document_audit_log (
  audit_id              BIGSERIAL PRIMARY KEY,
  document_id           UUID NOT NULL REFERENCES documents(document_id),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  event                 document_audit_event NOT NULL,
  actor_user_id         UUID,
  from_status           document_status,
  to_status             document_status,
  detail                JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- e.g. { "fields": ["content_data.hazards"], "export_format": "pdf" }
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent updates/deletes via revoke; application role is INSERT-only.
```

### 3.7 Optional: content version history

```sql
CREATE TABLE document_revisions (
  revision_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           UUID NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  version               INTEGER NOT NULL,
  content_data          JSONB NOT NULL,
  signatures            JSONB NOT NULL DEFAULT '[]'::jsonb,
  changed_by            UUID NOT NULL,
  change_summary        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);
```

---

## 4. Indexing strategy

High-volume filters are always scoped by `company_id` first.

```sql
-- Primary operational list queries
CREATE INDEX idx_documents_company_domain_type_status_created
  ON documents (company_id, domain, document_type, status, created_at DESC);

CREATE INDEX idx_documents_company_status_updated
  ON documents (company_id, status, updated_at DESC);

-- Worker
CREATE INDEX idx_documents_company_worker_created
  ON documents (company_id, worker_id, created_at DESC)
  WHERE worker_id IS NOT NULL;

CREATE INDEX idx_documents_company_crew_ids_gin
  ON documents USING GIN (crew_ids);

-- Job / project
CREATE INDEX idx_documents_company_job_created
  ON documents (company_id, job_id, created_at DESC)
  WHERE job_id IS NOT NULL;

CREATE INDEX idx_documents_company_project_created
  ON documents (company_id, project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

-- Asset (VERIPM)
CREATE INDEX idx_documents_company_asset_created
  ON documents (company_id, asset_id, created_at DESC)
  WHERE asset_id IS NOT NULL;

CREATE INDEX idx_documents_company_site_created
  ON documents (company_id, site_id, created_at DESC)
  WHERE site_id IS NOT NULL;

-- Program (VERICore)
CREATE INDEX idx_documents_company_policy
  ON documents (company_id, policy_id)
  WHERE policy_id IS NOT NULL;

CREATE INDEX idx_documents_company_procedure
  ON documents (company_id, procedure_id)
  WHERE procedure_id IS NOT NULL;

-- External / regulator lookup
CREATE INDEX idx_documents_company_external_ref
  ON documents (company_id, external_reference)
  WHERE external_reference IS NOT NULL;

-- JSON content search (optional; enable when needed)
CREATE INDEX idx_documents_content_data_gin
  ON documents USING GIN (content_data jsonb_path_ops);

-- Attachments & audit
CREATE INDEX idx_attachments_document
  ON document_attachments (document_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_attachments_company_uploaded
  ON document_attachments (company_id, uploaded_at DESC);

CREATE INDEX idx_audit_document_occurred
  ON document_audit_log (document_id, occurred_at DESC);

CREATE INDEX idx_audit_company_event_occurred
  ON document_audit_log (company_id, event, occurred_at DESC);

CREATE INDEX idx_signatures_company_user
  ON document_signatures (company_id, user_id, signed_at DESC);
```

**Query guidance**
- Always include `company_id = $1` as the leading predicate.
- Prefer composite indexes above over single-column indexes.
- Date-range lists: filter `created_at` or `completed_at` with status/domain/type in the same plan.

---

## 5. Lifecycle rules

| From | To | Rules |
|---|---|---|
| Draft | InProgress | First meaningful edit or explicit start |
| InProgress | RequiresReview | Optional review gate from template |
| InProgress / RequiresReview | Completed | Required signatures present; set `completed_at`; set `locked_at`/`locked_by` |
| Any non-terminal | Cancelled | Soft cancel; lock document |
| Completed | Archived | Retention-aware; set `archived_at`; remains locked |
| Locked | *content edit* | **Rejected** (409) unless break-glass unlock (audited) |

**Lock policy:** Completing a document always locks it. Archived/Cancelled documents are locked.

---

## 6. REST API

Base path: `/api/v1/documents`  
Auth: Bearer token; `company_id` from tenant context (not client-supplied for writes).  
Idempotency: `Idempotency-Key` header on create/complete.

### Common types

```json
{
  "Document": {
    "document_id": "uuid",
    "company_id": "uuid",
    "domain": "VERICORE | VERIPM",
    "document_type": "FLHA | ...",
    "status": "Draft | InProgress | Completed | RequiresReview | Archived | Cancelled",
    "version": 1,
    "template_id": "uuid",
    "content_data": {},
    "signatures": [
      {
        "signature_id": "uuid",
        "user_id": "uuid",
        "role": "string",
        "signed_at": "ISO-8601",
        "method": "Drawn | Typed | Pin | SSO | WetInkScan | System",
        "statement": "string?"
      }
    ],
    "worker_id": "uuid?",
    "crew_ids": ["uuid"],
    "job_id": "uuid?",
    "project_id": "uuid?",
    "client_id": "uuid?",
    "location_id": "uuid?",
    "asset_id": "uuid?",
    "asset_group_id": "uuid?",
    "site_id": "uuid?",
    "policy_id": "uuid?",
    "procedure_id": "uuid?",
    "cor_element_id": "uuid?",
    "retention_policy_id": "uuid?",
    "external_reference": "string?",
    "title": "string?",
    "locked_at": "ISO-8601?",
    "locked_by": "uuid?",
    "completed_at": "ISO-8601?",
    "archived_at": "ISO-8601?",
    "created_by": "uuid",
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601"
  }
}
```

---

### 6.1 Create document from template

`POST /api/v1/documents`

**Request**
```json
{
  "template_id": "uuid",
  "domain": "VERICORE",
  "document_type": "FLHA",
  "title": "FLHA — Line 4 Morning",
  "content_data": {},
  "worker_id": "uuid",
  "crew_ids": ["uuid"],
  "job_id": "uuid",
  "project_id": "uuid",
  "client_id": "uuid",
  "location_id": "uuid",
  "asset_id": null,
  "asset_group_id": null,
  "site_id": null,
  "policy_id": null,
  "procedure_id": null,
  "cor_element_id": null,
  "retention_policy_id": "uuid?",
  "external_reference": "string?"
}
```

**Behavior**
- Resolve template; verify `domain`/`document_type` match.
- Validate `content_data` against template `json_schema` (empty object allowed if schema permits).
- Default `status = Draft`, `version = 1`.
- Apply company default retention if omitted.
- Write audit `created`.

**Response** `201 Created`
```json
{ "document": { /* Document */ } }
```

**Errors:** `400` validation · `404` template · `409` idempotency replay mismatch

---

### 6.2 Update document content (unlocked only)

`PATCH /api/v1/documents/{document_id}`

**Request**
```json
{
  "expected_version": 1,
  "title": "string?",
  "content_data": {},
  "worker_id": "uuid?",
  "crew_ids": ["uuid"]?,
  "job_id": "uuid?",
  "project_id": "uuid?",
  "client_id": "uuid?",
  "location_id": "uuid?",
  "asset_id": "uuid?",
  "asset_group_id": "uuid?",
  "site_id": "uuid?",
  "policy_id": "uuid?",
  "procedure_id": "uuid?",
  "cor_element_id": "uuid?",
  "external_reference": "string?",
  "status": "InProgress?"
}
```

**Behavior**
- Reject if `locked_at IS NOT NULL` → `409 DocumentLocked`.
- Optimistic concurrency: `expected_version` must match; else `409 VersionConflict`.
- Re-validate `content_data` against template schema.
- Increment `version`; snapshot prior row into `document_revisions`.
- Audit `edited` (and `status_changed` if status updated).
- Allowed status transitions on PATCH: `Draft → InProgress` only (completion uses dedicated endpoint).

**Response** `200 OK`
```json
{ "document": { /* Document */ } }
```

---

### 6.3 Complete document (signatures + status)

`POST /api/v1/documents/{document_id}/complete`

**Request**
```json
{
  "expected_version": 2,
  "signatures": [
    {
      "user_id": "uuid",
      "role": "Supervisor",
      "method": "Drawn",
      "statement": "I verify this assessment is accurate",
      "signed_at": "2026-07-10T18:22:00Z"
    }
  ],
  "require_review": false
}
```

**Behavior**
- Reject if locked → `409`.
- Validate required signature roles from template `ui_schema` / policy.
- Merge signatures into `documents.signatures` and `document_signatures`.
- Set status to `Completed` (or `RequiresReview` if `require_review` / template gate).
- On `Completed`: set `completed_at`, `locked_at`, `locked_by = actor`.
- Audit `signed`, `completed`, `locked` as applicable.

**Response** `200 OK`
```json
{
  "document": { /* Document */ },
  "locked": true
}
```

---

### 6.4 Archive document

`POST /api/v1/documents/{document_id}/archive`

**Request**
```json
{
  "reason": "Retention schedule / project closeout"
}
```

**Behavior**
- Allowed from `Completed` or `RequiresReview` (policy may allow `Cancelled`).
- Set `status = Archived`, `archived_at = now()`.
- Ensure locked; if not locked, lock now.
- Audit `archived` with reason in `detail`.

**Response** `200 OK`
```json
{ "document": { /* Document */ } }
```

---

### 6.5 Query documents

`GET /api/v1/documents`

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `domain` | enum | VERICore / VERIPM |
| `document_type` | enum | single or comma-separated |
| `status` | enum | single or comma-separated |
| `worker_id` | uuid | |
| `crew_id` | uuid | matches `crew_ids` array |
| `job_id` | uuid | |
| `project_id` | uuid | |
| `asset_id` | uuid | |
| `asset_group_id` | uuid | |
| `site_id` | uuid | |
| `policy_id` | uuid | |
| `procedure_id` | uuid | |
| `external_reference` | string | exact |
| `created_from` / `created_to` | ISO-8601 | inclusive range |
| `completed_from` / `completed_to` | ISO-8601 | |
| `q` | string | optional title/external_reference ILIKE |
| `page` | int | default 1 |
| `page_size` | int | default 25, max 100 |
| `sort` | string | `created_at_desc` (default), `updated_at_desc`, `completed_at_desc` |

**Response** `200 OK`
```json
{
  "items": [ /* Document summary fields */ ],
  "page": 1,
  "page_size": 25,
  "total": 1284
}
```

**Summary fields (list):** omit full `content_data` by default; include `document_id`, classification, status, context IDs, title, timestamps, `external_reference`, `version`.

`GET /api/v1/documents/{document_id}` → full document + attachment metadata  
`GET /api/v1/documents/{document_id}?include=content,attachments,audit`

---

### 6.6 Supporting endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/documents/{id}/attachments` | Multipart upload; rejected if locked |
| `DELETE` | `/api/v1/documents/{id}/attachments/{attachment_id}` | Soft-delete; rejected if locked |
| `GET` | `/api/v1/documents/{id}/attachments/{attachment_id}/url` | Signed download URL |
| `GET` | `/api/v1/documents/{id}/audit` | Paginated audit log |
| `POST` | `/api/v1/documents/{id}/export` | PDF/JSON export; audit `exported` |
| `POST` | `/api/v1/documents/{id}/cancel` | → Cancelled + lock |
| `GET` | `/api/v1/document-templates` | List templates by domain/type |
| `GET` | `/api/v1/document-templates/{template_id}` | Schema + ui_schema |

---

## 7. Error envelope

```json
{
  "error": {
    "code": "DocumentLocked | VersionConflict | ValidationFailed | NotFound | Forbidden",
    "message": "Human-readable summary",
    "details": {}
  }
}
```

| HTTP | Code |
|---|---|
| 400 | ValidationFailed (schema / enum) |
| 401 | Unauthorized |
| 403 | Forbidden (tenant / RBAC) |
| 404 | NotFound |
| 409 | DocumentLocked, VersionConflict |
| 422 | SignatureRequirementsUnmet |

---

## 8. Security & multi-tenancy notes

- Derive `company_id` from auth context on every write; ignore client-supplied tenant IDs.
- Enforce RBAC by domain (e.g., SMS roles for VERICore, maintenance roles for VERIPM).
- Attachments: private bucket; only pre-signed URLs; virus scan async.
- `document_audit_log` is insert-only for app roles.
- Break-glass unlock (if ever required) is a separate privileged endpoint that always writes `unlocked` audit with justification—default product path never unlocks completed docs.

---

## 9. Minimal ER overview

```
companies ─┬─ retention_policies
           ├─ document_templates
           └─ documents ─┬─ document_signatures
                         ├─ document_attachments
                         ├─ document_revisions
                         └─ document_audit_log
```

---

## 10. Implementation order

1. Enums + `companies` / `retention_policies` / `document_templates`
2. `documents` + indexes
3. Signatures + attachments
4. Audit log + revisions
5. REST: create → patch → complete → query → archive
6. Export + retention job (archive/legal hold worker)

---

*Document Service Design v1.0.0 — VeriForge · VERICore · VERIPM*
