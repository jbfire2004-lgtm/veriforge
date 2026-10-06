-- VeriForge Orientation System: definitions, requirements, completions, delivery links

CREATE TYPE "OrientationDefinitionType" AS ENUM ('company', 'site', 'project', 'safety', 'trade');
CREATE TYPE "OrientationContentMode" AS ENUM ('uploaded', 'native', 'hybrid');
CREATE TYPE "OrientationCreatedByType" AS ENUM ('company', 'ai');
CREATE TYPE "OrientationMustCompleteBefore" AS ENUM ('arrival', 'dispatch', 'assignment');
CREATE TYPE "OrientationCompletionStatus" AS ENUM ('completed', 'failed', 'expired', 'pending');

CREATE TABLE "orientation_definitions" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "type" "OrientationDefinitionType" NOT NULL,
  "content_mode" "OrientationContentMode" NOT NULL,
  "content_blocks" JSONB NOT NULL DEFAULT '[]',
  "created_by_user_id" INTEGER NOT NULL,
  "created_by_type" "OrientationCreatedByType" NOT NULL DEFAULT 'company',
  "version" TEXT NOT NULL DEFAULT '1.0',
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "expiry_rules" JSONB NOT NULL DEFAULT '{}',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "source_file_key" TEXT,
  "source_core_file_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orientation_requirements" (
  "id" TEXT NOT NULL,
  "orientation_id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "site_id" INTEGER,
  "trade_id" TEXT,
  "union_dispatch_type" TEXT,
  "must_complete_before" "OrientationMustCompleteBefore" NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_requirements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orientation_completions" (
  "id" TEXT NOT NULL,
  "worker_id" INTEGER NOT NULL,
  "orientation_id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "completed_on" TIMESTAMP(3),
  "expires_on" TIMESTAMP(3),
  "score" DOUBLE PRECISION,
  "status" "OrientationCompletionStatus" NOT NULL DEFAULT 'pending',
  "client_sync_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_completions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orientation_delivery_links" (
  "id" TEXT NOT NULL,
  "worker_id" INTEGER NOT NULL,
  "orientation_id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "deep_link" TEXT NOT NULL,
  "wallet_payload" JSONB NOT NULL DEFAULT '{}',
  "assigned_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_delivery_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orientation_completions_client_sync_id_key" ON "orientation_completions"("client_sync_id");
CREATE UNIQUE INDEX "orientation_delivery_links_worker_id_orientation_id_key" ON "orientation_delivery_links"("worker_id", "orientation_id");

CREATE INDEX "orientation_definitions_company_id_type_is_published_idx" ON "orientation_definitions"("company_id", "type", "is_published");
CREATE INDEX "orientation_definitions_company_id_created_at_idx" ON "orientation_definitions"("company_id", "created_at");
CREATE INDEX "orientation_requirements_company_id_project_id_is_active_idx" ON "orientation_requirements"("company_id", "project_id", "is_active");
CREATE INDEX "orientation_requirements_orientation_id_is_active_idx" ON "orientation_requirements"("orientation_id", "is_active");
CREATE INDEX "orientation_requirements_trade_id_union_dispatch_type_idx" ON "orientation_requirements"("trade_id", "union_dispatch_type");
CREATE INDEX "orientation_completions_worker_id_orientation_id_status_idx" ON "orientation_completions"("worker_id", "orientation_id", "status");
CREATE INDEX "orientation_completions_company_id_worker_id_idx" ON "orientation_completions"("company_id", "worker_id");
CREATE INDEX "orientation_completions_expires_on_status_idx" ON "orientation_completions"("expires_on", "status");
CREATE INDEX "orientation_delivery_links_worker_id_created_at_idx" ON "orientation_delivery_links"("worker_id", "created_at");

ALTER TABLE "orientation_definitions" ADD CONSTRAINT "orientation_definitions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_definitions" ADD CONSTRAINT "orientation_definitions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orientation_requirements" ADD CONSTRAINT "orientation_requirements_orientation_id_fkey" FOREIGN KEY ("orientation_id") REFERENCES "orientation_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_requirements" ADD CONSTRAINT "orientation_requirements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_requirements" ADD CONSTRAINT "orientation_requirements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_requirements" ADD CONSTRAINT "orientation_requirements_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orientation_completions" ADD CONSTRAINT "orientation_completions_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_completions" ADD CONSTRAINT "orientation_completions_orientation_id_fkey" FOREIGN KEY ("orientation_id") REFERENCES "orientation_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_completions" ADD CONSTRAINT "orientation_completions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_completions" ADD CONSTRAINT "orientation_completions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orientation_delivery_links" ADD CONSTRAINT "orientation_delivery_links_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_delivery_links" ADD CONSTRAINT "orientation_delivery_links_orientation_id_fkey" FOREIGN KEY ("orientation_id") REFERENCES "orientation_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_delivery_links" ADD CONSTRAINT "orientation_delivery_links_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orientation_delivery_links" ADD CONSTRAINT "orientation_delivery_links_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
