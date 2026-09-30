-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('draft', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "work_package_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "task_type" TEXT,
    "required_skills" JSONB NOT NULL DEFAULT '[]',
    "required_equipment" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "required_jha" JSONB NOT NULL DEFAULT '[]',
    "status" "TaskStatus" NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "assignee_type" TEXT NOT NULL,
    "assignee_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_company_id_idx" ON "tasks"("company_id");
CREATE INDEX "tasks_work_package_id_idx" ON "tasks"("work_package_id");
CREATE INDEX "tasks_company_id_work_package_id_idx" ON "tasks"("company_id", "work_package_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE UNIQUE INDEX "task_assignments_task_id_assignee_type_assignee_id_key" ON "task_assignments"("task_id", "assignee_type", "assignee_id");
CREATE INDEX "task_assignments_task_id_idx" ON "task_assignments"("task_id");
CREATE INDEX "task_assignments_assignee_id_idx" ON "task_assignments"("assignee_id");

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
