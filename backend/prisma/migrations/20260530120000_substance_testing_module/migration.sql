-- Drug & Alcohol Testing Module

CREATE TYPE "PmSubstanceTestType" AS ENUM (
  'random', 'post_incident', 'reasonable_suspicion',
  'pre_employment', 'return_to_duty', 'follow_up'
);

CREATE TYPE "PmSubstanceTestStatus" AS ENUM (
  'scheduled', 'collection_scheduled', 'collected', 'in_transit',
  'at_lab', 'pending_mro', 'completed', 'cancelled'
);

CREATE TYPE "PmSubstanceTestResultOutcome" AS ENUM (
  'negative', 'non_negative', 'refusal', 'tampered', 'cancelled', 'dilute'
);

CREATE TYPE "PmSubstanceSpecimenType" AS ENUM ('urine', 'oral_fluid', 'breath_alcohol');

CREATE TYPE "PmCustodyPartyRole" AS ENUM (
  'donor', 'collector', 'courier', 'lab_technician', 'mro', 'der', 'safety_officer', 'hr'
);

CREATE TYPE "PmSubstanceTestDocumentType" AS ENUM (
  'ccf', 'chain_of_custody', 'lab_report', 'mro_verification', 'der_notice', 'suspicion_form', 'other'
);

CREATE TABLE "pm_substance_test_pool" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "name" TEXT NOT NULL,
  "selection_rate_percent" DOUBLE PRECISION,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_substance_test_pool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_substance_test_pool_member" (
  "id" TEXT NOT NULL,
  "pool_id" TEXT NOT NULL,
  "worker_id" INTEGER NOT NULL,
  "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "pm_substance_test_pool_member_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_substance_test_pool_member_pool_id_worker_id_key"
  ON "pm_substance_test_pool_member"("pool_id", "worker_id");

CREATE TABLE "pm_substance_test_event" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "worker_id" INTEGER NOT NULL,
  "test_type" "PmSubstanceTestType" NOT NULL,
  "status" "PmSubstanceTestStatus" NOT NULL DEFAULT 'scheduled',
  "specimen_type" "PmSubstanceSpecimenType" NOT NULL DEFAULT 'urine',
  "scheduled_at" TIMESTAMP(3),
  "collected_at" TIMESTAMP(3),
  "incident_event_id" TEXT,
  "pool_id" TEXT,
  "suspicion_notes" TEXT,
  "suspicion_observed_by_user_id" INTEGER,
  "collection_site_note" VARCHAR(500),
  "der_user_id" INTEGER,
  "created_by_user_id" INTEGER NOT NULL,
  "client_sync_id" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_substance_test_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_substance_test_event_client_sync_id_key"
  ON "pm_substance_test_event"("client_sync_id");

CREATE TABLE "pm_substance_test_result" (
  "id" TEXT NOT NULL,
  "test_event_id" TEXT NOT NULL,
  "outcome" "PmSubstanceTestResultOutcome" NOT NULL,
  "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "recorded_by_user_id" INTEGER NOT NULL,
  "mro_notes" TEXT,
  "alcohol_level" DOUBLE PRECISION,
  "substance_panel" TEXT,
  "compliance_applied" BOOLEAN NOT NULL DEFAULT false,
  "compliance_json" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "pm_substance_test_result_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_substance_test_result_test_event_id_key"
  ON "pm_substance_test_result"("test_event_id");

CREATE TABLE "pm_substance_test_signature" (
  "id" TEXT NOT NULL,
  "test_event_id" TEXT NOT NULL,
  "signer_name" TEXT NOT NULL,
  "signer_role" "PmCustodyPartyRole" NOT NULL,
  "signature_data" TEXT NOT NULL,
  "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signed_by_user_id" INTEGER,
  "ip_address" TEXT,
  CONSTRAINT "pm_substance_test_signature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_substance_test_custody_transfer" (
  "id" TEXT NOT NULL,
  "test_event_id" TEXT NOT NULL,
  "sequence_number" INTEGER NOT NULL,
  "from_role" "PmCustodyPartyRole" NOT NULL,
  "to_role" "PmCustodyPartyRole" NOT NULL,
  "from_party_name" TEXT,
  "to_party_name" TEXT,
  "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "location_note" VARCHAR(500),
  "notes" TEXT,
  "signature_id" TEXT,
  CONSTRAINT "pm_substance_test_custody_transfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_substance_test_custody_transfer_signature_id_key"
  ON "pm_substance_test_custody_transfer"("signature_id");

CREATE UNIQUE INDEX "pm_substance_test_custody_transfer_test_event_id_sequence_number_key"
  ON "pm_substance_test_custody_transfer"("test_event_id", "sequence_number");

CREATE TABLE "pm_substance_test_attachment" (
  "id" TEXT NOT NULL,
  "test_event_id" TEXT NOT NULL,
  "custody_transfer_id" TEXT,
  "document_type" "PmSubstanceTestDocumentType" NOT NULL DEFAULT 'other',
  "file_name" TEXT,
  "mime_type" TEXT,
  "storage_key" TEXT,
  "data_url" TEXT,
  "uploaded_by_user_id" INTEGER,
  "client_sync_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_substance_test_attachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_substance_test_attachment_client_sync_id_key"
  ON "pm_substance_test_attachment"("client_sync_id");

-- Foreign keys
ALTER TABLE "pm_substance_test_pool" ADD CONSTRAINT "pm_substance_test_pool_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_pool" ADD CONSTRAINT "pm_substance_test_pool_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_pool_member" ADD CONSTRAINT "pm_substance_test_pool_member_pool_id_fkey"
  FOREIGN KEY ("pool_id") REFERENCES "pm_substance_test_pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_pool_member" ADD CONSTRAINT "pm_substance_test_pool_member_worker_id_fkey"
  FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_worker_id_fkey"
  FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_incident_event_id_fkey"
  FOREIGN KEY ("incident_event_id") REFERENCES "pm_safety_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_pool_id_fkey"
  FOREIGN KEY ("pool_id") REFERENCES "pm_substance_test_pool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_der_user_id_fkey"
  FOREIGN KEY ("der_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_result" ADD CONSTRAINT "pm_substance_test_result_test_event_id_fkey"
  FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_result" ADD CONSTRAINT "pm_substance_test_result_recorded_by_user_id_fkey"
  FOREIGN KEY ("recorded_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_signature" ADD CONSTRAINT "pm_substance_test_signature_test_event_id_fkey"
  FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_signature" ADD CONSTRAINT "pm_substance_test_signature_signed_by_user_id_fkey"
  FOREIGN KEY ("signed_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_custody_transfer" ADD CONSTRAINT "pm_substance_test_custody_transfer_test_event_id_fkey"
  FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_custody_transfer" ADD CONSTRAINT "pm_substance_test_custody_transfer_signature_id_fkey"
  FOREIGN KEY ("signature_id") REFERENCES "pm_substance_test_signature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_substance_test_attachment" ADD CONSTRAINT "pm_substance_test_attachment_test_event_id_fkey"
  FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_substance_test_attachment" ADD CONSTRAINT "pm_substance_test_attachment_uploaded_by_user_id_fkey"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "pm_substance_test_event_company_id_status_idx" ON "pm_substance_test_event"("company_id", "status");
CREATE INDEX "pm_substance_test_event_worker_id_created_at_idx" ON "pm_substance_test_event"("worker_id", "created_at");
CREATE INDEX "pm_substance_test_event_project_id_test_type_idx" ON "pm_substance_test_event"("project_id", "test_type");
CREATE INDEX "pm_substance_test_event_incident_event_id_idx" ON "pm_substance_test_event"("incident_event_id");
CREATE INDEX "pm_substance_test_pool_company_id_active_idx" ON "pm_substance_test_pool"("company_id", "active");
CREATE INDEX "pm_substance_test_result_outcome_recorded_at_idx" ON "pm_substance_test_result"("outcome", "recorded_at");
CREATE INDEX "pm_substance_test_custody_transfer_test_event_id_transferred_at_idx"
  ON "pm_substance_test_custody_transfer"("test_event_id", "transferred_at");
CREATE INDEX "pm_substance_test_signature_test_event_id_signed_at_idx"
  ON "pm_substance_test_signature"("test_event_id", "signed_at");
CREATE INDEX "pm_substance_test_attachment_test_event_id_document_type_idx"
  ON "pm_substance_test_attachment"("test_event_id", "document_type");
