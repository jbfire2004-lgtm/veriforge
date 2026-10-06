-- PM Safety Events (Incidents / Near Miss / Observations)

CREATE TYPE "PmSafetyEventType" AS ENUM (
  'incident_injury', 'incident_property', 'incident_environmental', 'incident_equipment',
  'near_miss', 'hazard_observation', 'positive_observation', 'behavioral_observation',
  'equipment_failure', 'security_event', 'custom'
);

CREATE TYPE "PmSafetyEventStatus" AS ENUM (
  'draft', 'submitted', 'review_required', 'approved', 'rejected', 'locked', 'closed'
);

CREATE TYPE "PmSafetyEventSeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "PmRcaMethod" AS ENUM ('five_why', 'fishbone', 'taproot');

CREATE TABLE "pm_safety_event_type_library" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "baseType" "PmSafetyEventType" NOT NULL DEFAULT 'custom',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_type_library_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_type_library_companyId_code_key" ON "pm_safety_event_type_library"("companyId", "code");
CREATE INDEX "pm_safety_event_type_library_projectId_code_idx" ON "pm_safety_event_type_library"("projectId", "code");
ALTER TABLE "pm_safety_event_type_library" ADD CONSTRAINT "pm_safety_event_type_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_type_library" ADD CONSTRAINT "pm_safety_event_type_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_root_cause_library" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_root_cause_library_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_root_cause_library_companyId_code_key" ON "pm_root_cause_library"("companyId", "code");
ALTER TABLE "pm_root_cause_library" ADD CONSTRAINT "pm_root_cause_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_contributing_factor_library" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "category" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_contributing_factor_library_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_contributing_factor_library_companyId_code_key" ON "pm_contributing_factor_library"("companyId", "code");
ALTER TABLE "pm_contributing_factor_library" ADD CONSTRAINT "pm_contributing_factor_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "siteId" INTEGER,
  "eventType" "PmSafetyEventType" NOT NULL,
  "customTypeCode" TEXT,
  "status" "PmSafetyEventStatus" NOT NULL DEFAULT 'draft',
  "severity" "PmSafetyEventSeverity" NOT NULL DEFAULT 'low',
  "likelihood" INTEGER NOT NULL DEFAULT 1,
  "riskScore" INTEGER NOT NULL DEFAULT 0,
  "sifEventId" TEXT,
  "hecaCategoryCode" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locationNote" VARCHAR(500),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "weatherJson" JSONB NOT NULL DEFAULT '{}',
  "propertyDamageJson" JSONB NOT NULL DEFAULT '{}',
  "environmentalImpactJson" JSONB NOT NULL DEFAULT '{}',
  "intakeWizardStep" INTEGER NOT NULL DEFAULT 0,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
  "reviewNotes" TEXT,
  "reviewedByUserId" INTEGER,
  "reviewedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdByUserId" INTEGER NOT NULL,
  "legacyIncidentId" INTEGER,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_safety_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_clientSyncId_key" ON "pm_safety_event"("clientSyncId");
CREATE INDEX "pm_safety_event_projectId_status_idx" ON "pm_safety_event"("projectId", "status");
CREATE INDEX "pm_safety_event_companyId_eventType_createdAt_idx" ON "pm_safety_event"("companyId", "eventType", "createdAt");
CREATE INDEX "pm_safety_event_severity_status_idx" ON "pm_safety_event"("severity", "status");
CREATE INDEX "pm_safety_event_legacyIncidentId_idx" ON "pm_safety_event"("legacyIncidentId");

ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_version" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "authorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_version_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_version_eventId_version_key" ON "pm_safety_event_version"("eventId", "version");
ALTER TABLE "pm_safety_event_version" ADD CONSTRAINT "pm_safety_event_version_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_injury" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "workerId" INTEGER,
  "bodyPart" TEXT,
  "injuryType" TEXT,
  "treatment" TEXT,
  "firstAid" BOOLEAN NOT NULL DEFAULT false,
  "medicalAid" BOOLEAN NOT NULL DEFAULT false,
  "lostTime" BOOLEAN NOT NULL DEFAULT false,
  "modifiedWork" BOOLEAN NOT NULL DEFAULT false,
  "returnToWorkPlan" TEXT,
  "wcbClaimNumber" TEXT,
  "wcbStatus" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_injury_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_injury_eventId_idx" ON "pm_safety_event_injury"("eventId");
ALTER TABLE "pm_safety_event_injury" ADD CONSTRAINT "pm_safety_event_injury_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_injury" ADD CONSTRAINT "pm_safety_event_injury_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_person" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "workerId" INTEGER,
  "role" TEXT NOT NULL,
  "name" TEXT,
  "companyId" INTEGER,
  "notes" TEXT,
  CONSTRAINT "pm_safety_event_person_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_person_eventId_idx" ON "pm_safety_event_person"("eventId");
ALTER TABLE "pm_safety_event_person" ADD CONSTRAINT "pm_safety_event_person_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_person" ADD CONSTRAINT "pm_safety_event_person_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_equipment" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "equipmentId" INTEGER NOT NULL,
  "conditionScore" INTEGER,
  "failureNotes" TEXT,
  "lockoutApplied" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "pm_safety_event_equipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_equipment_eventId_equipmentId_key" ON "pm_safety_event_equipment"("eventId", "equipmentId");
ALTER TABLE "pm_safety_event_equipment" ADD CONSTRAINT "pm_safety_event_equipment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_equipment" ADD CONSTRAINT "pm_safety_event_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_witness" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact" TEXT,
  "workerId" INTEGER,
  "capturedByUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_witness_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_witness_eventId_idx" ON "pm_safety_event_witness"("eventId");
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_capturedByUserId_fkey" FOREIGN KEY ("capturedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_statement" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "witnessId" TEXT,
  "statementText" TEXT NOT NULL,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP(3),
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_statement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_statement_clientSyncId_key" ON "pm_safety_event_statement"("clientSyncId");
CREATE INDEX "pm_safety_event_statement_eventId_idx" ON "pm_safety_event_statement"("eventId");
ALTER TABLE "pm_safety_event_statement" ADD CONSTRAINT "pm_safety_event_statement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_statement" ADD CONSTRAINT "pm_safety_event_statement_witnessId_fkey" FOREIGN KEY ("witnessId") REFERENCES "pm_safety_event_witness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_attachment" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "injuryId" TEXT,
  "equipmentLinkId" TEXT,
  "correctiveId" TEXT,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "annotationJson" JSONB,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_attachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_attachment_clientSyncId_key" ON "pm_safety_event_attachment"("clientSyncId");
CREATE INDEX "pm_safety_event_attachment_eventId_idx" ON "pm_safety_event_attachment"("eventId");
ALTER TABLE "pm_safety_event_attachment" ADD CONSTRAINT "pm_safety_event_attachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_root_cause" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "method" "PmRcaMethod" NOT NULL DEFAULT 'five_why',
  "category" TEXT,
  "description" TEXT NOT NULL,
  "whyChain" JSONB NOT NULL DEFAULT '[]',
  "fishboneJson" JSONB NOT NULL DEFAULT '{}',
  "taprootJson" JSONB NOT NULL DEFAULT '{}',
  "libraryCode" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_root_cause_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_root_cause_eventId_idx" ON "pm_safety_event_root_cause"("eventId");
ALTER TABLE "pm_safety_event_root_cause" ADD CONSTRAINT "pm_safety_event_root_cause_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_contributing_factor" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "libraryCode" TEXT,
  "label" TEXT NOT NULL,
  "category" TEXT,
  "notes" TEXT,
  CONSTRAINT "pm_safety_event_contributing_factor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_contributing_factor_eventId_idx" ON "pm_safety_event_contributing_factor"("eventId");
ALTER TABLE "pm_safety_event_contributing_factor" ADD CONSTRAINT "pm_safety_event_contributing_factor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_corrective_action" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "rootCauseId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assignedUserId" INTEGER,
  "cailEntryId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "dueAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_corrective_action_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_corrective_action_cailEntryId_key" ON "pm_safety_event_corrective_action"("cailEntryId");
CREATE INDEX "pm_safety_event_corrective_action_eventId_status_idx" ON "pm_safety_event_corrective_action"("eventId", "status");
ALTER TABLE "pm_safety_event_corrective_action" ADD CONSTRAINT "pm_safety_event_corrective_action_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pm_safety_event_audit" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_safety_event_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pm_safety_event_audit_eventId_createdAt_idx" ON "pm_safety_event_audit"("eventId", "createdAt");
ALTER TABLE "pm_safety_event_audit" ADD CONSTRAINT "pm_safety_event_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_safety_event_audit" ADD CONSTRAINT "pm_safety_event_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
