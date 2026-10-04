-- PM Corrective Action Management (unified CAPA on CAIL)

CREATE TYPE "PmCorrectiveActionType" AS ENUM (
  'immediate', 'interim_control', 'permanent', 'preventive',
  'equipment_repair', 'training_requirement', 'policy_update'
);

CREATE TYPE "PmCorrectiveActionStatus" AS ENUM (
  'draft', 'open', 'assigned', 'in_progress', 'verification_pending', 'verified', 'closed', 'cancelled'
);

CREATE TYPE "PmCapaAssigneeRole" AS ENUM ('primary', 'secondary', 'delegate', 'verifier');

CREATE TABLE "pm_capa_company_config" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "dueDaysLow" INTEGER NOT NULL DEFAULT 30,
  "dueDaysMedium" INTEGER NOT NULL DEFAULT 14,
  "dueDaysHigh" INTEGER NOT NULL DEFAULT 7,
  "dueDaysCritical" INTEGER NOT NULL DEFAULT 1,
  "escalationRules" JSONB NOT NULL DEFAULT '{}',
  "assignmentRules" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_capa_company_config_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_capa_company_config_companyId_key" ON "pm_capa_company_config"("companyId");
ALTER TABLE "pm_capa_company_config" ADD CONSTRAINT "pm_capa_company_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action" (
  "id" TEXT NOT NULL,
  "cailEntryId" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "siteId" INTEGER,
  "sourceModule" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "sourceItemId" TEXT NOT NULL DEFAULT '',
  "deficiencyId" TEXT,
  "actionType" "PmCorrectiveActionType" NOT NULL DEFAULT 'permanent',
  "status" "PmCorrectiveActionStatus" NOT NULL DEFAULT 'draft',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "severityScore" INTEGER NOT NULL DEFAULT 50,
  "priorityScore" INTEGER NOT NULL DEFAULT 50,
  "escalationLevel" INTEGER NOT NULL DEFAULT 0,
  "dueAt" TIMESTAMP(3),
  "overdueAt" TIMESTAMP(3),
  "equipmentId" INTEGER,
  "workerId" INTEGER,
  "subcontractorCompanyId" INTEGER,
  "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
  "verifiedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdByUserId" INTEGER NOT NULL,
  "verifiedByUserId" INTEGER,
  "parentActionId" TEXT,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_corrective_action_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_corrective_action_cailEntryId_key" ON "pm_corrective_action"("cailEntryId");
CREATE UNIQUE INDEX "pm_corrective_action_clientSyncId_key" ON "pm_corrective_action"("clientSyncId");
CREATE INDEX "pm_corrective_action_projectId_status_idx" ON "pm_corrective_action"("projectId", "status");
CREATE INDEX "pm_corrective_action_companyId_priorityScore_idx" ON "pm_corrective_action"("companyId", "priorityScore");
CREATE INDEX "pm_corrective_action_dueAt_status_idx" ON "pm_corrective_action"("dueAt", "status");
CREATE INDEX "pm_corrective_action_sourceModule_sourceId_idx" ON "pm_corrective_action"("sourceModule", "sourceId");
CREATE INDEX "pm_corrective_action_equipmentId_status_idx" ON "pm_corrective_action"("equipmentId", "status");

ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action" ADD CONSTRAINT "pm_corrective_action_parentActionId_fkey" FOREIGN KEY ("parentActionId") REFERENCES "pm_corrective_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_assignee" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "userId" INTEGER,
  "workerId" INTEGER,
  "role" "PmCapaAssigneeRole" NOT NULL DEFAULT 'primary',
  "delegatedFrom" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  CONSTRAINT "pm_corrective_action_assignee_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_corrective_action_assignee_actionId_idx" ON "pm_corrective_action_assignee"("actionId");
CREATE INDEX "pm_corrective_action_assignee_userId_idx" ON "pm_corrective_action_assignee"("userId");
ALTER TABLE "pm_corrective_action_assignee" ADD CONSTRAINT "pm_corrective_action_assignee_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action_assignee" ADD CONSTRAINT "pm_corrective_action_assignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_escalation" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "escalatedToUserId" INTEGER,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "payload" JSONB,
  CONSTRAINT "pm_corrective_action_escalation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_corrective_action_escalation_actionId_level_idx" ON "pm_corrective_action_escalation"("actionId", "level");
ALTER TABLE "pm_corrective_action_escalation" ADD CONSTRAINT "pm_corrective_action_escalation_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_verification" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "verifierUserId" INTEGER NOT NULL,
  "role" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "notes" TEXT,
  "evidenceJson" JSONB NOT NULL DEFAULT '[]',
  "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_corrective_action_verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_corrective_action_verification_actionId_idx" ON "pm_corrective_action_verification"("actionId");
ALTER TABLE "pm_corrective_action_verification" ADD CONSTRAINT "pm_corrective_action_verification_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action_verification" ADD CONSTRAINT "pm_corrective_action_verification_verifierUserId_fkey" FOREIGN KEY ("verifierUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_attachment" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "phase" TEXT NOT NULL DEFAULT 'evidence',
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_corrective_action_attachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_corrective_action_attachment_clientSyncId_key" ON "pm_corrective_action_attachment"("clientSyncId");
CREATE INDEX "pm_corrective_action_attachment_actionId_idx" ON "pm_corrective_action_attachment"("actionId");
ALTER TABLE "pm_corrective_action_attachment" ADD CONSTRAINT "pm_corrective_action_attachment_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_signature" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "signerUserId" INTEGER,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_corrective_action_signature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_corrective_action_signature_actionId_idx" ON "pm_corrective_action_signature"("actionId");
ALTER TABLE "pm_corrective_action_signature" ADD CONSTRAINT "pm_corrective_action_signature_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_corrective_action_audit" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_corrective_action_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_corrective_action_audit_actionId_createdAt_idx" ON "pm_corrective_action_audit"("actionId", "createdAt");
ALTER TABLE "pm_corrective_action_audit" ADD CONSTRAINT "pm_corrective_action_audit_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_corrective_action_audit" ADD CONSTRAINT "pm_corrective_action_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
