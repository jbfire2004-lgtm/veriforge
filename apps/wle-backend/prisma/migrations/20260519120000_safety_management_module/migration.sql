-- Safety Management Module: site access, SDS, emergency muster, station heartbeat

CREATE TYPE "MusterEventStatus" AS ENUM ('activated', 'accounting', 'all_clear', 'cancelled');

CREATE TABLE "project_safety_plan" (
    "projectId" INTEGER NOT NULL,
    "requiredDefinitionIds" JSONB NOT NULL DEFAULT '["daily-flha"]',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_safety_plan_pkey" PRIMARY KEY ("projectId")
);

CREATE TABLE "site_access_rule" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "requiresFlhaHours" INTEGER NOT NULL DEFAULT 24,
    "requiresTrainingCodes" JSONB NOT NULL DEFAULT '[]',
    "requiresOrientation" BOOLEAN NOT NULL DEFAULT true,
    "equipmentCategoryIds" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_access_rule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_access_grant" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedByUserId" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "sourceFormId" TEXT,
    "evaluationJson" JSONB,
    CONSTRAINT "site_access_grant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sds_document" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "manufacturer" TEXT,
    "casNumbers" JSONB NOT NULL DEFAULT '[]',
    "hazardClasses" JSONB NOT NULL DEFAULT '[]',
    "storageKey" TEXT,
    "revisionDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sds_document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chemical_inventory_item" (
    "id" TEXT NOT NULL,
    "siteId" INTEGER NOT NULL,
    "sdsDocumentId" TEXT NOT NULL,
    "quantity" DECIMAL(12,3),
    "unit" TEXT,
    "locationNote" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chemical_inventory_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_document" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "storageKey" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "policy_document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_acknowledgment" (
    "id" TEXT NOT NULL,
    "policyDocumentId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureData" TEXT,
    CONSTRAINT "policy_acknowledgment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emergency_plan" (
    "id" TEXT NOT NULL,
    "siteId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'evacuation',
    "contentJson" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "emergency_plan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "muster_event" (
    "id" TEXT NOT NULL,
    "siteId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "status" "MusterEventStatus" NOT NULL DEFAULT 'activated',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredByUser" INTEGER,
    "allClearAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "muster_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "muster_checkin" (
    "id" TEXT NOT NULL,
    "musterEventId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'manual',
    CONSTRAINT "muster_checkin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safety_station_heartbeat" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "safety_station_heartbeat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_access_rule_projectId_zoneCode_key" ON "site_access_rule"("projectId", "zoneCode");
CREATE INDEX "site_access_rule_projectId_active_idx" ON "site_access_rule"("projectId", "active");
CREATE INDEX "site_access_grant_workerId_projectId_zoneCode_idx" ON "site_access_grant"("workerId", "projectId", "zoneCode");
CREATE INDEX "site_access_grant_projectId_grantedAt_idx" ON "site_access_grant"("projectId", "grantedAt");
CREATE INDEX "sds_document_companyId_productName_idx" ON "sds_document"("companyId", "productName");
CREATE INDEX "chemical_inventory_item_siteId_idx" ON "chemical_inventory_item"("siteId");
CREATE INDEX "chemical_inventory_item_sdsDocumentId_idx" ON "chemical_inventory_item"("sdsDocumentId");
CREATE INDEX "policy_document_companyId_category_idx" ON "policy_document"("companyId", "category");
CREATE UNIQUE INDEX "policy_acknowledgment_policyDocumentId_workerId_key" ON "policy_acknowledgment"("policyDocumentId", "workerId");
CREATE INDEX "policy_acknowledgment_workerId_idx" ON "policy_acknowledgment"("workerId");
CREATE INDEX "emergency_plan_siteId_active_idx" ON "emergency_plan"("siteId", "active");
CREATE INDEX "muster_event_siteId_status_idx" ON "muster_event"("siteId", "status");
CREATE INDEX "muster_event_projectId_triggeredAt_idx" ON "muster_event"("projectId", "triggeredAt");
CREATE UNIQUE INDEX "muster_checkin_musterEventId_workerId_key" ON "muster_checkin"("musterEventId", "workerId");
CREATE INDEX "muster_checkin_musterEventId_idx" ON "muster_checkin"("musterEventId");
CREATE INDEX "safety_station_heartbeat_stationId_createdAt_idx" ON "safety_station_heartbeat"("stationId", "createdAt");

ALTER TABLE "project_safety_plan" ADD CONSTRAINT "project_safety_plan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_access_rule" ADD CONSTRAINT "site_access_rule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_sdsDocumentId_fkey" FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "policy_document" ADD CONSTRAINT "policy_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "policy_acknowledgment" ADD CONSTRAINT "policy_acknowledgment_policyDocumentId_fkey" FOREIGN KEY ("policyDocumentId") REFERENCES "policy_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "policy_acknowledgment" ADD CONSTRAINT "policy_acknowledgment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_event" ADD CONSTRAINT "muster_event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_event" ADD CONSTRAINT "muster_event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "muster_event" ADD CONSTRAINT "muster_event_triggeredByUser_fkey" FOREIGN KEY ("triggeredByUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "muster_checkin" ADD CONSTRAINT "muster_checkin_musterEventId_fkey" FOREIGN KEY ("musterEventId") REFERENCES "muster_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "muster_checkin" ADD CONSTRAINT "muster_checkin_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_station_heartbeat" ADD CONSTRAINT "safety_station_heartbeat_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
