-- CreateEnum
CREATE TYPE "JhaStatus" AS ENUM ('draft', 'pending_signatures', 'pending_approval', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "jhas" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "JhaStatus" NOT NULL DEFAULT 'draft',
    "risk_score" INTEGER NOT NULL DEFAULT 0,
    "sif_score" INTEGER NOT NULL DEFAULT 0,
    "heca_category" TEXT NOT NULL DEFAULT 'routine',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_hazards" (
    "id" UUID NOT NULL,
    "jha_id" UUID NOT NULL,
    "hazard_id" UUID NOT NULL,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "heca_category" TEXT NOT NULL DEFAULT 'routine',

    CONSTRAINT "jha_hazards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_controls" (
    "id" UUID NOT NULL,
    "jha_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "control_strength" INTEGER NOT NULL,

    CONSTRAINT "jha_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_signatures" (
    "id" UUID NOT NULL,
    "jha_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "signature_blob" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_versions" (
    "id" UUID NOT NULL,
    "jha_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_offline_sync" (
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

    CONSTRAINT "jha_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jhas_company_id_idx" ON "jhas"("company_id");
CREATE INDEX "jhas_company_id_project_id_idx" ON "jhas"("company_id", "project_id");
CREATE INDEX "jhas_company_id_status_idx" ON "jhas"("company_id", "status");
CREATE UNIQUE INDEX "jha_hazards_jha_id_hazard_id_key" ON "jha_hazards"("jha_id", "hazard_id");
CREATE INDEX "jha_hazards_jha_id_idx" ON "jha_hazards"("jha_id");
CREATE UNIQUE INDEX "jha_controls_jha_id_control_id_key" ON "jha_controls"("jha_id", "control_id");
CREATE INDEX "jha_controls_jha_id_idx" ON "jha_controls"("jha_id");
CREATE UNIQUE INDEX "jha_signatures_jha_id_worker_id_key" ON "jha_signatures"("jha_id", "worker_id");
CREATE INDEX "jha_signatures_jha_id_idx" ON "jha_signatures"("jha_id");
CREATE UNIQUE INDEX "jha_versions_jha_id_version_key" ON "jha_versions"("jha_id", "version");
CREATE INDEX "jha_versions_jha_id_idx" ON "jha_versions"("jha_id");
CREATE UNIQUE INDEX "jha_offline_sync_device_id_client_sync_id_key" ON "jha_offline_sync"("device_id", "client_sync_id");
CREATE INDEX "jha_offline_sync_company_id_idx" ON "jha_offline_sync"("company_id");
CREATE INDEX "jha_offline_sync_device_id_idx" ON "jha_offline_sync"("device_id");

-- AddForeignKey
ALTER TABLE "jha_hazards" ADD CONSTRAINT "jha_hazards_jha_id_fkey" FOREIGN KEY ("jha_id") REFERENCES "jhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_controls" ADD CONSTRAINT "jha_controls_jha_id_fkey" FOREIGN KEY ("jha_id") REFERENCES "jhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_signatures" ADD CONSTRAINT "jha_signatures_jha_id_fkey" FOREIGN KEY ("jha_id") REFERENCES "jhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_versions" ADD CONSTRAINT "jha_versions_jha_id_fkey" FOREIGN KEY ("jha_id") REFERENCES "jhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
