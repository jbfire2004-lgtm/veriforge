-- PM Offline Mode Engine

CREATE TYPE "PmOfflineSyncStatus" AS ENUM (
  'pending_sync',
  'syncing',
  'synced',
  'conflict',
  'resolved'
);

CREATE TABLE "offline_cache" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "moduleType" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "lastModified" TIMESTAMP(3) NOT NULL,
  "syncStatus" "PmOfflineSyncStatus" NOT NULL DEFAULT 'pending_sync',
  "clientVersion" INTEGER,
  "errorMessage" TEXT,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "offline_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "offline_cache_deviceId_moduleType_recordId_key"
  ON "offline_cache"("deviceId", "moduleType", "recordId");
CREATE INDEX "offline_cache_deviceId_syncStatus_idx"
  ON "offline_cache"("deviceId", "syncStatus");
CREATE INDEX "offline_cache_projectId_moduleType_idx"
  ON "offline_cache"("projectId", "moduleType");

ALTER TABLE "offline_cache" ADD CONSTRAINT "offline_cache_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offline_cache" ADD CONSTRAINT "offline_cache_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "offline_conflicts" (
  "id" TEXT NOT NULL,
  "cacheId" TEXT,
  "deviceId" TEXT NOT NULL,
  "moduleType" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "localValue" JSONB NOT NULL DEFAULT '{}',
  "serverValue" JSONB NOT NULL DEFAULT '{}',
  "resolvedValue" JSONB,
  "resolvedByUserId" INTEGER,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "offline_conflicts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "offline_conflicts_deviceId_resolvedAt_idx"
  ON "offline_conflicts"("deviceId", "resolvedAt");
CREATE INDEX "offline_conflicts_moduleType_recordId_idx"
  ON "offline_conflicts"("moduleType", "recordId");

ALTER TABLE "offline_conflicts" ADD CONSTRAINT "offline_conflicts_cacheId_fkey"
  FOREIGN KEY ("cacheId") REFERENCES "offline_cache"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offline_conflicts" ADD CONSTRAINT "offline_conflicts_resolvedByUserId_fkey"
  FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "offline_audit" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "companyId" INTEGER,
  "eventType" TEXT NOT NULL,
  "eventData" JSONB NOT NULL DEFAULT '{}',
  "actorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "offline_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "offline_audit_deviceId_createdAt_idx"
  ON "offline_audit"("deviceId", "createdAt");
CREATE INDEX "offline_audit_eventType_createdAt_idx"
  ON "offline_audit"("eventType", "createdAt");

ALTER TABLE "offline_audit" ADD CONSTRAINT "offline_audit_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offline_audit" ADD CONSTRAINT "offline_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
