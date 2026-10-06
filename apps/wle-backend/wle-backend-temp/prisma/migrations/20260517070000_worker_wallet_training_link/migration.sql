ALTER TABLE "WorkerWalletItem" ADD COLUMN IF NOT EXISTS "trainingRecordId" INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS "WorkerWalletItem_trainingRecordId_key" ON "WorkerWalletItem"("trainingRecordId");
CREATE INDEX IF NOT EXISTS "WorkerWalletItem_trainingRecordId_idx" ON "WorkerWalletItem"("trainingRecordId");
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_trainingRecordId_fkey"
  FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
