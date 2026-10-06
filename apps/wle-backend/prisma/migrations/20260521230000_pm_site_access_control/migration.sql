-- PM Site Access Control

CREATE TYPE "PmAccessPointType" AS ENUM (
  'main_gate', 'project_gate', 'zone_gate', 'restricted_area', 'confined_space',
  'hot_work_zone', 'equipment_operation', 'emergency_muster', 'safety_station', 'custom'
);
CREATE TYPE "PmAccessZoneType" AS ENUM (
  'general_work', 'high_risk', 'confined_space', 'hot_work', 'electrical_hazard',
  'chemical_storage', 'equipment_operation', 'sif_high_energy'
);
CREATE TYPE "PmAccessDecision" AS ENUM (
  'granted', 'denied', 'denied_with_reason', 'requires_supervisor_override', 'requires_safety_override'
);
CREATE TYPE "PmAccessOverrideType" AS ENUM (
  'temporary', 'one_time', 'zone_specific', 'equipment_specific'
);

ALTER TABLE IF EXISTS "site_access_rule" RENAME TO "access_zone_rules";

ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "accessPointId" TEXT;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "zoneType" "PmAccessZoneType" NOT NULL DEFAULT 'general_work';
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "requiresJha" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "requiresSdsAck" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "requiresPermitIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "requiredPpe" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "requirementsJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "timeWindowStart" TEXT;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "timeWindowEnd" TEXT;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "highRisk" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "access_zone_rules" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "access_zone_rules" r
SET "companyId" = (SELECT p."companyId" FROM "Project" p WHERE p.id = r."projectId")
WHERE "companyId" IS NULL;

CREATE INDEX IF NOT EXISTS "access_zone_rules_zoneType_idx" ON "access_zone_rules"("zoneType");

CREATE TABLE "access_points" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "siteId" INTEGER,
  "pointType" "PmAccessPointType" NOT NULL,
  "name" TEXT NOT NULL,
  "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
  "description" TEXT,
  "geoJson" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "access_points_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "access_points_clientSyncId_key" ON "access_points"("clientSyncId");
CREATE INDEX "access_points_companyId_projectId_idx" ON "access_points"("companyId", "projectId");
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_siteId_fkey"
  FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "access_zone_rules" ADD CONSTRAINT "access_zone_rules_accessPointId_fkey"
  FOREIGN KEY ("accessPointId") REFERENCES "access_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "access_overrides" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "workerId" INTEGER,
  "equipmentId" INTEGER,
  "zoneCode" TEXT,
  "overrideType" "PmAccessOverrideType" NOT NULL,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "supervisorUserId" INTEGER,
  "safetyUserId" INTEGER,
  "supervisorSignature" TEXT,
  "safetySignature" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "revokedAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_overrides_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "access_overrides_clientSyncId_key" ON "access_overrides"("clientSyncId");
CREATE INDEX "access_overrides_projectId_workerId_active_idx" ON "access_overrides"("projectId", "workerId", "active");
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "access_attempts" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "accessPointId" TEXT,
  "workerId" INTEGER,
  "equipmentId" INTEGER,
  "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
  "decision" "PmAccessDecision" NOT NULL,
  "denialReasons" JSONB NOT NULL DEFAULT '[]',
  "checksJson" JSONB NOT NULL DEFAULT '{}',
  "overrideId" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_attempts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "access_attempts_clientSyncId_key" ON "access_attempts"("clientSyncId");
CREATE INDEX "access_attempts_projectId_createdAt_idx" ON "access_attempts"("projectId", "createdAt");
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_accessPointId_fkey"
  FOREIGN KEY ("accessPointId") REFERENCES "access_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_overrideId_fkey"
  FOREIGN KEY ("overrideId") REFERENCES "access_overrides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "access_denials" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "reasonCode" TEXT NOT NULL,
  "reasonMessage" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_denials_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "access_denials_attemptId_idx" ON "access_denials"("attemptId");
ALTER TABLE "access_denials" ADD CONSTRAINT "access_denials_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "access_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "access_attachments" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT,
  "overrideId" TEXT,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_attachments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "access_attachments_clientSyncId_key" ON "access_attachments"("clientSyncId");
ALTER TABLE "access_attachments" ADD CONSTRAINT "access_attachments_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "access_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "worker_access_requirements" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "workerId" INTEGER NOT NULL,
  "requirementType" TEXT NOT NULL,
  "requirementKey" TEXT NOT NULL,
  "satisfied" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "worker_access_requirements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "worker_access_requirements_workerId_requirementType_requirementKey_projectId_key"
  ON "worker_access_requirements"("workerId", "requirementType", "requirementKey", "projectId");
ALTER TABLE "worker_access_requirements" ADD CONSTRAINT "worker_access_requirements_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worker_access_requirements" ADD CONSTRAINT "worker_access_requirements_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_access_requirements" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "requirementType" TEXT NOT NULL,
  "requirementKey" TEXT NOT NULL,
  "satisfied" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_access_requirements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_access_requirements_equipmentId_requirementType_requirementKey_key"
  ON "equipment_access_requirements"("equipmentId", "requirementType", "requirementKey");
ALTER TABLE "equipment_access_requirements" ADD CONSTRAINT "equipment_access_requirements_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_access_requirements" ADD CONSTRAINT "equipment_access_requirements_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "access_audit" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "access_audit_entityType_entityId_createdAt_idx" ON "access_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "access_audit" ADD CONSTRAINT "access_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
