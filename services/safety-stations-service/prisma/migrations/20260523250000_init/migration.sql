-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('online', 'offline', 'degraded', 'emergency', 'maintenance');

-- CreateEnum
CREATE TYPE "AccessLogResult" AS ENUM ('granted', 'denied');

-- CreateEnum
CREATE TYPE "EmergencyModeType" AS ENUM ('muster', 'lockdown', 'evacuation', 'all_clear');

-- CreateEnum
CREATE TYPE "OfflineSyncStatus" AS ENUM ('pending', 'synced', 'failed');

-- CreateTable
CREATE TABLE "safety_stations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "station_type" TEXT NOT NULL,
    "hardware_id" TEXT NOT NULL,
    "firmware_version" TEXT,
    "location" TEXT,
    "zone_id" UUID,
    "status" "StationStatus" NOT NULL DEFAULT 'offline',
    "last_heartbeat" TIMESTAMP(3),
    "emergency_mode" "EmergencyModeType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_access_logs" (
    "id" UUID NOT NULL,
    "station_id" UUID NOT NULL,
    "worker_id" UUID,
    "equipment_id" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "AccessLogResult" NOT NULL,
    "reason" TEXT,

    CONSTRAINT "safety_station_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muster_checkins" (
    "id" UUID NOT NULL,
    "station_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "muster_point" TEXT NOT NULL,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "muster_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station_offline_sync" (
    "id" UUID NOT NULL,
    "station_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "client_sync_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OfflineSyncStatus" NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "station_offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "safety_stations_company_id_hardware_id_key" ON "safety_stations"("company_id", "hardware_id");
CREATE INDEX "safety_stations_company_id_idx" ON "safety_stations"("company_id");
CREATE INDEX "safety_stations_company_id_project_id_idx" ON "safety_stations"("company_id", "project_id");
CREATE INDEX "safety_stations_status_idx" ON "safety_stations"("status");
CREATE INDEX "safety_station_access_logs_station_id_idx" ON "safety_station_access_logs"("station_id");
CREATE INDEX "safety_station_access_logs_worker_id_idx" ON "safety_station_access_logs"("worker_id");
CREATE INDEX "safety_station_access_logs_equipment_id_idx" ON "safety_station_access_logs"("equipment_id");
CREATE INDEX "safety_station_access_logs_station_id_timestamp_idx" ON "safety_station_access_logs"("station_id", "timestamp");
CREATE INDEX "muster_checkins_station_id_idx" ON "muster_checkins"("station_id");
CREATE INDEX "muster_checkins_worker_id_idx" ON "muster_checkins"("worker_id");
CREATE INDEX "muster_checkins_station_id_checked_in_at_idx" ON "muster_checkins"("station_id", "checked_in_at");
CREATE UNIQUE INDEX "station_offline_sync_station_id_client_sync_id_key" ON "station_offline_sync"("station_id", "client_sync_id");
CREATE INDEX "station_offline_sync_company_id_idx" ON "station_offline_sync"("company_id");
CREATE INDEX "station_offline_sync_status_idx" ON "station_offline_sync"("status");

-- AddForeignKey
ALTER TABLE "safety_station_access_logs" ADD CONSTRAINT "safety_station_access_logs_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "safety_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_checkins" ADD CONSTRAINT "muster_checkins_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "safety_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "station_offline_sync" ADD CONSTRAINT "station_offline_sync_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "safety_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
