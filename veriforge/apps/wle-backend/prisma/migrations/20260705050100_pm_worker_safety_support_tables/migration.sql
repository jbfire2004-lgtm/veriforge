-- Backfill missing PM worker safety tables used by enforcement/assignment flows.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PmWorkerAuthorizationType') THEN
    CREATE TYPE "PmWorkerAuthorizationType" AS ENUM (
      'crane_operator',
      'forklift_operator',
      'awp_operator',
      'pme_operator',
      'vehicle_operator',
      'specialty_equipment',
      'specialty'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PmWorkerMedicalRestrictionType') THEN
    CREATE TYPE "PmWorkerMedicalRestrictionType" AS ENUM (
      'physical',
      'work_limitation',
      'temporary',
      'permanent'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PmWorkerSafetyOverrideType') THEN
    CREATE TYPE "PmWorkerSafetyOverrideType" AS ENUM (
      'temporary',
      'one_time',
      'training',
      'equipment',
      'medical',
      'zone'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PmWorkerHazardExposureSource') THEN
    CREATE TYPE "PmWorkerHazardExposureSource" AS ENUM (
      'jha_flha',
      'inspection',
      'incident',
      'equipment_failure',
      'emergency',
      'company_library',
      'project_library'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "worker_competencies" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "competencyKey" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "evaluatorId" INTEGER,
  "legacyEvalId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_competencies_workerId_competencyKey_key"
  ON "worker_competencies"("workerId", "competencyKey");

CREATE TABLE IF NOT EXISTS "worker_authorizations" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "companyId" INTEGER,
  "authType" "PmWorkerAuthorizationType" NOT NULL,
  "equipmentId" INTEGER,
  "issuedByUserId" INTEGER,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "requiredTraining" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "requiredCerts" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "legacyAuthId" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_authorizations_clientSyncId_key"
  ON "worker_authorizations"("clientSyncId");
CREATE INDEX IF NOT EXISTS "worker_authorizations_workerId_authType_active_idx"
  ON "worker_authorizations"("workerId", "authType", "active");
CREATE INDEX IF NOT EXISTS "worker_authorizations_expiresAt_idx"
  ON "worker_authorizations"("expiresAt");

CREATE TABLE IF NOT EXISTS "worker_medical_restrictions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "restrictionType" "PmWorkerMedicalRestrictionType" NOT NULL,
  "description" TEXT NOT NULL,
  "blocksHighRisk" BOOLEAN NOT NULL DEFAULT false,
  "blocksConfinedSpace" BOOLEAN NOT NULL DEFAULT false,
  "blocksHotWork" BOOLEAN NOT NULL DEFAULT false,
  "blocksEquipment" BOOLEAN NOT NULL DEFAULT false,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_medical_restrictions_workerId_active_idx"
  ON "worker_medical_restrictions"("workerId", "active");

CREATE TABLE IF NOT EXISTS "worker_hazard_exposure" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "projectId" INTEGER,
  "sourceType" "PmWorkerHazardExposureSource" NOT NULL,
  "sourceId" TEXT,
  "hazardType" TEXT NOT NULL,
  "severity" INTEGER NOT NULL DEFAULT 3,
  "likelihood" INTEGER NOT NULL DEFAULT 3,
  "sifPotential" BOOLEAN NOT NULL DEFAULT false,
  "hecaCategoryKey" TEXT,
  "exposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_hazard_exposure_workerId_exposedAt_idx"
  ON "worker_hazard_exposure"("workerId", "exposedAt");
CREATE INDEX IF NOT EXISTS "worker_hazard_exposure_projectId_idx"
  ON "worker_hazard_exposure"("projectId");

CREATE TABLE IF NOT EXISTS "worker_incident_history" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "projectId" INTEGER,
  "eventType" TEXT NOT NULL,
  "sourceId" TEXT,
  "title" TEXT NOT NULL,
  "severity" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_incident_history_workerId_occurredAt_idx"
  ON "worker_incident_history"("workerId", "occurredAt");

CREATE TABLE IF NOT EXISTS "worker_corrective_actions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "capaId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "dueAt" TIMESTAMP(3),
  "sifLinked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_corrective_actions_workerId_status_idx"
  ON "worker_corrective_actions"("workerId", "status");
CREATE INDEX IF NOT EXISTS "worker_corrective_actions_capaId_idx"
  ON "worker_corrective_actions"("capaId");

CREATE TABLE IF NOT EXISTS "worker_access_logs" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "projectId" INTEGER,
  "zoneCode" TEXT,
  "equipmentId" INTEGER,
  "granted" BOOLEAN NOT NULL,
  "decision" TEXT,
  "denialReasons" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "sourceAttemptId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_access_logs_workerId_createdAt_idx"
  ON "worker_access_logs"("workerId", "createdAt");
CREATE INDEX IF NOT EXISTS "worker_access_logs_projectId_granted_idx"
  ON "worker_access_logs"("projectId", "granted");

CREATE TABLE IF NOT EXISTS "worker_overrides" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "overrideType" "PmWorkerSafetyOverrideType" NOT NULL,
  "ruleKey" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "supervisorSig" TEXT,
  "safetySig" TEXT,
  "approvedById" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_overrides_clientSyncId_key"
  ON "worker_overrides"("clientSyncId");
CREATE INDEX IF NOT EXISTS "worker_overrides_workerId_active_idx"
  ON "worker_overrides"("workerId", "active");
CREATE INDEX IF NOT EXISTS "worker_overrides_expiresAt_idx"
  ON "worker_overrides"("expiresAt");

CREATE TABLE IF NOT EXISTS "worker_safety_scores" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "score" INTEGER NOT NULL,
  "riskLevel" "PmProjectSafetyRiskLevel" NOT NULL,
  "factorsJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_safety_scores_workerId_computedAt_idx"
  ON "worker_safety_scores"("workerId", "computedAt");

CREATE TABLE IF NOT EXISTS "worker_safety_audit" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "profileId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "worker_safety_audit_workerId_createdAt_idx"
  ON "worker_safety_audit"("workerId", "createdAt");

CREATE TABLE IF NOT EXISTS "worker_safety_offline_cache" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workerId" INTEGER NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_safety_offline_cache_workerId_cacheKey_key"
  ON "worker_safety_offline_cache"("workerId", "cacheKey");
CREATE INDEX IF NOT EXISTS "worker_safety_offline_cache_workerId_updatedAt_idx"
  ON "worker_safety_offline_cache"("workerId", "updatedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_competencies_workerId_fkey') THEN
    ALTER TABLE "worker_competencies"
      ADD CONSTRAINT "worker_competencies_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_competencies_profileId_fkey') THEN
    ALTER TABLE "worker_competencies"
      ADD CONSTRAINT "worker_competencies_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_authorizations_workerId_fkey') THEN
    ALTER TABLE "worker_authorizations"
      ADD CONSTRAINT "worker_authorizations_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_authorizations_profileId_fkey') THEN
    ALTER TABLE "worker_authorizations"
      ADD CONSTRAINT "worker_authorizations_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_medical_restrictions_workerId_fkey') THEN
    ALTER TABLE "worker_medical_restrictions"
      ADD CONSTRAINT "worker_medical_restrictions_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_medical_restrictions_profileId_fkey') THEN
    ALTER TABLE "worker_medical_restrictions"
      ADD CONSTRAINT "worker_medical_restrictions_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_hazard_exposure_workerId_fkey') THEN
    ALTER TABLE "worker_hazard_exposure"
      ADD CONSTRAINT "worker_hazard_exposure_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_hazard_exposure_profileId_fkey') THEN
    ALTER TABLE "worker_hazard_exposure"
      ADD CONSTRAINT "worker_hazard_exposure_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_incident_history_workerId_fkey') THEN
    ALTER TABLE "worker_incident_history"
      ADD CONSTRAINT "worker_incident_history_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_incident_history_profileId_fkey') THEN
    ALTER TABLE "worker_incident_history"
      ADD CONSTRAINT "worker_incident_history_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_corrective_actions_workerId_fkey') THEN
    ALTER TABLE "worker_corrective_actions"
      ADD CONSTRAINT "worker_corrective_actions_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_corrective_actions_profileId_fkey') THEN
    ALTER TABLE "worker_corrective_actions"
      ADD CONSTRAINT "worker_corrective_actions_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_access_logs_workerId_fkey') THEN
    ALTER TABLE "worker_access_logs"
      ADD CONSTRAINT "worker_access_logs_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_access_logs_profileId_fkey') THEN
    ALTER TABLE "worker_access_logs"
      ADD CONSTRAINT "worker_access_logs_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_overrides_workerId_fkey') THEN
    ALTER TABLE "worker_overrides"
      ADD CONSTRAINT "worker_overrides_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_overrides_profileId_fkey') THEN
    ALTER TABLE "worker_overrides"
      ADD CONSTRAINT "worker_overrides_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_safety_scores_workerId_fkey') THEN
    ALTER TABLE "worker_safety_scores"
      ADD CONSTRAINT "worker_safety_scores_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_safety_scores_profileId_fkey') THEN
    ALTER TABLE "worker_safety_scores"
      ADD CONSTRAINT "worker_safety_scores_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_safety_audit_profileId_fkey') THEN
    ALTER TABLE "worker_safety_audit"
      ADD CONSTRAINT "worker_safety_audit_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_safety_audit_actorId_fkey') THEN
    ALTER TABLE "worker_safety_audit"
      ADD CONSTRAINT "worker_safety_audit_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_safety_offline_cache_workerId_fkey') THEN
    ALTER TABLE "worker_safety_offline_cache"
      ADD CONSTRAINT "worker_safety_offline_cache_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "Worker"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
