-- Unified Safety Hub

CREATE TYPE "PmSafetyHubDomain" AS ENUM (
  'inspection',
  'investigation',
  'corrective_action',
  'predictive',
  'contractor',
  'substance_testing',
  'competency',
  'equipment'
);

CREATE TABLE "pm_safety_hub_snapshot" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "snapshot_json" JSONB NOT NULL DEFAULT '{}',
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_hub_snapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_safety_evidence_index" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "domain" "PmSafetyHubDomain" NOT NULL,
  "source_type" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "attachment_id" TEXT,
  "legacy_ref" TEXT,
  "file_name" TEXT,
  "mime_type" TEXT,
  "storage_key" TEXT,
  "thumbnail_data_url" TEXT,
  "title" TEXT,
  "description" TEXT,
  "tags_json" JSONB NOT NULL DEFAULT '[]',
  "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "uploaded_by_user_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_evidence_index_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_safety_hub_event_log" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "event_name" TEXT NOT NULL,
  "domain" "PmSafetyHubDomain",
  "entity_type" TEXT,
  "entity_id" TEXT,
  "payload_json" JSONB NOT NULL DEFAULT '{}',
  "actor_id" INTEGER,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_hub_event_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_hub_snapshot_company_id_project_id_key"
  ON "pm_safety_hub_snapshot"("company_id", "project_id");

CREATE INDEX "pm_safety_hub_snapshot_company_id_generated_at_idx"
  ON "pm_safety_hub_snapshot"("company_id", "generated_at");

CREATE INDEX "pm_safety_evidence_index_company_id_domain_captured_at_idx"
  ON "pm_safety_evidence_index"("company_id", "domain", "captured_at");

CREATE INDEX "pm_safety_evidence_index_project_id_domain_idx"
  ON "pm_safety_evidence_index"("project_id", "domain");

CREATE INDEX "pm_safety_evidence_index_source_type_source_id_idx"
  ON "pm_safety_evidence_index"("source_type", "source_id");

CREATE INDEX "pm_safety_hub_event_log_company_id_occurred_at_idx"
  ON "pm_safety_hub_event_log"("company_id", "occurred_at");

CREATE INDEX "pm_safety_hub_event_log_project_id_occurred_at_idx"
  ON "pm_safety_hub_event_log"("project_id", "occurred_at");

CREATE INDEX "pm_safety_hub_event_log_event_name_idx"
  ON "pm_safety_hub_event_log"("event_name");

ALTER TABLE "pm_safety_hub_snapshot"
  ADD CONSTRAINT "pm_safety_hub_snapshot_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_safety_hub_snapshot"
  ADD CONSTRAINT "pm_safety_hub_snapshot_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_safety_evidence_index"
  ADD CONSTRAINT "pm_safety_evidence_index_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_safety_evidence_index"
  ADD CONSTRAINT "pm_safety_evidence_index_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_safety_evidence_index"
  ADD CONSTRAINT "pm_safety_evidence_index_uploaded_by_user_id_fkey"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_safety_hub_event_log"
  ADD CONSTRAINT "pm_safety_hub_event_log_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_safety_hub_event_log"
  ADD CONSTRAINT "pm_safety_hub_event_log_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_safety_hub_event_log"
  ADD CONSTRAINT "pm_safety_hub_event_log_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
