-- PM Emergency Response Module

CREATE TYPE "PmEmergencyEventType" AS ENUM (
  'fire', 'medical', 'evacuation', 'hazmat_spill', 'environmental_release',
  'equipment_failure', 'security_threat', 'severe_weather', 'missing_worker', 'custom'
);
CREATE TYPE "PmEmergencyPlanType" AS ENUM (
  'fire', 'evacuation', 'medical', 'spill', 'severe_weather', 'rescue', 'custom'
);
CREATE TYPE "PmEmergencyPlanStatus" AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE "PmEmergencyEventStatus" AS ENUM (
  'declared', 'active', 'muster_in_progress', 'evacuation_in_progress',
  'supervisor_review', 'all_clear', 'closed', 'cancelled'
);
CREATE TYPE "PmEmergencyNotificationChannel" AS ENUM ('sms', 'email', 'push', 'safety_station', 'in_app');
CREATE TYPE "PmEmergencyNotificationStatus" AS ENUM ('pending', 'sent', 'failed', 'escalated');
CREATE TYPE "PmEmergencyEquipmentType" AS ENUM (
  'fire_extinguisher', 'spill_kit', 'first_aid', 'aed', 'rescue_equipment', 'other'
);

-- Emergency plans
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "planType" "PmEmergencyPlanType" NOT NULL DEFAULT 'evacuation';
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "status" "PmEmergencyPlanStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "versionNum" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "rolesJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "musterPointsJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "responseStepsJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "requiresAck" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "reviewDueAt" TIMESTAMP(3);
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;
ALTER TABLE "emergency_plan" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "emergency_plan" ep
SET "companyId" = COALESCE(
  (SELECT p."companyId" FROM "Project" p WHERE p."siteId" = ep."siteId" LIMIT 1),
  1
)
WHERE "companyId" IS NULL;

ALTER TABLE "emergency_plan" ALTER COLUMN "companyId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "emergency_plan_clientSyncId_key" ON "emergency_plan"("clientSyncId");
CREATE INDEX IF NOT EXISTS "emergency_plan_companyId_planType_status_idx" ON "emergency_plan"("companyId", "planType", "status");

ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename muster tables
ALTER TABLE IF EXISTS "muster_event" RENAME TO "muster_sessions";
ALTER TABLE IF EXISTS "muster_checkin" RENAME TO "muster_attendance";

ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "emergencyEventId" TEXT;
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "evacuationPhase" TEXT NOT NULL DEFAULT 'muster';
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "musterPointCode" TEXT;
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "siteAccessLocked" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "supervisorConfirmedAt" TIMESTAMP(3);
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "expectedWorkerIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "missingWorkerIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "dangerZoneWorkerIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "muster_sessions" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;

UPDATE "muster_sessions" ms
SET "companyId" = COALESCE(
  (SELECT p."companyId" FROM "Project" p WHERE p."siteId" = ms."siteId" LIMIT 1),
  1
)
WHERE "companyId" IS NULL;

ALTER TABLE "muster_sessions" ALTER COLUMN "companyId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "muster_sessions_clientSyncId_key" ON "muster_sessions"("clientSyncId");

ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "checkedOutAt" TIMESTAMP(3);
ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "musterPointCode" TEXT;
ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "identityVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "supervisorOverride" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "geoJson" JSONB;
ALTER TABLE "muster_attendance" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "muster_attendance_clientSyncId_key" ON "muster_attendance"("clientSyncId");

CREATE TABLE "emergency_plan_versions" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "authorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_plan_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_plan_versions_planId_version_key" ON "emergency_plan_versions"("planId", "version");
ALTER TABLE "emergency_plan_versions" ADD CONSTRAINT "emergency_plan_versions_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "emergency_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_plan_acknowledgment" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "workerId" INTEGER NOT NULL,
  "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signatureData" TEXT,
  "clientSyncId" TEXT,
  CONSTRAINT "emergency_plan_acknowledgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_plan_acknowledgment_planId_workerId_key" ON "emergency_plan_acknowledgment"("planId", "workerId");
CREATE UNIQUE INDEX "emergency_plan_acknowledgment_clientSyncId_key" ON "emergency_plan_acknowledgment"("clientSyncId");
ALTER TABLE "emergency_plan_acknowledgment" ADD CONSTRAINT "emergency_plan_acknowledgment_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "emergency_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_plan_acknowledgment" ADD CONSTRAINT "emergency_plan_acknowledgment_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_events" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "siteId" INTEGER NOT NULL,
  "eventType" "PmEmergencyEventType" NOT NULL,
  "status" "PmEmergencyEventStatus" NOT NULL DEFAULT 'declared',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "classification" TEXT,
  "timelineJson" JSONB NOT NULL DEFAULT '[]',
  "responseActionsJson" JSONB NOT NULL DEFAULT '[]',
  "safetyEventId" TEXT,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT true,
  "supervisorReviewedAt" TIMESTAMP(3),
  "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "declaredByUserId" INTEGER,
  "allClearAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_events_clientSyncId_key" ON "emergency_events"("clientSyncId");
CREATE INDEX "emergency_events_companyId_eventType_status_idx" ON "emergency_events"("companyId", "eventType", "status");
CREATE INDEX "emergency_events_siteId_status_idx" ON "emergency_events"("siteId", "status");
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_siteId_fkey"
  FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "emergency_event_people" (
  "id" TEXT NOT NULL,
  "emergencyEventId" TEXT NOT NULL,
  "workerId" INTEGER,
  "role" TEXT NOT NULL DEFAULT 'involved',
  "notes" TEXT,
  "injured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_event_people_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_event_people_emergencyEventId_idx" ON "emergency_event_people"("emergencyEventId");
ALTER TABLE "emergency_event_people" ADD CONSTRAINT "emergency_event_people_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_event_people" ADD CONSTRAINT "emergency_event_people_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "emergency_event_equipment" (
  "id" TEXT NOT NULL,
  "emergencyEventId" TEXT NOT NULL,
  "equipmentId" INTEGER,
  "pmEmergencyEquipmentId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_event_equipment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_event_equipment_emergencyEventId_idx" ON "emergency_event_equipment"("emergencyEventId");
ALTER TABLE "emergency_event_equipment" ADD CONSTRAINT "emergency_event_equipment_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_event_attachments" (
  "id" TEXT NOT NULL,
  "emergencyEventId" TEXT NOT NULL,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_event_attachments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_event_attachments_clientSyncId_key" ON "emergency_event_attachments"("clientSyncId");
ALTER TABLE "emergency_event_attachments" ADD CONSTRAINT "emergency_event_attachments_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_notifications" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "emergencyEventId" TEXT,
  "musterEventId" TEXT,
  "channel" "PmEmergencyNotificationChannel" NOT NULL,
  "status" "PmEmergencyNotificationStatus" NOT NULL DEFAULT 'pending',
  "triggerType" TEXT NOT NULL,
  "recipientUserId" INTEGER,
  "recipientWorkerId" INTEGER,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "escalationLevel" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3),
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_notifications_emergencyEventId_status_idx" ON "emergency_notifications"("emergencyEventId", "status");
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_musterEventId_fkey"
  FOREIGN KEY ("musterEventId") REFERENCES "muster_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_equipment" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "siteId" INTEGER,
  "projectId" INTEGER,
  "equipmentType" "PmEmergencyEquipmentType" NOT NULL,
  "name" TEXT NOT NULL,
  "locationNote" TEXT,
  "mapCoordsJson" JSONB,
  "readinessScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "expiresAt" TIMESTAMP(3),
  "lastInspectionAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "emergency_equipment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_equipment_companyId_siteId_idx" ON "emergency_equipment"("companyId", "siteId");
ALTER TABLE "emergency_equipment" ADD CONSTRAINT "emergency_equipment_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_equipment_inspections" (
  "id" TEXT NOT NULL,
  "emergencyEquipmentId" TEXT NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "notes" TEXT,
  "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "inspectedByUserId" INTEGER,
  CONSTRAINT "emergency_equipment_inspections_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "emergency_equipment_inspections" ADD CONSTRAINT "emergency_equipment_inspections_emergencyEquipmentId_fkey"
  FOREIGN KEY ("emergencyEquipmentId") REFERENCES "emergency_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_site_emergency_lock" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "emergencyEventId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unlockedAt" TIMESTAMP(3),
  CONSTRAINT "pm_site_emergency_lock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_site_emergency_lock_projectId_emergencyEventId_key" ON "pm_site_emergency_lock"("projectId", "emergencyEventId");
ALTER TABLE "pm_site_emergency_lock" ADD CONSTRAINT "pm_site_emergency_lock_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_site_emergency_lock" ADD CONSTRAINT "pm_site_emergency_lock_emergencyEventId_fkey"
  FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_audit" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_audit_entityType_entityId_createdAt_idx" ON "emergency_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "emergency_audit" ADD CONSTRAINT "emergency_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
