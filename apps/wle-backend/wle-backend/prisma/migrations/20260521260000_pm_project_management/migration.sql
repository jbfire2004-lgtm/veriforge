-- PM Project Management Module

CREATE TYPE "PmWorkPackageStatus" AS ENUM ('draft', 'published', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "PmPmTaskStatus" AS ENUM ('draft', 'scheduled', 'blocked', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "PmPermitType" AS ENUM ('hot_work', 'confined_space', 'electrical', 'excavation', 'loto', 'chemical_handling', 'crane_lift', 'custom');
CREATE TYPE "PmPermitStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'expired', 'closed', 'rejected');
CREATE TYPE "PmPmAssignmentStatus" AS ENUM ('pending', 'active', 'blocked', 'completed', 'revoked');

CREATE TABLE "pm_project_config" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "projectType" TEXT,
  "scopeOfWorkJson" JSONB NOT NULL DEFAULT '{}',
  "locationsJson" JSONB NOT NULL DEFAULT '[]',
  "zonesJson" JSONB NOT NULL DEFAULT '[]',
  "scheduleJson" JSONB NOT NULL DEFAULT '{}',
  "subcontractorIds" JSONB NOT NULL DEFAULT '[]',
  "projectManagerId" INTEGER,
  "setupComplete" BOOLEAN NOT NULL DEFAULT false,
  "safetyScore" INTEGER NOT NULL DEFAULT 100,
  "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_project_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_project_config_projectId_key" ON "pm_project_config"("projectId");
ALTER TABLE "pm_project_config" ADD CONSTRAINT "pm_project_config_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "work_packages" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "configId" TEXT,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "PmWorkPackageStatus" NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "locationNote" TEXT,
  "zoneCode" TEXT,
  "tasksJson" JSONB NOT NULL DEFAULT '[]',
  "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
  "requiredWorkerIds" JSONB NOT NULL DEFAULT '[]',
  "requiredTraining" JSONB NOT NULL DEFAULT '[]',
  "requiredJhaIds" JSONB NOT NULL DEFAULT '[]',
  "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
  "hazardIds" JSONB NOT NULL DEFAULT '[]',
  "controlIds" JSONB NOT NULL DEFAULT '[]',
  "sifPotential" BOOLEAN NOT NULL DEFAULT false,
  "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "work_packages_projectId_code_key" ON "work_packages"("projectId", "code");
CREATE UNIQUE INDEX "work_packages_clientSyncId_key" ON "work_packages"("clientSyncId");
CREATE INDEX "work_packages_projectId_status_idx" ON "work_packages"("projectId", "status");
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_configId_fkey" FOREIGN KEY ("configId") REFERENCES "pm_project_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "workPackageId" TEXT,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "taskType" TEXT NOT NULL DEFAULT 'general',
  "status" "PmPmTaskStatus" NOT NULL DEFAULT 'draft',
  "requiredSkills" JSONB NOT NULL DEFAULT '[]',
  "requiredTraining" JSONB NOT NULL DEFAULT '[]',
  "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
  "requiredJhaId" TEXT,
  "requiredControls" JSONB NOT NULL DEFAULT '[]',
  "requiredPpe" JSONB NOT NULL DEFAULT '[]',
  "requiredInspections" JSONB NOT NULL DEFAULT '[]',
  "hazardIds" JSONB NOT NULL DEFAULT '[]',
  "zoneCode" TEXT,
  "sifReviewRequired" BOOLEAN NOT NULL DEFAULT false,
  "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "plannedStart" TIMESTAMP(3),
  "plannedEnd" TIMESTAMP(3),
  "actualStart" TIMESTAMP(3),
  "actualEnd" TIMESTAMP(3),
  "blockedReason" TEXT,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tasks_clientSyncId_key" ON "tasks"("clientSyncId");
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");
CREATE INDEX "tasks_workPackageId_idx" ON "tasks"("workPackageId");
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "project_schedules" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "taskId" TEXT,
  "workerId" INTEGER,
  "equipmentId" INTEGER,
  "zoneCode" TEXT,
  "entryType" TEXT NOT NULL DEFAULT 'task',
  "title" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "conflictFlag" BOOLEAN NOT NULL DEFAULT false,
  "safetyBlocked" BOOLEAN NOT NULL DEFAULT false,
  "blockReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "project_schedules_projectId_startAt_idx" ON "project_schedules"("projectId", "startAt");
CREATE INDEX "project_schedules_workerId_startAt_idx" ON "project_schedules"("workerId", "startAt");
CREATE INDEX "project_schedules_equipmentId_startAt_idx" ON "project_schedules"("equipmentId", "startAt");
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_worker_assignments" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "workPackageId" TEXT,
  "taskId" TEXT,
  "workerId" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'crew',
  "status" "PmPmAssignmentStatus" NOT NULL DEFAULT 'pending',
  "validationJson" JSONB NOT NULL DEFAULT '{}',
  "blockedReason" TEXT,
  "assignedById" INTEGER,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientSyncId" TEXT,
  CONSTRAINT "pm_worker_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_worker_assignments_clientSyncId_key" ON "pm_worker_assignments"("clientSyncId");
CREATE INDEX "pm_worker_assignments_projectId_workerId_idx" ON "pm_worker_assignments"("projectId", "workerId");
CREATE INDEX "pm_worker_assignments_taskId_idx" ON "pm_worker_assignments"("taskId");
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_equipment_assignments" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "workPackageId" TEXT,
  "taskId" TEXT,
  "equipmentId" INTEGER NOT NULL,
  "operatorId" INTEGER,
  "status" "PmPmAssignmentStatus" NOT NULL DEFAULT 'pending',
  "validationJson" JSONB NOT NULL DEFAULT '{}',
  "blockedReason" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientSyncId" TEXT,
  CONSTRAINT "pm_equipment_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_equipment_assignments_clientSyncId_key" ON "pm_equipment_assignments"("clientSyncId");
CREATE INDEX "pm_equipment_assignments_projectId_equipmentId_idx" ON "pm_equipment_assignments"("projectId", "equipmentId");
CREATE INDEX "pm_equipment_assignments_taskId_idx" ON "pm_equipment_assignments"("taskId");
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "permits" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "workPackageId" TEXT,
  "taskId" TEXT,
  "permitType" "PmPermitType" NOT NULL,
  "title" TEXT NOT NULL,
  "status" "PmPermitStatus" NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "requiredTraining" JSONB NOT NULL DEFAULT '[]',
  "requiredControls" JSONB NOT NULL DEFAULT '[]',
  "requiredJhaId" TEXT,
  "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
  "validFrom" TIMESTAMP(3),
  "validTo" TIMESTAMP(3),
  "approvedById" INTEGER,
  "approvedAt" TIMESTAMP(3),
  "legacyWorkflowId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "permits_clientSyncId_key" ON "permits"("clientSyncId");
CREATE INDEX "permits_projectId_permitType_status_idx" ON "permits"("projectId", "permitType", "status");
ALTER TABLE "permits" ADD CONSTRAINT "permits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "permits" ADD CONSTRAINT "permits_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "permit_versions" (
  "id" TEXT NOT NULL,
  "permitId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshotJson" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "permit_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "permit_versions_permitId_version_key" ON "permit_versions"("permitId", "version");
ALTER TABLE "permit_versions" ADD CONSTRAINT "permit_versions_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_attachments" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "fileName" TEXT,
  "mimeType" TEXT,
  "storageKey" TEXT,
  "dataUrl" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_attachments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_attachments_clientSyncId_key" ON "pm_attachments"("clientSyncId");
CREATE INDEX "pm_attachments_entityType_entityId_idx" ON "pm_attachments"("entityType", "entityId");
CREATE INDEX "pm_attachments_projectId_idx" ON "pm_attachments"("projectId");
ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_audit" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pm_audit_projectId_createdAt_idx" ON "pm_audit"("projectId", "createdAt");
CREATE INDEX "pm_audit_entityType_entityId_createdAt_idx" ON "pm_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "pm_audit" ADD CONSTRAINT "pm_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_project_offline_cache" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_project_offline_cache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_project_offline_cache_projectId_cacheKey_key" ON "pm_project_offline_cache"("projectId", "cacheKey");
ALTER TABLE "pm_project_offline_cache" ADD CONSTRAINT "pm_project_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
