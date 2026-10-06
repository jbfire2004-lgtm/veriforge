-- SIF / HECA Engine

CREATE TYPE "SifHecaSourceType" AS ENUM ('jha_flha', 'safety_form', 'inspection', 'incident', 'equipment', 'competency', 'bbo', 'general');
CREATE TYPE "SifHecaEventStatus" AS ENUM ('ingested', 'scored', 'review_required', 'approved', 'rejected', 'closed');
CREATE TYPE "SifPotentialCategory" AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE "sif_indicator" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "triggerRule" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sif_indicator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "heca_category" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "keywordPatterns" JSONB NOT NULL DEFAULT '[]',
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "severityDefault" INTEGER NOT NULL DEFAULT 3,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "heca_category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sif_heca_event" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "sourceType" "SifHecaSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL DEFAULT '',
    "status" "SifHecaEventStatus" NOT NULL DEFAULT 'ingested',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rawPayload" JSONB NOT NULL DEFAULT '{}',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sif_heca_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sif_score" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sifScore" INTEGER NOT NULL,
    "sifCategory" "SifPotentialCategory" NOT NULL,
    "severityComponent" INTEGER NOT NULL DEFAULT 0,
    "likelihoodComponent" INTEGER NOT NULL DEFAULT 0,
    "energyComponent" INTEGER NOT NULL DEFAULT 0,
    "controlComponent" INTEGER NOT NULL DEFAULT 0,
    "competencyComponent" INTEGER NOT NULL DEFAULT 0,
    "equipmentComponent" INTEGER NOT NULL DEFAULT 0,
    "environmentComponent" INTEGER NOT NULL DEFAULT 0,
    "historyComponent" INTEGER NOT NULL DEFAULT 0,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredActions" JSONB NOT NULL DEFAULT '[]',
    "explainability" JSONB NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sif_score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "heca_score" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "hecaCategoryCode" TEXT NOT NULL,
    "hecaCategoryLabel" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "hecaRiskScore" INTEGER NOT NULL,
    "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredCorrective" JSONB NOT NULL DEFAULT '[]',
    "explainability" JSONB NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "heca_score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sif_heca_link" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "linkedType" "SifHecaSourceType" NOT NULL,
    "linkedId" TEXT NOT NULL,
    "linkedItemId" TEXT NOT NULL DEFAULT '',
    "correlation" DOUBLE PRECISION,
    CONSTRAINT "sif_heca_link_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sif_heca_corrective_action" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedUserId" INTEGER,
    "cailEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sif_heca_corrective_action_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sif_heca_audit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sif_heca_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sif_heca_event_sourceType_sourceId_sourceItemId_key" ON "sif_heca_event"("sourceType", "sourceId", "sourceItemId");
CREATE INDEX "sif_heca_event_projectId_status_idx" ON "sif_heca_event"("projectId", "status");
CREATE INDEX "sif_heca_event_companyId_createdAt_idx" ON "sif_heca_event"("companyId", "createdAt");
CREATE INDEX "sif_heca_event_workerId_status_idx" ON "sif_heca_event"("workerId", "status");
CREATE UNIQUE INDEX "sif_score_eventId_key" ON "sif_score"("eventId");
CREATE UNIQUE INDEX "heca_score_eventId_key" ON "heca_score"("eventId");
CREATE INDEX "heca_score_hecaCategoryCode_idx" ON "heca_score"("hecaCategoryCode");
CREATE INDEX "sif_heca_link_eventId_idx" ON "sif_heca_link"("eventId");
CREATE INDEX "sif_heca_corrective_action_eventId_status_idx" ON "sif_heca_corrective_action"("eventId", "status");
CREATE INDEX "sif_heca_audit_eventId_createdAt_idx" ON "sif_heca_audit"("eventId", "createdAt");
CREATE INDEX "sif_indicator_companyId_code_idx" ON "sif_indicator"("companyId", "code");
CREATE INDEX "sif_indicator_projectId_code_idx" ON "sif_indicator"("projectId", "code");
CREATE INDEX "heca_category_companyId_code_idx" ON "heca_category"("companyId", "code");

ALTER TABLE "sif_indicator" ADD CONSTRAINT "sif_indicator_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_indicator" ADD CONSTRAINT "sif_indicator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "heca_category" ADD CONSTRAINT "heca_category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "heca_category" ADD CONSTRAINT "heca_category_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sif_score" ADD CONSTRAINT "sif_score_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "heca_score" ADD CONSTRAINT "heca_score_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_link" ADD CONSTRAINT "sif_heca_link_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_corrective_action" ADD CONSTRAINT "sif_heca_corrective_action_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_audit" ADD CONSTRAINT "sif_heca_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sif_heca_audit" ADD CONSTRAINT "sif_heca_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
