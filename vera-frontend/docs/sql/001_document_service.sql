-- VeriForge Document Service — canonical DDL
-- Source: docs/VERIFORGE-DOCUMENT-SERVICE.md (reconciled with Form Template Engine)
-- Version: 1.0.0
-- Apply against PostgreSQL 15+ with pgcrypto / gen_random_uuid()

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Enums ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE document_domain AS ENUM ('VERICORE', 'VERIPM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM (
    'Draft',
    'InProgress',
    'Completed',
    'RequiresReview',
    'Archived',
    'Cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'FLHA',
    'JHA',
    'Incident',
    'Inspection',
    'SafetyPolicy',
    'Procedure',
    'TrainingRecord',
    'CorrectiveAction',
    'Audit',
    'WorkOrder',
    'PMTask',
    'AssetInspection',
    'FailureReport',
    'VendorServiceReport',
    'WarrantyDocument'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE signature_method AS ENUM (
    'Drawn',
    'Typed',
    'Pin',
    'SSO',
    'WetInkScan',
    'System'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_audit_event AS ENUM (
    'created',
    'edited',
    'status_changed',
    'signed',
    'completed',
    'locked',
    'unlocked',
    'approved',
    'rejected',
    'archived',
    'cancelled',
    'exported',
    'attachment_added',
    'attachment_removed',
    'retention_applied'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Tenancy (stub if platform already has companies) ───────────────────────

CREATE TABLE IF NOT EXISTS companies (
  company_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_policies (
  retention_policy_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  name                  TEXT NOT NULL,
  retain_for_days       INTEGER NOT NULL CHECK (retain_for_days > 0),
  applies_to_domain     document_domain,
  applies_to_type       document_type,
  legal_hold_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

-- ── Templates ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_templates (
  template_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID REFERENCES companies(company_id),
  domain                document_domain NOT NULL,
  document_type         document_type NOT NULL,
  name                  TEXT NOT NULL,
  version               INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
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

CREATE INDEX IF NOT EXISTS idx_document_templates_lookup
  ON document_templates (company_id, domain, document_type, is_active);

CREATE INDEX IF NOT EXISTS idx_document_templates_schema_gin
  ON document_templates USING GIN (schema jsonb_path_ops);

-- ── Documents ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  document_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  domain                document_domain NOT NULL,
  document_type         document_type NOT NULL,
  status                document_status NOT NULL DEFAULT 'Draft',
  version               INTEGER NOT NULL DEFAULT 1,

  template_id           UUID NOT NULL REFERENCES document_templates(template_id),
  template_version      INTEGER NOT NULL,
  content_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  signatures            JSONB NOT NULL DEFAULT '[]'::jsonb,

  worker_id             UUID,
  crew_ids              UUID[] NOT NULL DEFAULT '{}',

  job_id                UUID,
  project_id            UUID,
  client_id             UUID,
  location_id           UUID,

  asset_id              UUID,
  asset_group_id        UUID,
  site_id               UUID,

  policy_id             UUID,
  procedure_id          UUID,
  cor_element_id        UUID,

  retention_policy_id   UUID REFERENCES retention_policies(retention_policy_id),
  external_reference    TEXT,
  title                 TEXT,
  summary               TEXT,

  locked_at             TIMESTAMPTZ,
  locked_by             UUID,
  completed_at          TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

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

  CONSTRAINT documents_locked_pair_check CHECK (
    (locked_at IS NULL AND locked_by IS NULL)
    OR (locked_at IS NOT NULL AND locked_by IS NOT NULL)
  )
);

-- ── Signatures (normalized; keep in sync with documents.signatures) ────────

CREATE TABLE IF NOT EXISTS document_signatures (
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

-- ── Attachments ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_attachments (
  attachment_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           UUID NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  file_name             TEXT NOT NULL,
  content_type          TEXT NOT NULL,
  byte_size             BIGINT NOT NULL CHECK (byte_size >= 0),
  storage_provider      TEXT NOT NULL DEFAULT 's3',
  storage_key           TEXT NOT NULL,
  checksum_sha256       TEXT,
  uploaded_by           UUID NOT NULL,
  uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ,
  UNIQUE (document_id, storage_key)
);

-- ── Revisions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_revisions (
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

-- ── Audit log (append-only for app roles) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS document_audit_log (
  audit_id              BIGSERIAL PRIMARY KEY,
  document_id           UUID NOT NULL REFERENCES documents(document_id),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  event                 document_audit_event NOT NULL,
  actor_user_id         UUID,
  from_status           document_status,
  to_status             document_status,
  detail                JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Links (incident / job / asset) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_links (
  link_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(company_id),
  document_id           UUID NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  link_type             TEXT NOT NULL CHECK (link_type IN ('incident','job','asset','project')),
  target_id             UUID NOT NULL,
  created_by            UUID NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, link_type, target_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_documents_company_domain_type_status_created
  ON documents (company_id, domain, document_type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_company_status_updated
  ON documents (company_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_company_worker_created
  ON documents (company_id, worker_id, created_at DESC)
  WHERE worker_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_crew_ids_gin
  ON documents USING GIN (crew_ids);

CREATE INDEX IF NOT EXISTS idx_documents_company_job_created
  ON documents (company_id, job_id, created_at DESC)
  WHERE job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_project_created
  ON documents (company_id, project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_asset_created
  ON documents (company_id, asset_id, created_at DESC)
  WHERE asset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_site_created
  ON documents (company_id, site_id, created_at DESC)
  WHERE site_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_external_ref
  ON documents (company_id, external_reference)
  WHERE external_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_hub_completed
  ON documents (company_id, completed_at DESC)
  WHERE status IN ('Completed', 'RequiresReview', 'Archived')
    AND completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_hub_completed_domain_type
  ON documents (company_id, domain, document_type, completed_at DESC)
  WHERE status IN ('Completed', 'RequiresReview', 'Archived')
    AND completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_content_data_gin
  ON documents USING GIN (content_data jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_attachments_document
  ON document_attachments (document_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_attachments_company_uploaded
  ON document_attachments (company_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_document_occurred
  ON document_audit_log (document_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_company_event_occurred
  ON document_audit_log (company_id, event, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_signatures_company_user
  ON document_signatures (company_id, user_id, signed_at DESC);

CREATE INDEX IF NOT EXISTS idx_signatures_user_document
  ON document_signatures (user_id, document_id);

CREATE INDEX IF NOT EXISTS idx_document_links_target
  ON document_links (company_id, link_type, target_id);

COMMIT;
