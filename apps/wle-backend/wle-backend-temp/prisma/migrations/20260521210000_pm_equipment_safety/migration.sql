-- PM Equipment Safety Management

CREATE TYPE "PmEquipmentOperationalStatus" AS ENUM (
  'active', 'in_service', 'out_of_service', 'locked_out', 'decommissioned'
);
CREATE TYPE "PmEquipmentSafetyCategory" AS ENUM (
  'PME', 'CRANE', 'VEHICLE', 'TOOL', 'LIFTING_DEVICE', 'ELECTRICAL',
  'CONFINED_SPACE', 'FALL_PROTECTION', 'CUSTOM'
);
CREATE TYPE "PmEquipmentCertificationType" AS ENUM (
  'annual_inspection', 'crane_certification', 'pme_certification',
  'electrical_certification', 'calibration_certificate', 'other'
);
CREATE TYPE "PmEquipmentCertificationStatus" AS ENUM (
  'draft', 'pending_approval', 'approved', 'expired', 'rejected'
);
CREATE TYPE "PmEquipmentInspectionCadence" AS ENUM (
  'pre_use', 'post_use', 'daily', 'weekly', 'monthly', 'annual'
);
CREATE TYPE "PmEquipmentFailureType" AS ENUM (
  'mechanical', 'electrical', 'hydraulic', 'structural', 'control_system', 'safety_device'
);
CREATE TYPE "PmEquipmentFailureStatus" AS ENUM (
  'reported', 'supervisor_review', 'owner_review', 'locked_out', 'capa_open', 'verified', 'closed'
);
CREATE TYPE "PmEquipmentLotoStatus" AS ENUM ('active', 'verified', 'removed', 'cancelled');
CREATE TYPE "PmWorkerEquipmentAuthType" AS ENUM (
  'crane_operator', 'forklift_operator', 'awp_operator', 'pme_operator', 'vehicle_operator', 'specialty'
);

ALTER TABLE "EquipmentCategory" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
DROP INDEX IF EXISTS "EquipmentCategory_name_key";
DROP INDEX IF EXISTS "EquipmentCategory_code_key";
CREATE UNIQUE INDEX IF NOT EXISTS "EquipmentCategory_companyId_name_key" ON "EquipmentCategory"("companyId", "name");
CREATE INDEX IF NOT EXISTS "EquipmentCategory_companyId_idx" ON "EquipmentCategory"("companyId");
ALTER TABLE "EquipmentCategory" ADD CONSTRAINT "EquipmentCategory_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "operationalStatus" "PmEquipmentOperationalStatus" NOT NULL DEFAULT 'active';
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "safetyCategory" "PmEquipmentSafetyCategory";
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "capacity" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "loadChartJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "pmSafetyMetadataJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Equipment_operationalStatus_idx" ON "Equipment"("operationalStatus");
CREATE INDEX IF NOT EXISTS "Equipment_deletedAt_idx" ON "Equipment"("deletedAt");

CREATE TABLE "equipment_certifications" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "certificationType" "PmEquipmentCertificationType" NOT NULL,
  "status" "PmEquipmentCertificationStatus" NOT NULL DEFAULT 'draft',
  "certificateNumber" TEXT,
  "issuedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "storageKey" TEXT,
  "approvedByUserId" INTEGER,
  "approvedAt" TIMESTAMP(3),
  "reviewDueAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_certifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_certifications_clientSyncId_key" ON "equipment_certifications"("clientSyncId");
CREATE INDEX "equipment_certifications_equipmentId_status_idx" ON "equipment_certifications"("equipmentId", "status");
CREATE INDEX "equipment_certifications_expiresAt_idx" ON "equipment_certifications"("expiresAt");
ALTER TABLE "equipment_certifications" ADD CONSTRAINT "equipment_certifications_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_certifications" ADD CONSTRAINT "equipment_certifications_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_inspections" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "pmInspectionId" TEXT,
  "cadence" "PmEquipmentInspectionCadence" NOT NULL,
  "conditionScore" DOUBLE PRECISION,
  "passed" BOOLEAN,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_inspections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_inspections_pmInspectionId_key" ON "equipment_inspections"("pmInspectionId");
CREATE UNIQUE INDEX "equipment_inspections_clientSyncId_key" ON "equipment_inspections"("clientSyncId");
CREATE INDEX "equipment_inspections_equipmentId_cadence_idx" ON "equipment_inspections"("equipmentId", "cadence");
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_pmInspectionId_fkey"
  FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "equipment_inspection_items" (
  "id" TEXT NOT NULL,
  "equipmentInspectionId" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "passed" BOOLEAN,
  "score" DOUBLE PRECISION,
  "notes" TEXT,
  "deficiencySeverity" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equipment_inspection_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "equipment_inspection_items_equipmentInspectionId_idx" ON "equipment_inspection_items"("equipmentInspectionId");
ALTER TABLE "equipment_inspection_items" ADD CONSTRAINT "equipment_inspection_items_equipmentInspectionId_fkey"
  FOREIGN KEY ("equipmentInspectionId") REFERENCES "equipment_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_failures" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "equipmentId" INTEGER NOT NULL,
  "failureType" "PmEquipmentFailureType" NOT NULL,
  "status" "PmEquipmentFailureStatus" NOT NULL DEFAULT 'reported',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "hazardCreated" BOOLEAN NOT NULL DEFAULT false,
  "safetyEventId" TEXT,
  "correctiveActionId" TEXT,
  "reportedByUserId" INTEGER,
  "supervisorReviewedAt" TIMESTAMP(3),
  "ownerReviewedAt" TIMESTAMP(3),
  "lockedOutAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_failures_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_failures_clientSyncId_key" ON "equipment_failures"("clientSyncId");
CREATE INDEX "equipment_failures_equipmentId_status_idx" ON "equipment_failures"("equipmentId", "status");
ALTER TABLE "equipment_failures" ADD CONSTRAINT "equipment_failures_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_failures" ADD CONSTRAINT "equipment_failures_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_loto" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "status" "PmEquipmentLotoStatus" NOT NULL DEFAULT 'active',
  "reason" TEXT NOT NULL,
  "stepsJson" JSONB NOT NULL DEFAULT '[]',
  "authorizedWorkerIds" JSONB NOT NULL DEFAULT '[]',
  "verifiedAt" TIMESTAMP(3),
  "verifiedByUserId" INTEGER,
  "removedAt" TIMESTAMP(3),
  "removedByUserId" INTEGER,
  "legacyLockoutId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_loto_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_loto_clientSyncId_key" ON "equipment_loto"("clientSyncId");
CREATE INDEX "equipment_loto_equipmentId_status_idx" ON "equipment_loto"("equipmentId", "status");
ALTER TABLE "equipment_loto" ADD CONSTRAINT "equipment_loto_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_loto" ADD CONSTRAINT "equipment_loto_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "worker_equipment_authorizations" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "workerId" INTEGER NOT NULL,
  "equipmentId" INTEGER,
  "authType" "PmWorkerEquipmentAuthType" NOT NULL,
  "equipmentCategory" "PmEquipmentSafetyCategory",
  "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "issuedByUserId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "worker_equipment_authorizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "worker_equipment_authorizations_clientSyncId_key" ON "worker_equipment_authorizations"("clientSyncId");
CREATE INDEX "worker_equipment_authorizations_workerId_authType_active_idx"
  ON "worker_equipment_authorizations"("workerId", "authType", "active");
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_condition_scores" (
  "id" TEXT NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "score" DOUBLE PRECISION NOT NULL,
  "riskBand" TEXT NOT NULL,
  "factorsJson" JSONB NOT NULL DEFAULT '{}',
  "sourceModule" TEXT,
  "sourceId" TEXT,
  "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equipment_condition_scores_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "equipment_condition_scores_equipmentId_scoredAt_idx" ON "equipment_condition_scores"("equipmentId", "scoredAt");
ALTER TABLE "equipment_condition_scores" ADD CONSTRAINT "equipment_condition_scores_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_assignment_audit" (
  "id" TEXT NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "workerId" INTEGER,
  "projectId" INTEGER,
  "subcontractorCompanyId" INTEGER,
  "action" TEXT NOT NULL,
  "passedRules" BOOLEAN NOT NULL DEFAULT true,
  "ruleFailuresJson" JSONB NOT NULL DEFAULT '[]',
  "actorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equipment_assignment_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "equipment_assignment_audit_equipmentId_createdAt_idx" ON "equipment_assignment_audit"("equipmentId", "createdAt");
ALTER TABLE "equipment_assignment_audit" ADD CONSTRAINT "equipment_assignment_audit_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "equipment_audit" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equipment_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "equipment_audit_entityType_entityId_createdAt_idx" ON "equipment_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "equipment_audit" ADD CONSTRAINT "equipment_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
