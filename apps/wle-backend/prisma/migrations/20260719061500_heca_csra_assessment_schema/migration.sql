-- HECA CSRA structured assessment schema
-- energy_source, exposure_level, control_type, sif_potential,
-- verification_status, recommendations, attachments, linked_action_id

CREATE TYPE "HecaEnergySourceType" AS ENUM (
  'gravity', 'motion', 'mechanical', 'electrical', 'pressure',
  'chemical', 'thermal', 'radiation', 'biological'
);

CREATE TYPE "HecaControlType" AS ENUM (
  'elimination', 'substitution', 'engineering', 'administrative', 'ppe'
);

CREATE TYPE "HecaControlClass" AS ENUM ('direct', 'alternative');

CREATE TYPE "HecaSifPotential" AS ENUM (
  'none', 'low', 'medium', 'high', 'critical'
);

CREATE TYPE "HecaVerificationStatus" AS ENUM (
  'not_started', 'pending', 'verified', 'failed', 'waived'
);

CREATE TYPE "HecaProximity" AS ENUM ('contact', 'near', 'zone', 'remote');

CREATE TYPE "HecaRecommendationPriority" AS ENUM (
  'critical', 'high', 'medium', 'low'
);

CREATE TYPE "HecaRecommendationStatus" AS ENUM (
  'open', 'accepted', 'dismissed', 'implemented', 'linked'
);

-- Backfill linked_action_id on existing SIF/HECA corrective actions
ALTER TABLE "sif_heca_corrective_action"
  ADD COLUMN "linked_action_id" TEXT;

CREATE INDEX "sif_heca_corrective_action_linked_action_id_idx"
  ON "sif_heca_corrective_action"("linked_action_id");

CREATE TABLE "heca_csra_assessment" (
  "id" TEXT NOT NULL,
  "eventId" TEXT,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "workScope" TEXT,
  "locationNote" VARCHAR(500),
  "environmentNote" TEXT,
  "equipmentNote" TEXT,
  "exposure_level" INTEGER NOT NULL DEFAULT 3,
  "proximity" "HecaProximity" NOT NULL DEFAULT 'zone',
  "sif_potential" "HecaSifPotential" NOT NULL DEFAULT 'none',
  "sifScore" INTEGER NOT NULL DEFAULT 0,
  "sifApplies" BOOLEAN NOT NULL DEFAULT false,
  "verification_status" "HecaVerificationStatus" NOT NULL DEFAULT 'not_started',
  "linked_action_id" TEXT,
  "methodology" TEXT NOT NULL DEFAULT 'CSRA',
  "revision" TEXT,
  "readyForWork" BOOLEAN NOT NULL DEFAULT false,
  "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
  "documentJson" JSONB NOT NULL DEFAULT '{}',
  "verifiedAt" TIMESTAMP(3),
  "verifiedByUserId" INTEGER,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "heca_csra_assessment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "heca_csra_assessment_eventId_key" ON "heca_csra_assessment"("eventId");
CREATE INDEX "heca_csra_assessment_projectId_verification_status_idx"
  ON "heca_csra_assessment"("projectId", "verification_status");
CREATE INDEX "heca_csra_assessment_companyId_createdAt_idx"
  ON "heca_csra_assessment"("companyId", "createdAt");
CREATE INDEX "heca_csra_assessment_sif_potential_idx"
  ON "heca_csra_assessment"("sif_potential");
CREATE INDEX "heca_csra_assessment_linked_action_id_idx"
  ON "heca_csra_assessment"("linked_action_id");

CREATE TABLE "heca_csra_energy_source" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "energy_source" "HecaEnergySourceType" NOT NULL,
  "label" TEXT NOT NULL,
  "exposure_level" INTEGER NOT NULL DEFAULT 1,
  "magnitude" INTEGER NOT NULL DEFAULT 1,
  "highEnergy" BOOLEAN NOT NULL DEFAULT false,
  "evidenceJson" JSONB NOT NULL DEFAULT '[]',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "heca_csra_energy_source_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "heca_csra_energy_source_assessmentId_energy_source_key"
  ON "heca_csra_energy_source"("assessmentId", "energy_source");
CREATE INDEX "heca_csra_energy_source_assessmentId_idx"
  ON "heca_csra_energy_source"("assessmentId");

CREATE TABLE "heca_csra_control" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "control_type" "HecaControlType" NOT NULL,
  "controlClass" "HecaControlClass" NOT NULL DEFAULT 'alternative',
  "description" TEXT NOT NULL,
  "adequate" BOOLEAN,
  "effectivenessScore" INTEGER,
  "verification_status" "HecaVerificationStatus" NOT NULL DEFAULT 'not_started',
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "linkedEnergiesJson" JSONB NOT NULL DEFAULT '[]',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "heca_csra_control_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "heca_csra_control_assessmentId_control_type_idx"
  ON "heca_csra_control"("assessmentId", "control_type");
CREATE INDEX "heca_csra_control_assessmentId_verification_status_idx"
  ON "heca_csra_control"("assessmentId", "verification_status");

CREATE TABLE "heca_csra_recommendation" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "priority" "HecaRecommendationPriority" NOT NULL DEFAULT 'medium',
  "status" "HecaRecommendationStatus" NOT NULL DEFAULT 'open',
  "control_type" "HecaControlType" NOT NULL,
  "controlClass" "HecaControlClass" NOT NULL DEFAULT 'direct',
  "description" TEXT NOT NULL,
  "energy_source" "HecaEnergySourceType",
  "reason" TEXT,
  "linked_action_id" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "heca_csra_recommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "heca_csra_recommendation_assessmentId_status_idx"
  ON "heca_csra_recommendation"("assessmentId", "status");
CREATE INDEX "heca_csra_recommendation_linked_action_id_idx"
  ON "heca_csra_recommendation"("linked_action_id");

CREATE TABLE "heca_csra_attachment" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT,
  "storageKey" TEXT,
  "dataUrl" TEXT,
  "byteSize" INTEGER,
  "annotationJson" JSONB,
  "uploadedByUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "heca_csra_attachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "heca_csra_attachment_assessmentId_idx"
  ON "heca_csra_attachment"("assessmentId");

ALTER TABLE "heca_csra_assessment"
  ADD CONSTRAINT "heca_csra_assessment_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_assessment"
  ADD CONSTRAINT "heca_csra_assessment_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_assessment"
  ADD CONSTRAINT "heca_csra_assessment_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "heca_csra_assessment"
  ADD CONSTRAINT "heca_csra_assessment_linked_action_id_fkey"
  FOREIGN KEY ("linked_action_id") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "heca_csra_assessment"
  ADD CONSTRAINT "heca_csra_assessment_verifiedByUserId_fkey"
  FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "heca_csra_energy_source"
  ADD CONSTRAINT "heca_csra_energy_source_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "heca_csra_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_control"
  ADD CONSTRAINT "heca_csra_control_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "heca_csra_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_recommendation"
  ADD CONSTRAINT "heca_csra_recommendation_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "heca_csra_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_recommendation"
  ADD CONSTRAINT "heca_csra_recommendation_linked_action_id_fkey"
  FOREIGN KEY ("linked_action_id") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "heca_csra_attachment"
  ADD CONSTRAINT "heca_csra_attachment_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "heca_csra_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "heca_csra_attachment"
  ADD CONSTRAINT "heca_csra_attachment_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
