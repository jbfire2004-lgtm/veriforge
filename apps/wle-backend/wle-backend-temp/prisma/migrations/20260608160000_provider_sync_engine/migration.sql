CREATE TABLE IF NOT EXISTS "ProviderSyncConfig" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "syncMode" TEXT NOT NULL DEFAULT 'webhook',
    "pollUrl" TEXT,
    "pollIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "apiKeyEnvVar" TEXT,
    "webhookSecret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastPollAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProviderSyncConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProviderSyncConfig_providerId_key"
    ON "ProviderSyncConfig"("providerId");

CREATE TABLE IF NOT EXISTS "ProviderSyncRun" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsVerified" INTEGER NOT NULL DEFAULT 0,
    "recordsPushed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "ProviderSyncRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProviderSyncRun_providerId_startedAt_idx"
    ON "ProviderSyncRun"("providerId", "startedAt");

ALTER TABLE "ProviderSyncConfig"
    ADD CONSTRAINT "ProviderSyncConfig_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProviderSyncRun"
    ADD CONSTRAINT "ProviderSyncRun_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
