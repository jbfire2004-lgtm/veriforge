-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('fire', 'medical', 'hazmat', 'weather', 'security', 'evacuation', 'other');

-- CreateEnum
CREATE TYPE "EmergencySeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('active', 'all_clear', 'closed');

-- CreateEnum
CREATE TYPE "MusterSessionStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "MusterAttendanceStatus" AS ENUM ('present', 'absent', 'unknown', 'evacuated');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "emergency_events" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "type" "EmergencyType" NOT NULL,
    "severity" "EmergencySeverity" NOT NULL DEFAULT 'medium',
    "status" "EmergencyStatus" NOT NULL DEFAULT 'active',
    "description" TEXT,
    "triggered_by" UUID NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "all_clear_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muster_sessions" (
    "id" UUID NOT NULL,
    "emergency_id" UUID NOT NULL,
    "muster_point" TEXT NOT NULL,
    "expected_roster" JSONB NOT NULL DEFAULT '[]',
    "status" "MusterSessionStatus" NOT NULL DEFAULT 'open',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "muster_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muster_attendance" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "status" "MusterAttendanceStatus" NOT NULL DEFAULT 'present',
    "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muster_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_plans" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "plan_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "file_path" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_equipment" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "equipment_type" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "last_inspected" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_notifications" (
    "id" UUID NOT NULL,
    "emergency_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_events_company_id_idx" ON "emergency_events"("company_id");
CREATE INDEX "emergency_events_company_id_project_id_idx" ON "emergency_events"("company_id", "project_id");
CREATE INDEX "emergency_events_status_idx" ON "emergency_events"("status");
CREATE INDEX "muster_sessions_emergency_id_idx" ON "muster_sessions"("emergency_id");
CREATE UNIQUE INDEX "muster_attendance_session_id_worker_id_key" ON "muster_attendance"("session_id", "worker_id");
CREATE INDEX "muster_attendance_session_id_idx" ON "muster_attendance"("session_id");
CREATE INDEX "muster_attendance_worker_id_idx" ON "muster_attendance"("worker_id");
CREATE INDEX "emergency_plans_company_id_idx" ON "emergency_plans"("company_id");
CREATE INDEX "emergency_plans_company_id_project_id_idx" ON "emergency_plans"("company_id", "project_id");
CREATE INDEX "emergency_equipment_company_id_idx" ON "emergency_equipment"("company_id");
CREATE INDEX "emergency_equipment_company_id_project_id_idx" ON "emergency_equipment"("company_id", "project_id");
CREATE INDEX "emergency_notifications_emergency_id_idx" ON "emergency_notifications"("emergency_id");

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_emergency_id_fkey" FOREIGN KEY ("emergency_id") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_attendance" ADD CONSTRAINT "muster_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "muster_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_emergency_id_fkey" FOREIGN KEY ("emergency_id") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
