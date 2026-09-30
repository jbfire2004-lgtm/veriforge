-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('hot_work', 'confined_space', 'excavation', 'electrical', 'general');

-- CreateEnum
CREATE TYPE "WorkPermitStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'suspended', 'closed', 'expired');

-- CreateTable
CREATE TABLE "work_permits" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "work_package_id" UUID,
    "pm_task_id" UUID,
    "permit_type" "PermitType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "status" "WorkPermitStatus" NOT NULL DEFAULT 'draft',
    "requested_by" UUID NOT NULL,
    "worker_id" UUID,
    "jha_id" UUID,
    "hazard_id" UUID,
    "control_id" UUID,
    "equipment_id" UUID,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_approvals" (
    "id" UUID NOT NULL,
    "permit_id" UUID NOT NULL,
    "approved_by" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'approved',
    "notes" TEXT,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permit_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_safety_requirements" (
    "id" UUID NOT NULL,
    "permit_id" UUID NOT NULL,
    "requirement_type" TEXT NOT NULL,
    "linked_id" UUID,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permit_safety_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_offline_sync" (
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

    CONSTRAINT "permit_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_permits_company_id_idx" ON "work_permits"("company_id");
CREATE INDEX "work_permits_company_id_project_id_idx" ON "work_permits"("company_id", "project_id");
CREATE INDEX "work_permits_company_id_status_idx" ON "work_permits"("company_id", "status");
CREATE INDEX "work_permits_permit_type_status_idx" ON "work_permits"("permit_type", "status");
CREATE INDEX "work_permits_pm_task_id_idx" ON "work_permits"("pm_task_id");
CREATE INDEX "permit_approvals_permit_id_idx" ON "permit_approvals"("permit_id");
CREATE UNIQUE INDEX "permit_safety_requirements_permit_id_requirement_type_key" ON "permit_safety_requirements"("permit_id", "requirement_type");
CREATE INDEX "permit_safety_requirements_permit_id_idx" ON "permit_safety_requirements"("permit_id");
CREATE UNIQUE INDEX "permit_offline_sync_device_id_client_sync_id_key" ON "permit_offline_sync"("device_id", "client_sync_id");
CREATE INDEX "permit_offline_sync_company_id_idx" ON "permit_offline_sync"("company_id");
CREATE INDEX "permit_offline_sync_device_id_idx" ON "permit_offline_sync"("device_id");

-- AddForeignKey
ALTER TABLE "permit_approvals" ADD CONSTRAINT "permit_approvals_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "work_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "permit_safety_requirements" ADD CONSTRAINT "permit_safety_requirements_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "work_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
