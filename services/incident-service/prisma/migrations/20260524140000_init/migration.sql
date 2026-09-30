-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('reported', 'under_investigation', 'investigated', 'closed');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "incident_number" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'reported',
    "location" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "worker_id" UUID,
    "equipment_id" UUID,
    "severity_level" INTEGER NOT NULL,
    "likelihood_level" INTEGER NOT NULL,
    "risk_score" INTEGER,
    "sif_score" INTEGER,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "heca_category" TEXT,
    "safety_gate_passed" BOOLEAN,
    "safety_gate_reason" TEXT,
    "reported_by" UUID NOT NULL,
    "investigated_by" UUID,
    "closed_by" UUID,
    "investigated_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "close_notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_witnesses" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "name" TEXT,
    "contact" TEXT,
    "worker_id" UUID,
    "statement" TEXT,
    "interviewed_at" TIMESTAMP(3),
    "interviewed_by" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "incident_witnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_investigations" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "investigated_by" UUID NOT NULL,
    "findings" TEXT NOT NULL,
    "root_cause" TEXT,
    "method" TEXT,
    "recommendations" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "incident_investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_corrective_action_links" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "linked_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_corrective_action_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_offline_sync" (
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

    CONSTRAINT "incident_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incidents_company_id_incident_number_key" ON "incidents"("company_id", "incident_number");

-- CreateIndex
CREATE INDEX "incidents_company_id_idx" ON "incidents"("company_id");

-- CreateIndex
CREATE INDEX "incidents_company_id_project_id_idx" ON "incidents"("company_id", "project_id");

-- CreateIndex
CREATE INDEX "incidents_company_id_status_idx" ON "incidents"("company_id", "status");

-- CreateIndex
CREATE INDEX "incidents_company_id_severity_idx" ON "incidents"("company_id", "severity");

-- CreateIndex
CREATE INDEX "incidents_deleted_at_idx" ON "incidents"("deleted_at");

-- CreateIndex
CREATE INDEX "incident_witnesses_incident_id_idx" ON "incident_witnesses"("incident_id");

-- CreateIndex
CREATE INDEX "incident_witnesses_deleted_at_idx" ON "incident_witnesses"("deleted_at");

-- CreateIndex
CREATE INDEX "incident_investigations_incident_id_idx" ON "incident_investigations"("incident_id");

-- CreateIndex
CREATE INDEX "incident_investigations_deleted_at_idx" ON "incident_investigations"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "incident_corrective_action_links_incident_id_corrective_actio_key" ON "incident_corrective_action_links"("incident_id", "corrective_action_id");

-- CreateIndex
CREATE INDEX "incident_corrective_action_links_corrective_action_id_idx" ON "incident_corrective_action_links"("corrective_action_id");

-- CreateIndex
CREATE UNIQUE INDEX "incident_offline_sync_device_id_client_sync_id_key" ON "incident_offline_sync"("device_id", "client_sync_id");

-- CreateIndex
CREATE INDEX "incident_offline_sync_company_id_idx" ON "incident_offline_sync"("company_id");

-- CreateIndex
CREATE INDEX "incident_offline_sync_device_id_idx" ON "incident_offline_sync"("device_id");

-- AddForeignKey
ALTER TABLE "incident_witnesses" ADD CONSTRAINT "incident_witnesses_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigations" ADD CONSTRAINT "incident_investigations_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_corrective_action_links" ADD CONSTRAINT "incident_corrective_action_links_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
