-- CreateEnum
CREATE TYPE "WorkPackageStatus" AS ENUM ('draft', 'planned', 'active', 'completed', 'on_hold', 'cancelled');

-- CreateTable
CREATE TABLE "work_packages" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required_equipment" JSONB NOT NULL DEFAULT '[]',
    "required_workers" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_jha" JSONB NOT NULL DEFAULT '[]',
    "required_inspections" JSONB NOT NULL DEFAULT '[]',
    "required_permits" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "WorkPackageStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_packages_company_id_idx" ON "work_packages"("company_id");
CREATE INDEX "work_packages_project_id_idx" ON "work_packages"("project_id");
CREATE INDEX "work_packages_company_id_project_id_idx" ON "work_packages"("company_id", "project_id");
CREATE INDEX "work_packages_status_idx" ON "work_packages"("status");
