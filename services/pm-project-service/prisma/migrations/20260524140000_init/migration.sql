-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "WorkPackageStatus" AS ENUM ('planned', 'active', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'blocked', 'done');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "scope" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'low',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_packages" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkPackageStatus" NOT NULL DEFAULT 'planned',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "work_package_id" UUID,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "linked_entity_type" TEXT,
    "linked_entity_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_company_id_idx" ON "projects"("company_id");
CREATE INDEX "projects_company_id_name_idx" ON "projects"("company_id", "name");
CREATE INDEX "projects_risk_level_idx" ON "projects"("risk_level");
CREATE INDEX "work_packages_project_id_idx" ON "work_packages"("project_id");
CREATE INDEX "work_packages_company_id_idx" ON "work_packages"("company_id");
CREATE INDEX "project_tasks_project_id_idx" ON "project_tasks"("project_id");
CREATE INDEX "project_tasks_work_package_id_idx" ON "project_tasks"("work_package_id");
CREATE INDEX "project_tasks_company_id_idx" ON "project_tasks"("company_id");

-- AddForeignKey
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_work_package_id_fkey" FOREIGN KEY ("work_package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
