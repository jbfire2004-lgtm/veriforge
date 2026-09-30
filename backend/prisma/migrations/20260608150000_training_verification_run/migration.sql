CREATE TABLE IF NOT EXISTS "TrainingVerificationRun" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "authenticityStatus" TEXT NOT NULL,
    "regulatoryStatus" TEXT,
    "standardsOutcome" TEXT,
    "jurisdictionCode" TEXT,
    "checks" JSONB,
    "propagation" JSONB,
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingVerificationRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrainingVerificationRun_trainingRecordId_createdAt_idx"
    ON "TrainingVerificationRun"("trainingRecordId", "createdAt");

ALTER TABLE "TrainingVerificationRun"
    ADD CONSTRAINT "TrainingVerificationRun_trainingRecordId_fkey"
    FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
