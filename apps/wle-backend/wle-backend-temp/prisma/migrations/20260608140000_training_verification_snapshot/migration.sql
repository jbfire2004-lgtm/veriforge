-- Persist structured training verification snapshots on TrainingRecord
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "lastVerificationStatus" TEXT;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "lastVerificationChecks" JSONB;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "TrainingRecord_lastVerificationStatus_idx"
  ON "TrainingRecord"("lastVerificationStatus");
