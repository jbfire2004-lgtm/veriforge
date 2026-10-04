-- Link training records created by ingestion runs for audit + verification traceability
ALTER TABLE "TrainingRecord" ADD COLUMN "ingestionRunId" INTEGER;

CREATE INDEX "TrainingRecord_ingestionRunId_idx" ON "TrainingRecord"("ingestionRunId");

ALTER TABLE "TrainingRecord"
  ADD CONSTRAINT "TrainingRecord_ingestionRunId_fkey"
  FOREIGN KEY ("ingestionRunId") REFERENCES "TrainingIngestionRun"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
