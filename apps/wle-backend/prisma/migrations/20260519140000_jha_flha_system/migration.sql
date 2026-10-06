-- JHA / FLHA dedicated system

CREATE TYPE "JhaFlhaKind" AS ENUM ('FLHA', 'JHA');
CREATE TYPE "JhaFlhaStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'LOCKED', 'REJECTED');
CREATE TYPE "JhaEnergyType" AS ENUM ('mechanical', 'electrical', 'chemical', 'thermal', 'radiation', 'biological', 'gravity', 'pressure', 'motion');
CREATE TYPE "JhaFlhaSignatureRole" AS ENUM ('WORKER', 'SUPERVISOR', 'AUTHORIZER');

CREATE TABLE "jha_flha" (
    "id" TEXT NOT NULL,
    "kind" "JhaFlhaKind" NOT NULL DEFAULT 'FLHA',
    "status" "JhaFlhaStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "taskLibraryId" TEXT,
    "taskDescription" TEXT NOT NULL,
    "workScope" TEXT,
    "locationNote" VARCHAR(500),
    "environmentalJson" JSONB NOT NULL DEFAULT '{}',
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "sifScore" INTEGER NOT NULL DEFAULT 0,
    "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" INTEGER,
    "riskScore" INTEGER,
    "taskRiskScore" INTEGER,
    "aiAnalysis" JSONB,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "controlsAdequate" BOOLEAN,
    "reviewNotes" TEXT,
    "createdByUserId" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "clientVersion" INTEGER NOT NULL DEFAULT 0,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "jha_flha_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_version" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "changedByUserId" INTEGER,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_hazard" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "libraryEntryId" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "riskScore" INTEGER NOT NULL DEFAULT 9,
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "sifIndicator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_hazard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_control" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "hazardId" TEXT,
    "libraryEntryId" TEXT,
    "controlType" TEXT NOT NULL DEFAULT 'administrative',
    "description" TEXT NOT NULL,
    "adequate" BOOLEAN,
    "effectivenessScore" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_control_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_energy_source" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "energyType" "JhaEnergyType" NOT NULL,
    "exposureLevel" INTEGER NOT NULL DEFAULT 1,
    "controlsSummary" TEXT,
    CONSTRAINT "jha_flha_energy_source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_worker" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'crew',
    "trainingVerified" BOOLEAN NOT NULL DEFAULT false,
    "competencyVerified" BOOLEAN NOT NULL DEFAULT false,
    "equipmentAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "hazardAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    CONSTRAINT "jha_flha_worker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_equipment" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "authorized" BOOLEAN NOT NULL DEFAULT false,
    "preUseInspectionOk" BOOLEAN,
    CONSTRAINT "jha_flha_equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_signature" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "role" "JhaFlhaSignatureRole" NOT NULL,
    "signerUserId" INTEGER,
    "signerName" TEXT,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_signature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_attachment" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "annotation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_corrective_action" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cailEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_corrective_action_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hazard_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "defaultSeverity" INTEGER NOT NULL DEFAULT 3,
    "defaultLikelihood" INTEGER NOT NULL DEFAULT 3,
    "defaultEnergyTypes" JSONB NOT NULL DEFAULT '[]',
    "taskTypes" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hazard_library_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "control_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "controlType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hazardCategories" JSONB NOT NULL DEFAULT '[]',
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "control_library_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_task_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "taskCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "defaultHazardIds" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_task_library_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jha_flha_audit_log" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jha_flha_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "jha_flha_clientSyncId_key" ON "jha_flha"("clientSyncId");
CREATE INDEX "jha_flha_projectId_status_idx" ON "jha_flha"("projectId", "status");
CREATE INDEX "jha_flha_companyId_createdAt_idx" ON "jha_flha"("companyId", "createdAt");
CREATE INDEX "jha_flha_siteId_status_idx" ON "jha_flha"("siteId", "status");
CREATE UNIQUE INDEX "jha_flha_version_jhaFlhaId_versionNumber_key" ON "jha_flha_version"("jhaFlhaId", "versionNumber");
CREATE INDEX "jha_flha_hazard_jhaFlhaId_sortOrder_idx" ON "jha_flha_hazard"("jhaFlhaId", "sortOrder");
CREATE INDEX "jha_flha_control_jhaFlhaId_idx" ON "jha_flha_control"("jhaFlhaId");
CREATE INDEX "jha_flha_control_hazardId_idx" ON "jha_flha_control"("hazardId");
CREATE UNIQUE INDEX "jha_flha_energy_source_jhaFlhaId_energyType_key" ON "jha_flha_energy_source"("jhaFlhaId", "energyType");
CREATE UNIQUE INDEX "jha_flha_worker_jhaFlhaId_workerId_key" ON "jha_flha_worker"("jhaFlhaId", "workerId");
CREATE UNIQUE INDEX "jha_flha_equipment_jhaFlhaId_equipmentId_key" ON "jha_flha_equipment"("jhaFlhaId", "equipmentId");
CREATE INDEX "jha_flha_signature_jhaFlhaId_idx" ON "jha_flha_signature"("jhaFlhaId");
CREATE INDEX "jha_flha_attachment_jhaFlhaId_idx" ON "jha_flha_attachment"("jhaFlhaId");
CREATE INDEX "jha_flha_corrective_action_jhaFlhaId_idx" ON "jha_flha_corrective_action"("jhaFlhaId");
CREATE INDEX "hazard_library_companyId_category_idx" ON "hazard_library"("companyId", "category");
CREATE INDEX "hazard_library_projectId_category_idx" ON "hazard_library"("projectId", "category");
CREATE INDEX "control_library_companyId_controlType_idx" ON "control_library"("companyId", "controlType");
CREATE INDEX "jha_task_library_companyId_taskCode_idx" ON "jha_task_library"("companyId", "taskCode");
CREATE INDEX "jha_task_library_projectId_taskCode_idx" ON "jha_task_library"("projectId", "taskCode");
CREATE INDEX "jha_flha_audit_log_jhaFlhaId_createdAt_idx" ON "jha_flha_audit_log"("jhaFlhaId", "createdAt");

ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_taskLibraryId_fkey" FOREIGN KEY ("taskLibraryId") REFERENCES "jha_task_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha_version" ADD CONSTRAINT "jha_flha_version_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_version" ADD CONSTRAINT "jha_flha_version_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha_hazard" ADD CONSTRAINT "jha_flha_hazard_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_control" ADD CONSTRAINT "jha_flha_control_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_control" ADD CONSTRAINT "jha_flha_control_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "jha_flha_hazard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha_energy_source" ADD CONSTRAINT "jha_flha_energy_source_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_worker" ADD CONSTRAINT "jha_flha_worker_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_worker" ADD CONSTRAINT "jha_flha_worker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_equipment" ADD CONSTRAINT "jha_flha_equipment_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_equipment" ADD CONSTRAINT "jha_flha_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_signature" ADD CONSTRAINT "jha_flha_signature_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_signature" ADD CONSTRAINT "jha_flha_signature_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jha_flha_attachment" ADD CONSTRAINT "jha_flha_attachment_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_corrective_action" ADD CONSTRAINT "jha_flha_corrective_action_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazard_library" ADD CONSTRAINT "hazard_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazard_library" ADD CONSTRAINT "hazard_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "control_library" ADD CONSTRAINT "control_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "control_library" ADD CONSTRAINT "control_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_task_library" ADD CONSTRAINT "jha_task_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_task_library" ADD CONSTRAINT "jha_task_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_audit_log" ADD CONSTRAINT "jha_flha_audit_log_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jha_flha_audit_log" ADD CONSTRAINT "jha_flha_audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
