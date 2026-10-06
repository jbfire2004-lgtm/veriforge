-- AlterEnum
CREATE TYPE "BboBehaviorCategory" AS ENUM (
  'body_position',
  'ppe',
  'tools_equipment',
  'procedures',
  'housekeeping',
  'line_of_fire',
  'other'
);

CREATE TYPE "PpePreUseOverallResult" AS ENUM ('pass', 'fail', 'conditional');

-- AlterTable bbo_observation
ALTER TABLE "bbo_observation"
  ADD COLUMN IF NOT EXISTS "workActivity" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "workersObservedCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "behaviorCategory" "BboBehaviorCategory",
  ADD COLUMN IF NOT EXISTS "safeBehaviors" TEXT,
  ADD COLUMN IF NOT EXISTS "atRiskBehaviors" TEXT,
  ADD COLUMN IF NOT EXISTS "antecedents" JSONB,
  ADD COLUMN IF NOT EXISTS "feedbackGiven" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "feedbackNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "workerResponse" TEXT,
  ADD COLUMN IF NOT EXISTS "actionAgreed" TEXT,
  ADD COLUMN IF NOT EXISTS "actionOwnerUserId" INTEGER,
  ADD COLUMN IF NOT EXISTS "actionDueAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "steeringEscalate" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "bbo_observation_projectId_behaviorCategory_idx"
  ON "bbo_observation"("projectId", "behaviorCategory");

ALTER TABLE "bbo_observation"
  ADD CONSTRAINT "bbo_observation_actionOwnerUserId_fkey"
  FOREIGN KEY ("actionOwnerUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable ppe_pre_use_inspection
CREATE TABLE IF NOT EXISTS "ppe_pre_use_inspection" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "companyId" INTEGER NOT NULL,
  "workerUserId" INTEGER NOT NULL,
  "workerId" INTEGER,
  "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locationNote" VARCHAR(500),
  "taskType" VARCHAR(200),
  "overallResult" "PpePreUseOverallResult" NOT NULL,
  "items" JSONB NOT NULL,
  "deficiencies" TEXT,
  "removedFromService" BOOLEAN NOT NULL DEFAULT false,
  "acknowledgedSafeToWork" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ppe_pre_use_inspection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ppe_pre_use_inspection_projectId_inspectedAt_idx"
  ON "ppe_pre_use_inspection"("projectId", "inspectedAt");
CREATE INDEX IF NOT EXISTS "ppe_pre_use_inspection_companyId_inspectedAt_idx"
  ON "ppe_pre_use_inspection"("companyId", "inspectedAt");
CREATE INDEX IF NOT EXISTS "ppe_pre_use_inspection_workerUserId_inspectedAt_idx"
  ON "ppe_pre_use_inspection"("workerUserId", "inspectedAt");

ALTER TABLE "ppe_pre_use_inspection"
  ADD CONSTRAINT "ppe_pre_use_inspection_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ppe_pre_use_inspection"
  ADD CONSTRAINT "ppe_pre_use_inspection_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ppe_pre_use_inspection"
  ADD CONSTRAINT "ppe_pre_use_inspection_workerUserId_fkey"
  FOREIGN KEY ("workerUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ppe_pre_use_inspection"
  ADD CONSTRAINT "ppe_pre_use_inspection_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
