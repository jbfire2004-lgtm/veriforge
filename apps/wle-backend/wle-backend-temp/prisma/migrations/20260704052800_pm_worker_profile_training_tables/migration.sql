-- Targeted backfill for PM worker safety runtime tables used by
-- training + project safety flows.

CREATE TABLE IF NOT EXISTS "worker_profiles" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "companyId" INTEGER,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
  "roleType" TEXT,
  "tradeCode" TEXT,
  "safetyScore" INTEGER NOT NULL DEFAULT 100,
  "riskLevel" "PmProjectSafetyRiskLevel" NOT NULL DEFAULT 'low',
  "scoreFactorsJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "requiredActionsJson" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
  "metadataJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_profiles_workerId_key"
  ON "worker_profiles"("workerId");
CREATE UNIQUE INDEX IF NOT EXISTS "worker_profiles_clientSyncId_key"
  ON "worker_profiles"("clientSyncId");
CREATE INDEX IF NOT EXISTS "worker_profiles_companyId_riskLevel_idx"
  ON "worker_profiles"("companyId", "riskLevel");
CREATE INDEX IF NOT EXISTS "worker_profiles_safetyScore_idx"
  ON "worker_profiles"("safetyScore");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'worker_profiles_workerId_fkey'
  ) THEN
    ALTER TABLE "worker_profiles"
      ADD CONSTRAINT "worker_profiles_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'worker_profiles_companyId_fkey'
  ) THEN
    ALTER TABLE "worker_profiles"
      ADD CONSTRAINT "worker_profiles_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "worker_training" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "trainingCode" TEXT NOT NULL,
  "courseName" TEXT NOT NULL,
  "providerName" TEXT,
  "competencyLevel" INTEGER NOT NULL DEFAULT 1,
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "required" BOOLEAN NOT NULL DEFAULT true,
  "sourceType" TEXT,
  "legacyRecordId" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'valid',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_training_workerId_trainingCode_idx"
  ON "worker_training"("workerId", "trainingCode");
CREATE INDEX IF NOT EXISTS "worker_training_expiresAt_idx"
  ON "worker_training"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'worker_training_workerId_fkey'
  ) THEN
    ALTER TABLE "worker_training"
      ADD CONSTRAINT "worker_training_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'worker_training_profileId_fkey'
  ) THEN
    ALTER TABLE "worker_training"
      ADD CONSTRAINT "worker_training_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
