-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('draft', 'scheduled', 'in_progress', 'submitted', 'failed', 'passed', 'closed');

-- CreateTable
CREATE TABLE "inspections" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "checklist_id" UUID,
    "checklist_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "checklist_items" JSONB NOT NULL DEFAULT '[]',
    "equipment_id" UUID,
    "worker_id" UUID,
    "inspector_id" UUID,
    "location" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "InspectionStatus" NOT NULL DEFAULT 'draft',
    "score" INTEGER,
    "max_score" INTEGER,
    "pass_threshold" INTEGER,
    "safety_gate_passed" BOOLEAN,
    "safety_gate_reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_findings" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "item_key" TEXT NOT NULL,
    "finding_type" TEXT NOT NULL,
    "severity" TEXT,
    "description" TEXT,
    "photo_url" TEXT,
    "hazard_id" UUID,
    "control_id" UUID,
    "corrective_action_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_offline_sync" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "client_sync_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "inspection_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspections_company_id_idx" ON "inspections"("company_id");
CREATE INDEX "inspections_company_id_project_id_idx" ON "inspections"("company_id", "project_id");
CREATE INDEX "inspections_company_id_status_idx" ON "inspections"("company_id", "status");
CREATE INDEX "inspections_company_id_worker_id_idx" ON "inspections"("company_id", "worker_id");
CREATE INDEX "inspections_company_id_equipment_id_idx" ON "inspections"("company_id", "equipment_id");
CREATE INDEX "inspections_deleted_at_idx" ON "inspections"("deleted_at");
CREATE INDEX "inspection_findings_inspection_id_idx" ON "inspection_findings"("inspection_id");
CREATE INDEX "inspection_findings_item_key_idx" ON "inspection_findings"("item_key");
CREATE UNIQUE INDEX "inspection_offline_sync_device_id_client_sync_id_key" ON "inspection_offline_sync"("device_id", "client_sync_id");
CREATE INDEX "inspection_offline_sync_company_id_idx" ON "inspection_offline_sync"("company_id");
CREATE INDEX "inspection_offline_sync_device_id_idx" ON "inspection_offline_sync"("device_id");

-- AddForeignKey
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
