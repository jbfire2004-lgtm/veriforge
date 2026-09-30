-- CreateEnum
CREATE TYPE "CorrectiveActionStatus" AS ENUM ('draft', 'open', 'assigned', 'in_progress', 'pending_verification', 'verified', 'closed', 'cancelled');

-- CreateTable
CREATE TABLE "corrective_actions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "hazard_id" UUID,
    "control_id" UUID,
    "equipment_id" UUID,
    "worker_id" UUID,
    "due_date" TIMESTAMP(3),
    "status" "CorrectiveActionStatus" NOT NULL DEFAULT 'draft',
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_assignments" (
    "id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "assignee_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_escalations" (
    "id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "reason" TEXT,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_verifications" (
    "id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "verified_by" UUID NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "outcome" TEXT NOT NULL DEFAULT 'approved',

    CONSTRAINT "corrective_action_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_attachments" (
    "id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT,
    "storage_key" TEXT,
    "data_url" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'evidence',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_module_links" (
    "id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "module_type" TEXT NOT NULL,
    "linked_id" UUID NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_module_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_offline_sync" (
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

    CONSTRAINT "corrective_action_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "corrective_actions_company_id_idx" ON "corrective_actions"("company_id");
CREATE INDEX "corrective_actions_company_id_project_id_idx" ON "corrective_actions"("company_id", "project_id");
CREATE INDEX "corrective_actions_company_id_status_idx" ON "corrective_actions"("company_id", "status");
CREATE INDEX "corrective_actions_source_type_source_id_idx" ON "corrective_actions"("source_type", "source_id");
CREATE INDEX "corrective_actions_due_date_status_idx" ON "corrective_actions"("due_date", "status");
CREATE INDEX "corrective_action_assignments_corrective_action_id_idx" ON "corrective_action_assignments"("corrective_action_id");
CREATE INDEX "corrective_action_assignments_assignee_id_idx" ON "corrective_action_assignments"("assignee_id");
CREATE INDEX "corrective_action_escalations_corrective_action_id_level_idx" ON "corrective_action_escalations"("corrective_action_id", "level");
CREATE INDEX "corrective_action_verifications_corrective_action_id_idx" ON "corrective_action_verifications"("corrective_action_id");
CREATE INDEX "corrective_action_attachments_corrective_action_id_idx" ON "corrective_action_attachments"("corrective_action_id");
CREATE UNIQUE INDEX "corrective_action_module_links_corrective_action_id_module_type_linked_id_key" ON "corrective_action_module_links"("corrective_action_id", "module_type", "linked_id");
CREATE INDEX "corrective_action_module_links_module_type_linked_id_idx" ON "corrective_action_module_links"("module_type", "linked_id");
CREATE UNIQUE INDEX "corrective_action_offline_sync_device_id_client_sync_id_key" ON "corrective_action_offline_sync"("device_id", "client_sync_id");
CREATE INDEX "corrective_action_offline_sync_company_id_idx" ON "corrective_action_offline_sync"("company_id");
CREATE INDEX "corrective_action_offline_sync_device_id_idx" ON "corrective_action_offline_sync"("device_id");

-- AddForeignKey
ALTER TABLE "corrective_action_assignments" ADD CONSTRAINT "corrective_action_assignments_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrective_action_escalations" ADD CONSTRAINT "corrective_action_escalations_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrective_action_verifications" ADD CONSTRAINT "corrective_action_verifications_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrective_action_attachments" ADD CONSTRAINT "corrective_action_attachments_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrective_action_module_links" ADD CONSTRAINT "corrective_action_module_links_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
