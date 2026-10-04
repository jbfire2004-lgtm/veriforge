-- PM Inspections & Checklists System

CREATE TYPE "PmInspectionTemplateCategory" AS ENUM (
  'PME', 'CRANE', 'VEHICLE', 'TOOL', 'SITE', 'HOUSEKEEPING', 'ENVIRONMENTAL',
  'ACCESS_EGRESS', 'FALL_PROTECTION', 'CONFINED_SPACE', 'HOT_WORK', 'EXCAVATION',
  'SCAFFOLDING', 'TEMPORARY_POWER', 'FIRE_PROTECTION', 'CUSTOM'
);

CREATE TYPE "PmInspectionTemplateStatus" AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE "PmInspectionStatus" AS ENUM ('draft', 'in_progress', 'submitted', 'review_required', 'approved', 'rejected', 'closed');
CREATE TYPE "PmDeficiencyStatus" AS ENUM ('open', 'assigned', 'in_progress', 'verification_pending', 'closed');
CREATE TYPE "PmDeficiencySeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "PmInspectionScoringMode" AS ENUM ('pass_fail', 'numeric', 'weighted');

CREATE TABLE "pm_inspection_template" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "name" TEXT NOT NULL,
  "category" "PmInspectionTemplateCategory" NOT NULL,
  "description" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "PmInspectionTemplateStatus" NOT NULL DEFAULT 'draft',
  "scoringMode" "PmInspectionScoringMode" NOT NULL DEFAULT 'pass_fail',
  "items" JSONB NOT NULL DEFAULT '[]',
  "scoringRules" JSONB NOT NULL DEFAULT '{}',
  "requiredAttachments" JSONB NOT NULL DEFAULT '[]',
  "requiredSignatures" JSONB NOT NULL DEFAULT '[]',
  "equipmentTypeKeys" JSONB NOT NULL DEFAULT '[]',
  "parentTemplateId" TEXT,
  "publishedAt" TIMESTAMP(3),
  "publishedByUserId" INTEGER,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_inspection_template_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_template_clientSyncId_key" ON "pm_inspection_template"("clientSyncId");
CREATE INDEX "pm_inspection_template_companyId_category_status_idx" ON "pm_inspection_template"("companyId", "category", "status");
CREATE INDEX "pm_inspection_template_projectId_status_idx" ON "pm_inspection_template"("projectId", "status");
CREATE INDEX "pm_inspection_template_parentTemplateId_idx" ON "pm_inspection_template"("parentTemplateId");

ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "pm_inspection_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_inspection" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "templateVersion" INTEGER NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "siteId" INTEGER,
  "equipmentId" INTEGER,
  "workerId" INTEGER,
  "inspectorUserId" INTEGER NOT NULL,
  "status" "PmInspectionStatus" NOT NULL DEFAULT 'draft',
  "title" TEXT,
  "locationNote" VARCHAR(500),
  "answers" JSONB NOT NULL DEFAULT '{}',
  "scorePercent" DOUBLE PRECISION,
  "passed" BOOLEAN,
  "riskScore" INTEGER,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
  "reviewNotes" TEXT,
  "reviewedByUserId" INTEGER,
  "reviewedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_inspection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_clientSyncId_key" ON "pm_inspection"("clientSyncId");
CREATE INDEX "pm_inspection_projectId_status_idx" ON "pm_inspection"("projectId", "status");
CREATE INDEX "pm_inspection_companyId_createdAt_idx" ON "pm_inspection"("companyId", "createdAt");
CREATE INDEX "pm_inspection_equipmentId_status_idx" ON "pm_inspection"("equipmentId", "status");
CREATE INDEX "pm_inspection_inspectorUserId_createdAt_idx" ON "pm_inspection"("inspectorUserId", "createdAt");
CREATE INDEX "pm_inspection_workerId_status_idx" ON "pm_inspection"("workerId", "status");

ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "pm_inspection_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_deficiency" (
  "id" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "severity" "PmDeficiencySeverity" NOT NULL DEFAULT 'medium',
  "category" TEXT,
  "status" "PmDeficiencyStatus" NOT NULL DEFAULT 'open',
  "assignedUserId" INTEGER,
  "assignedWorkerId" INTEGER,
  "subcontractorCompanyId" INTEGER,
  "dueAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "cailEntryId" TEXT,
  "sifEventId" TEXT,
  "autoGenerated" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_inspection_deficiency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_deficiency_cailEntryId_key" ON "pm_inspection_deficiency"("cailEntryId");
CREATE INDEX "pm_inspection_deficiency_inspectionId_status_idx" ON "pm_inspection_deficiency"("inspectionId", "status");
CREATE INDEX "pm_inspection_deficiency_severity_status_idx" ON "pm_inspection_deficiency"("severity", "status");

ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_subcontractorCompanyId_fkey" FOREIGN KEY ("subcontractorCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_corrective_action" (
  "id" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "deficiencyId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assignedUserId" INTEGER,
  "cailEntryId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "dueAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_inspection_corrective_action_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_corrective_action_cailEntryId_key" ON "pm_inspection_corrective_action"("cailEntryId");
CREATE INDEX "pm_inspection_corrective_action_inspectionId_status_idx" ON "pm_inspection_corrective_action"("inspectionId", "status");

ALTER TABLE "pm_inspection_corrective_action" ADD CONSTRAINT "pm_inspection_corrective_action_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_attachment" (
  "id" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "deficiencyId" TEXT,
  "correctiveId" TEXT,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "annotationJson" JSONB,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_inspection_attachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_attachment_clientSyncId_key" ON "pm_inspection_attachment"("clientSyncId");
CREATE INDEX "pm_inspection_attachment_inspectionId_idx" ON "pm_inspection_attachment"("inspectionId");

ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_deficiencyId_fkey" FOREIGN KEY ("deficiencyId") REFERENCES "pm_inspection_deficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_correctiveId_fkey" FOREIGN KEY ("correctiveId") REFERENCES "pm_inspection_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_signature" (
  "id" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "signerName" TEXT,
  "signerUserId" INTEGER,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientSyncId" TEXT,
  CONSTRAINT "pm_inspection_signature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_inspection_signature_clientSyncId_key" ON "pm_inspection_signature"("clientSyncId");
CREATE INDEX "pm_inspection_signature_inspectionId_idx" ON "pm_inspection_signature"("inspectionId");

ALTER TABLE "pm_inspection_signature" ADD CONSTRAINT "pm_inspection_signature_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_signature" ADD CONSTRAINT "pm_inspection_signature_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_inspection_audit" (
  "id" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_inspection_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_inspection_audit_inspectionId_createdAt_idx" ON "pm_inspection_audit"("inspectionId", "createdAt");

ALTER TABLE "pm_inspection_audit" ADD CONSTRAINT "pm_inspection_audit_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_inspection_audit" ADD CONSTRAINT "pm_inspection_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
