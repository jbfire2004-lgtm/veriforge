-- PM Unified Corrective Action Engine (extends canonical CAPA tables)

ALTER TABLE "pm_corrective_action" RENAME TO "corrective_actions";
ALTER TABLE "pm_corrective_action_assignee" RENAME TO "corrective_action_assignments";
ALTER TABLE "pm_corrective_action_escalation" RENAME TO "corrective_action_escalations";
ALTER TABLE "pm_corrective_action_verification" RENAME TO "corrective_action_verifications";
ALTER TABLE "pm_corrective_action_attachment" RENAME TO "corrective_action_attachments";
ALTER TABLE "pm_corrective_action_audit" RENAME TO "corrective_action_audit";

ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "hazardId" TEXT;
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "controlId" TEXT;
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "rootCauseId" TEXT;
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "publishVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "severityLevel" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "priorityLevel" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "evidenceRequirementsJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "verificationRequirementsJson" JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "corrective_actions_hazardId_idx" ON "corrective_actions"("hazardId");
CREATE INDEX IF NOT EXISTS "corrective_actions_controlId_idx" ON "corrective_actions"("controlId");
CREATE INDEX IF NOT EXISTS "corrective_actions_workerId_status_idx" ON "corrective_actions"("workerId", "status");

CREATE TYPE "PmCorrectiveActionLinkType" AS ENUM (
  'hazard', 'control', 'jha_flha', 'inspection', 'incident', 'equipment',
  'sds', 'training', 'site_access', 'emergency', 'pm_task', 'sif_heca', 'worker'
);

CREATE TABLE "corrective_action_versions" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshotJson" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedById" INTEGER,
  CONSTRAINT "corrective_action_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "corrective_action_versions_actionId_version_key" ON "corrective_action_versions"("actionId", "version");
ALTER TABLE "corrective_action_versions" ADD CONSTRAINT "corrective_action_versions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "corrective_action_links" (
  "id" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "linkType" "PmCorrectiveActionLinkType" NOT NULL,
  "linkedId" TEXT NOT NULL,
  "linkedMeta" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "corrective_action_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "corrective_action_links_actionId_linkType_linkedId_key" ON "corrective_action_links"("actionId", "linkType", "linkedId");
CREATE INDEX "corrective_action_links_linkType_linkedId_idx" ON "corrective_action_links"("linkType", "linkedId");
ALTER TABLE "corrective_action_links" ADD CONSTRAINT "corrective_action_links_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_capa_overrides" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "actionId" TEXT,
  "ruleType" TEXT NOT NULL,
  "ruleKey" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "approvedById" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_capa_overrides_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pm_capa_overrides_companyId_projectId_active_idx" ON "pm_capa_overrides"("companyId", "projectId", "active");
CREATE INDEX "pm_capa_overrides_expiresAt_idx" ON "pm_capa_overrides"("expiresAt");
ALTER TABLE "pm_capa_overrides" ADD CONSTRAINT "pm_capa_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_capa_overrides" ADD CONSTRAINT "pm_capa_overrides_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_capa_offline_cache" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_capa_offline_cache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_capa_offline_cache_cacheKey_key" ON "pm_capa_offline_cache"("cacheKey");
CREATE INDEX "pm_capa_offline_cache_companyId_idx" ON "pm_capa_offline_cache"("companyId");
CREATE INDEX "pm_capa_offline_cache_projectId_idx" ON "pm_capa_offline_cache"("projectId");
ALTER TABLE "pm_capa_offline_cache" ADD CONSTRAINT "pm_capa_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_capa_offline_cache" ADD CONSTRAINT "pm_capa_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "corrective_action_audit_eventType_createdAt_idx" ON "corrective_action_audit"("eventType", "createdAt");
