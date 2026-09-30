-- CreateEnum
CREATE TYPE "CredentialLedgerActorType" AS ENUM ('SYSTEM', 'PROVIDER', 'SUPERVISOR', 'WORKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CredentialLedgerEventType" AS ENUM ('CREATED', 'UPDATED', 'VERIFIED', 'REVOKED', 'EXPIRED', 'CORRECTED', 'IMPORTED');

-- CreateTable
CREATE TABLE "credential_ledger_events" (
    "id" SERIAL NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" INTEGER,
    "actorType" "CredentialLedgerActorType" NOT NULL DEFAULT 'SYSTEM',
    "eventType" "CredentialLedgerEventType" NOT NULL,
    "credentialId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "providerId" INTEGER,
    "projectId" INTEGER,
    "companyId" INTEGER,
    "correlationId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "credential_ledger_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credential_ledger_events_credentialId_occurredAt_idx" ON "credential_ledger_events"("credentialId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_workerId_occurredAt_idx" ON "credential_ledger_events"("workerId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_providerId_occurredAt_idx" ON "credential_ledger_events"("providerId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_companyId_occurredAt_idx" ON "credential_ledger_events"("companyId", "occurredAt");

-- AddForeignKey
ALTER TABLE "credential_ledger_events" ADD CONSTRAINT "credential_ledger_events_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
