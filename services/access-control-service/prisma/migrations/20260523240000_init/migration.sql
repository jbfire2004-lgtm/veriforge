-- CreateEnum
CREATE TYPE "AccessResult" AS ENUM ('granted', 'denied');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('supervisor', 'emergency', 'maintenance', 'temporary');

-- CreateTable
CREATE TABLE "access_points" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "zone_id" UUID,
    "name" TEXT NOT NULL,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_lockouts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "reason" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocked_at" TIMESTAMP(3),
    "locked_by" UUID NOT NULL,

    CONSTRAINT "emergency_lockouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_attempts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "access_point_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "equipment_id" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "AccessResult" NOT NULL,
    "reason" TEXT,

    CONSTRAINT "access_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_overrides" (
    "id" UUID NOT NULL,
    "access_attempt_id" UUID NOT NULL,
    "override_type" "OverrideType" NOT NULL,
    "approved_by" UUID NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry" TIMESTAMP(3),

    CONSTRAINT "access_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "access_points_company_id_idx" ON "access_points"("company_id");
CREATE INDEX "access_points_company_id_project_id_idx" ON "access_points"("company_id", "project_id");
CREATE INDEX "emergency_lockouts_company_id_active_idx" ON "emergency_lockouts"("company_id", "active");
CREATE INDEX "emergency_lockouts_company_id_project_id_active_idx" ON "emergency_lockouts"("company_id", "project_id", "active");
CREATE INDEX "access_attempts_company_id_idx" ON "access_attempts"("company_id");
CREATE INDEX "access_attempts_worker_id_idx" ON "access_attempts"("worker_id");
CREATE INDEX "access_attempts_equipment_id_idx" ON "access_attempts"("equipment_id");
CREATE INDEX "access_attempts_access_point_id_timestamp_idx" ON "access_attempts"("access_point_id", "timestamp");
CREATE INDEX "access_overrides_access_attempt_id_idx" ON "access_overrides"("access_attempt_id");
CREATE INDEX "access_overrides_approved_by_idx" ON "access_overrides"("approved_by");

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_access_point_id_fkey" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_access_attempt_id_fkey" FOREIGN KEY ("access_attempt_id") REFERENCES "access_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
