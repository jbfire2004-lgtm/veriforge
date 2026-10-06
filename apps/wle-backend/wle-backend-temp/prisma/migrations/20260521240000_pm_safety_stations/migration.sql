-- PM Safety Stations Integration

CREATE TYPE "PmSafetyStationType" AS ENUM (
  'gate', 'zone', 'equipment', 'muster', 'emergency', 'mobile', 'vehicle', 'confined_space', 'custom'
);
CREATE TYPE "PmSafetyStationStatus" AS ENUM (
  'pending', 'active', 'offline', 'maintenance', 'deactivated'
);
CREATE TYPE "PmSafetyStationNetworkMode" AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE "PmSafetyStationAccessAction" AS ENUM ('sign_in', 'sign_out', 'scan', 'denied');

ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "equipmentId" INTEGER;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "hardwareId" TEXT;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "zoneCode" TEXT NOT NULL DEFAULT 'SITE';
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "stationType" "PmSafetyStationType" NOT NULL DEFAULT 'zone';
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "status" "PmSafetyStationStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "networkMode" "PmSafetyStationNetworkMode" NOT NULL DEFAULT 'online';
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "firmwareVersion" TEXT;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "heartbeatIntervalSec" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "emergencyModeActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "lastSyncAt" TIMESTAMP(3);
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "metadataJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "SafetyStation" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "SafetyStation_hardwareId_key" ON "SafetyStation"("hardwareId");
CREATE UNIQUE INDEX IF NOT EXISTS "SafetyStation_clientSyncId_key" ON "SafetyStation"("clientSyncId");
CREATE INDEX IF NOT EXISTS "SafetyStation_companyId_projectId_idx" ON "SafetyStation"("companyId", "projectId");
CREATE INDEX IF NOT EXISTS "SafetyStation_stationType_status_idx" ON "SafetyStation"("stationType", "status");
CREATE INDEX IF NOT EXISTS "SafetyStation_deletedAt_idx" ON "SafetyStation"("deletedAt");

ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "batteryLevel" DOUBLE PRECISION;
ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "storageFreeMb" DOUBLE PRECISION;
ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "sensorHealthJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "firmwareVersion" TEXT;
ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "alertsJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "safety_station_heartbeat" ADD COLUMN IF NOT EXISTS "online" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "safety_station_access_logs" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER NOT NULL,
  "workerId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
  "action" "PmSafetyStationAccessAction" NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "decision" TEXT,
  "denialReasons" JSONB NOT NULL DEFAULT '[]',
  "checksJson" JSONB NOT NULL DEFAULT '{}',
  "accessAttemptId" TEXT,
  "jhaFlhaId" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_station_access_logs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "safety_station_access_logs_clientSyncId_key" ON "safety_station_access_logs"("clientSyncId");
CREATE INDEX "safety_station_access_logs_stationId_createdAt_idx" ON "safety_station_access_logs"("stationId", "createdAt");
CREATE INDEX "safety_station_access_logs_workerId_createdAt_idx" ON "safety_station_access_logs"("workerId", "createdAt");
CREATE INDEX "safety_station_access_logs_projectId_granted_idx" ON "safety_station_access_logs"("projectId", "granted");
ALTER TABLE "safety_station_access_logs" ADD CONSTRAINT "safety_station_access_logs_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_station_access_logs" ADD CONSTRAINT "safety_station_access_logs_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_station_equipment_logs" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "workerId" INTEGER,
  "granted" BOOLEAN NOT NULL,
  "denialReasons" JSONB NOT NULL DEFAULT '[]',
  "checksJson" JSONB NOT NULL DEFAULT '{}',
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_station_equipment_logs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "safety_station_equipment_logs_clientSyncId_key" ON "safety_station_equipment_logs"("clientSyncId");
CREATE INDEX "safety_station_equipment_logs_stationId_createdAt_idx" ON "safety_station_equipment_logs"("stationId", "createdAt");
CREATE INDEX "safety_station_equipment_logs_equipmentId_idx" ON "safety_station_equipment_logs"("equipmentId");
ALTER TABLE "safety_station_equipment_logs" ADD CONSTRAINT "safety_station_equipment_logs_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_station_equipment_logs" ADD CONSTRAINT "safety_station_equipment_logs_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_station_muster_logs" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER NOT NULL,
  "workerId" INTEGER NOT NULL,
  "musterEventId" TEXT,
  "action" TEXT NOT NULL DEFAULT 'check_in',
  "musterPointCode" TEXT,
  "geoJson" JSONB,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_station_muster_logs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "safety_station_muster_logs_clientSyncId_key" ON "safety_station_muster_logs"("clientSyncId");
CREATE INDEX "safety_station_muster_logs_stationId_createdAt_idx" ON "safety_station_muster_logs"("stationId", "createdAt");
CREATE INDEX "safety_station_muster_logs_musterEventId_idx" ON "safety_station_muster_logs"("musterEventId");
ALTER TABLE "safety_station_muster_logs" ADD CONSTRAINT "safety_station_muster_logs_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_station_muster_logs" ADD CONSTRAINT "safety_station_muster_logs_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_station_offline_cache" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_station_offline_cache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "safety_station_offline_cache_stationId_cacheKey_key" ON "safety_station_offline_cache"("stationId", "cacheKey");
CREATE INDEX "safety_station_offline_cache_stationId_updatedAt_idx" ON "safety_station_offline_cache"("stationId", "updatedAt");
ALTER TABLE "safety_station_offline_cache" ADD CONSTRAINT "safety_station_offline_cache_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_station_attachments" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_station_attachments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "safety_station_attachments_clientSyncId_key" ON "safety_station_attachments"("clientSyncId");
CREATE INDEX "safety_station_attachments_stationId_entityType_entityId_idx" ON "safety_station_attachments"("stationId", "entityType", "entityId");
ALTER TABLE "safety_station_attachments" ADD CONSTRAINT "safety_station_attachments_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_station_audit" (
  "id" TEXT NOT NULL,
  "stationId" INTEGER,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_station_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "safety_station_audit_stationId_createdAt_idx" ON "safety_station_audit"("stationId", "createdAt");
CREATE INDEX "safety_station_audit_entityType_entityId_createdAt_idx" ON "safety_station_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "safety_station_audit" ADD CONSTRAINT "safety_station_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
