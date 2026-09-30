-- Inspection v2: photo findings + contractor dispatch

CREATE TYPE "PmInspectionFindingCategory" AS ENUM (
  'unsafe_condition',
  'missing_ppe',
  'equipment_defect',
  'housekeeping',
  'environmental',
  'other'
);

CREATE TYPE "PmInspectionResponsibleParty" AS ENUM (
  'contractor',
  'supervisor',
  'company',
  'worker'
);

CREATE TYPE "PmContractorDispatchStatus" AS ENUM (
  'pending',
  'sent',
  'acknowledged',
  'in_progress',
  'completed',
  'overdue',
  'cancelled'
);

ALTER TABLE "pm_inspection_attachment"
  ADD COLUMN IF NOT EXISTS "analysis_status" TEXT,
  ADD COLUMN IF NOT EXISTS "analysis_json" JSONB;

CREATE TABLE "pm_inspection_photo_finding" (
  "id" TEXT NOT NULL,
  "inspection_id" TEXT NOT NULL,
  "attachment_id" TEXT,
  "category" "PmInspectionFindingCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "severity" "PmDeficiencySeverity" NOT NULL DEFAULT 'medium',
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "responsible_party" "PmInspectionResponsibleParty" NOT NULL,
  "evidence_required" JSONB NOT NULL DEFAULT '[]',
  "deficiency_id" TEXT,
  "corrective_action_id" TEXT,
  "analysis_json" JSONB,
  "client_sync_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_inspection_photo_finding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_photo_finding_client_sync_id_key"
  ON "pm_inspection_photo_finding"("client_sync_id");

CREATE INDEX "pm_inspection_photo_finding_inspection_id_category_idx"
  ON "pm_inspection_photo_finding"("inspection_id", "category");

CREATE INDEX "pm_inspection_photo_finding_corrective_action_id_idx"
  ON "pm_inspection_photo_finding"("corrective_action_id");

ALTER TABLE "pm_inspection_photo_finding"
  ADD CONSTRAINT "pm_inspection_photo_finding_inspection_id_fkey"
  FOREIGN KEY ("inspection_id") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_inspection_photo_finding"
  ADD CONSTRAINT "pm_inspection_photo_finding_attachment_id_fkey"
  FOREIGN KEY ("attachment_id") REFERENCES "pm_inspection_attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_inspection_photo_finding"
  ADD CONSTRAINT "pm_inspection_photo_finding_deficiency_id_fkey"
  FOREIGN KEY ("deficiency_id") REFERENCES "pm_inspection_deficiency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_inspection_photo_finding"
  ADD CONSTRAINT "pm_inspection_photo_finding_corrective_action_id_fkey"
  FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_contractor_dispatch" (
  "id" TEXT NOT NULL,
  "corrective_action_id" TEXT NOT NULL,
  "subcontractor_company_id" INTEGER NOT NULL,
  "status" "PmContractorDispatchStatus" NOT NULL DEFAULT 'pending',
  "package_json" JSONB NOT NULL,
  "sent_at" TIMESTAMP(3),
  "acknowledged_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "overdue_at" TIMESTAMP(3),
  "notification_ids" JSONB NOT NULL DEFAULT '[]',
  "client_sync_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_inspection_contractor_dispatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_contractor_dispatch_client_sync_id_key"
  ON "pm_inspection_contractor_dispatch"("client_sync_id");

CREATE INDEX "pm_inspection_contractor_dispatch_subcontractor_company_id_status_idx"
  ON "pm_inspection_contractor_dispatch"("subcontractor_company_id", "status");

CREATE INDEX "pm_inspection_contractor_dispatch_corrective_action_id_idx"
  ON "pm_inspection_contractor_dispatch"("corrective_action_id");

ALTER TABLE "pm_inspection_contractor_dispatch"
  ADD CONSTRAINT "pm_inspection_contractor_dispatch_corrective_action_id_fkey"
  FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_inspection_contractor_dispatch"
  ADD CONSTRAINT "pm_inspection_contractor_dispatch_subcontractor_company_id_fkey"
  FOREIGN KEY ("subcontractor_company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
