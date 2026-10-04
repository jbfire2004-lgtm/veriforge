-- VERIPM ↔ FieldOS permit integration

CREATE TYPE "VeripmPermitRiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "VeripmPermitSyncStatus" AS ENUM (
  'draft',
  'queued',
  'open',
  'in_progress',
  'awaiting_signatures',
  'active',
  'closed',
  'cancelled',
  'sync_error'
);

CREATE TABLE "veripm_permits" (
  "permit_id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "job_id" TEXT,
  "asset_id" TEXT,
  "contractor_id" INTEGER,
  "pm_permit_id" TEXT,
  "fieldos_task_id" TEXT,
  "permit_type" TEXT NOT NULL,
  "risk_level" "VeripmPermitRiskLevel" NOT NULL DEFAULT 'medium',
  "status" "VeripmPermitSyncStatus" NOT NULL DEFAULT 'draft',
  "required_signatures" JSONB NOT NULL DEFAULT '[]',
  "required_documents" JSONB NOT NULL DEFAULT '[]',
  "required_ppe" JSONB NOT NULL DEFAULT '[]',
  "start_time" TIMESTAMP(3),
  "end_time" TIMESTAMP(3),
  "created_by_user_id" INTEGER,
  "fieldos_metadata_json" JSONB NOT NULL DEFAULT '{}',
  "safety_links_json" JSONB NOT NULL DEFAULT '{}',
  "work_order_ids_json" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "veripm_permits_pkey" PRIMARY KEY ("permit_id")
);

CREATE UNIQUE INDEX "veripm_permits_pm_permit_id_key" ON "veripm_permits"("pm_permit_id");
CREATE UNIQUE INDEX "veripm_permits_fieldos_task_id_key" ON "veripm_permits"("fieldos_task_id");
CREATE INDEX "veripm_permits_company_id_status_idx" ON "veripm_permits"("company_id", "status");
CREATE INDEX "veripm_permits_project_id_permit_type_status_idx" ON "veripm_permits"("project_id", "permit_type", "status");
CREATE INDEX "veripm_permits_contractor_id_idx" ON "veripm_permits"("contractor_id");
CREATE INDEX "veripm_permits_fieldos_task_id_idx" ON "veripm_permits"("fieldos_task_id");

ALTER TABLE "veripm_permits"
  ADD CONSTRAINT "veripm_permits_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "veripm_permits"
  ADD CONSTRAINT "veripm_permits_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "veripm_permits"
  ADD CONSTRAINT "veripm_permits_pm_permit_id_fkey"
  FOREIGN KEY ("pm_permit_id") REFERENCES "permits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "veripm_permits"
  ADD CONSTRAINT "veripm_permits_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
