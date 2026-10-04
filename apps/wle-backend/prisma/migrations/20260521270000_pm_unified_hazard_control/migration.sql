-- PM Unified Hazard & Control Engine

CREATE TYPE "PmUnifiedHcPublishStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "PmUnifiedHazardScope" AS ENUM ('company', 'project', 'work_package', 'task', 'worker');
CREATE TYPE "PmUnifiedHazardType" AS ENUM ('physical', 'chemical', 'biological', 'ergonomic', 'psychosocial', 'environmental', 'equipment', 'procedural');
CREATE TYPE "PmUnifiedHazardCategory" AS ENUM ('energy', 'environmental', 'equipment', 'chemical', 'behavioral', 'site_specific');
CREATE TYPE "PmUnifiedControlType" AS ENUM ('engineering', 'administrative', 'ppe', 'procedural', 'equipment');
CREATE TYPE "PmUnifiedEnergyType" AS ENUM ('gravity', 'motion', 'mechanical', 'electrical', 'chemical', 'thermal', 'pressure', 'radiation', 'biological');
CREATE TYPE "PmUnifiedHcIngestSource" AS ENUM ('jha_flha', 'inspection', 'incident', 'equipment_failure', 'sds', 'pm_task', 'company_library', 'project_library', 'manual');

CREATE TABLE "hazards" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "workPackageId" TEXT,
  "taskId" TEXT,
  "workerId" INTEGER,
  "parentHazardId" TEXT,
  "scopeLevel" "PmUnifiedHazardScope" NOT NULL DEFAULT 'company',
  "hazardType" "PmUnifiedHazardType" NOT NULL DEFAULT 'physical',
  "category" "PmUnifiedHazardCategory" NOT NULL DEFAULT 'energy',
  "subcategory" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" INTEGER NOT NULL DEFAULT 3,
  "likelihood" INTEGER NOT NULL DEFAULT 3,
  "riskScore" INTEGER NOT NULL DEFAULT 9,
  "sifPotential" BOOLEAN NOT NULL DEFAULT false,
  "hecaCategoryKey" TEXT,
  "sifScore" INTEGER,
  "supervisorReviewRequired" BOOLEAN NOT NULL DEFAULT false,
  "requiredTraining" JSONB NOT NULL DEFAULT '[]',
  "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
  "requiredPpe" JSONB NOT NULL DEFAULT '[]',
  "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
  "sourceType" "PmUnifiedHcIngestSource" NOT NULL DEFAULT 'manual',
  "sourceId" TEXT,
  "legacyCompanyHazardId" TEXT,
  "legacyProjectHazardId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "PmUnifiedHcPublishStatus" NOT NULL DEFAULT 'draft',
  "publishedAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hazards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazards_clientSyncId_key" ON "hazards"("clientSyncId");
CREATE INDEX "hazards_companyId_scopeLevel_status_idx" ON "hazards"("companyId", "scopeLevel", "status");
CREATE INDEX "hazards_projectId_status_idx" ON "hazards"("projectId", "status");
CREATE INDEX "hazards_taskId_idx" ON "hazards"("taskId");
CREATE INDEX "hazards_workerId_idx" ON "hazards"("workerId");
CREATE INDEX "hazards_parentHazardId_idx" ON "hazards"("parentHazardId");
CREATE INDEX "hazards_sourceType_sourceId_idx" ON "hazards"("sourceType", "sourceId");
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_parentHazardId_fkey" FOREIGN KEY ("parentHazardId") REFERENCES "hazards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "hazard_versions" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshotJson" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hazard_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazard_versions_hazardId_version_key" ON "hazard_versions"("hazardId", "version");
ALTER TABLE "hazard_versions" ADD CONSTRAINT "hazard_versions_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hazard_energy" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "energyType" "PmUnifiedEnergyType" NOT NULL,
  "exposureLevel" INTEGER NOT NULL DEFAULT 1,
  "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
  "severityScore" INTEGER NOT NULL DEFAULT 3,
  "autoDetected" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "hazard_energy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazard_energy_hazardId_energyType_key" ON "hazard_energy"("hazardId", "energyType");
ALTER TABLE "hazard_energy" ADD CONSTRAINT "hazard_energy_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "controls" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "workPackageId" TEXT,
  "taskId" TEXT,
  "parentControlId" TEXT,
  "scopeLevel" "PmUnifiedHazardScope" NOT NULL DEFAULT 'company',
  "controlType" "PmUnifiedControlType" NOT NULL DEFAULT 'administrative',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "controlStrength" INTEGER NOT NULL DEFAULT 3,
  "hierarchyLevel" INTEGER NOT NULL DEFAULT 3,
  "requiredTraining" JSONB NOT NULL DEFAULT '[]',
  "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
  "requiredPpe" JSONB NOT NULL DEFAULT '[]',
  "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
  "sourceType" "PmUnifiedHcIngestSource" NOT NULL DEFAULT 'manual',
  "sourceId" TEXT,
  "legacyCompanyControlId" TEXT,
  "legacyProjectControlId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "PmUnifiedHcPublishStatus" NOT NULL DEFAULT 'draft',
  "publishedAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "controls_clientSyncId_key" ON "controls"("clientSyncId");
CREATE INDEX "controls_companyId_scopeLevel_status_idx" ON "controls"("companyId", "scopeLevel", "status");
CREATE INDEX "controls_projectId_controlType_status_idx" ON "controls"("projectId", "controlType", "status");
ALTER TABLE "controls" ADD CONSTRAINT "controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "controls" ADD CONSTRAINT "controls_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "controls" ADD CONSTRAINT "controls_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "controls" ADD CONSTRAINT "controls_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "controls" ADD CONSTRAINT "controls_parentControlId_fkey" FOREIGN KEY ("parentControlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "hazard_controls" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "effectivenessScore" INTEGER,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "hazard_controls_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazard_controls_hazardId_controlId_key" ON "hazard_controls"("hazardId", "controlId");
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hazard_training" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "trainingCode" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hazard_training_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazard_training_hazardId_trainingCode_key" ON "hazard_training"("hazardId", "trainingCode");
ALTER TABLE "hazard_training" ADD CONSTRAINT "hazard_training_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hazard_equipment" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "equipmentId" INTEGER,
  "equipmentType" TEXT,
  CONSTRAINT "hazard_equipment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hazard_equipment_hazardId_idx" ON "hazard_equipment"("hazardId");
ALTER TABLE "hazard_equipment" ADD CONSTRAINT "hazard_equipment_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hazard_ppe" (
  "id" TEXT NOT NULL,
  "hazardId" TEXT NOT NULL,
  "ppeType" TEXT NOT NULL,
  CONSTRAINT "hazard_ppe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hazard_ppe_hazardId_ppeType_key" ON "hazard_ppe"("hazardId", "ppeType");
ALTER TABLE "hazard_ppe" ADD CONSTRAINT "hazard_ppe_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "control_versions" (
  "id" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshotJson" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "control_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "control_versions_controlId_version_key" ON "control_versions"("controlId", "version");
ALTER TABLE "control_versions" ADD CONSTRAINT "control_versions_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "control_training" (
  "id" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "trainingCode" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "control_training_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "control_training_controlId_trainingCode_key" ON "control_training"("controlId", "trainingCode");
ALTER TABLE "control_training" ADD CONSTRAINT "control_training_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "control_equipment" (
  "id" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "equipmentId" INTEGER,
  CONSTRAINT "control_equipment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "control_equipment_controlId_idx" ON "control_equipment"("controlId");
ALTER TABLE "control_equipment" ADD CONSTRAINT "control_equipment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "control_ppe" (
  "id" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "ppeType" TEXT NOT NULL,
  CONSTRAINT "control_ppe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "control_ppe_controlId_ppeType_key" ON "control_ppe"("controlId", "ppeType");
ALTER TABLE "control_ppe" ADD CONSTRAINT "control_ppe_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "control_verification" (
  "id" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "stepOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "verifiedById" INTEGER,
  CONSTRAINT "control_verification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "control_verification_controlId_stepOrder_idx" ON "control_verification"("controlId", "stepOrder");
ALTER TABLE "control_verification" ADD CONSTRAINT "control_verification_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hazard_audit" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "hazardId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hazard_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hazard_audit_companyId_createdAt_idx" ON "hazard_audit"("companyId", "createdAt");
CREATE INDEX "hazard_audit_hazardId_createdAt_idx" ON "hazard_audit"("hazardId", "createdAt");
ALTER TABLE "hazard_audit" ADD CONSTRAINT "hazard_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "control_audit" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "controlId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "control_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "control_audit_companyId_createdAt_idx" ON "control_audit"("companyId", "createdAt");
CREATE INDEX "control_audit_controlId_createdAt_idx" ON "control_audit"("controlId", "createdAt");
ALTER TABLE "control_audit" ADD CONSTRAINT "control_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_hc_attachments" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "hazardId" TEXT,
  "controlId" TEXT,
  "energyId" TEXT,
  "entityType" TEXT NOT NULL,
  "fileName" TEXT,
  "mimeType" TEXT,
  "storageKey" TEXT,
  "dataUrl" TEXT,
  "annotationJson" JSONB,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_hc_attachments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_hc_attachments_clientSyncId_key" ON "pm_hc_attachments"("clientSyncId");
CREATE INDEX "pm_hc_attachments_entityType_hazardId_idx" ON "pm_hc_attachments"("entityType", "hazardId");
CREATE INDEX "pm_hc_attachments_controlId_idx" ON "pm_hc_attachments"("controlId");
ALTER TABLE "pm_hc_attachments" ADD CONSTRAINT "pm_hc_attachments_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_hc_attachments" ADD CONSTRAINT "pm_hc_attachments_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_hc_overrides" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "ruleType" TEXT NOT NULL,
  "ruleKey" TEXT NOT NULL,
  "hazardId" TEXT,
  "controlId" TEXT,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "approvedById" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_hc_overrides_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pm_hc_overrides_companyId_projectId_active_idx" ON "pm_hc_overrides"("companyId", "projectId", "active");
CREATE INDEX "pm_hc_overrides_expiresAt_idx" ON "pm_hc_overrides"("expiresAt");
ALTER TABLE "pm_hc_overrides" ADD CONSTRAINT "pm_hc_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_hc_overrides" ADD CONSTRAINT "pm_hc_overrides_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_hc_offline_cache" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_hc_offline_cache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_hc_offline_cache_cacheKey_key" ON "pm_hc_offline_cache"("cacheKey");
CREATE INDEX "pm_hc_offline_cache_companyId_idx" ON "pm_hc_offline_cache"("companyId");
CREATE INDEX "pm_hc_offline_cache_projectId_idx" ON "pm_hc_offline_cache"("projectId");
ALTER TABLE "pm_hc_offline_cache" ADD CONSTRAINT "pm_hc_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_hc_offline_cache" ADD CONSTRAINT "pm_hc_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
