-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('scheduled', 'conflict', 'safety_blocked', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "project_schedules" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "task_id" UUID,
    "worker_id" UUID,
    "equipment_id" UUID,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_schedules_company_id_idx" ON "project_schedules"("company_id");
CREATE INDEX "project_schedules_project_id_idx" ON "project_schedules"("project_id");
CREATE INDEX "project_schedules_company_id_project_id_idx" ON "project_schedules"("company_id", "project_id");
CREATE INDEX "project_schedules_worker_id_start_time_idx" ON "project_schedules"("worker_id", "start_time");
CREATE INDEX "project_schedules_equipment_id_start_time_idx" ON "project_schedules"("equipment_id", "start_time");
CREATE INDEX "project_schedules_task_id_idx" ON "project_schedules"("task_id");
CREATE INDEX "project_schedules_status_idx" ON "project_schedules"("status");
