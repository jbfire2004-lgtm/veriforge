-- Restore optional completion timestamp for TrainingRecord (used by PATCH .../complete).
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
