-- CoreFile company scoping + purpose indexing for Document Storage
ALTER TABLE "CoreFile" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;

CREATE INDEX IF NOT EXISTS "CoreFile_companyId_idx" ON "CoreFile"("companyId");
CREATE INDEX IF NOT EXISTS "CoreFile_purpose_idx" ON "CoreFile"("purpose");
CREATE INDEX IF NOT EXISTS "idx_core_file_company_created" ON "CoreFile"("companyId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_core_file_company_purpose_created" ON "CoreFile"("companyId", "purpose", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoreFile_companyId_fkey'
  ) THEN
    ALTER TABLE "CoreFile"
      ADD CONSTRAINT "CoreFile_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill company from uploader when possible
UPDATE "CoreFile" AS cf
SET "companyId" = u."companyId"
FROM "User" AS u
WHERE cf."userId" = u."id"
  AND cf."companyId" IS NULL
  AND u."companyId" IS NOT NULL;

-- Backfill from linked training ingestion runs
UPDATE "CoreFile" AS cf
SET "companyId" = tir."companyId"
FROM "TrainingIngestionRun" AS tir
WHERE tir."coreFileId" = cf."id"
  AND cf."companyId" IS NULL;
