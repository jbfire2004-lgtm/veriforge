-- FitTestRun: align columns and enum with assessment engine contract

CREATE TYPE "FitTestResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL');

ALTER TABLE "fit_test_run" ADD COLUMN IF NOT EXISTS "evidenceFilesJson" JSONB;

ALTER TABLE "fit_test_run" RENAME COLUMN "respiratorType" TO "testType";

ALTER TABLE "fit_test_run" ADD COLUMN "result" "FitTestResult";
UPDATE "fit_test_run"
SET "result" = CASE
  WHEN "outcome"::text = 'PENDING' THEN 'CONDITIONAL'::"FitTestResult"
  ELSE "outcome"::text::"FitTestResult"
END;
ALTER TABLE "fit_test_run" ALTER COLUMN "result" SET NOT NULL;
ALTER TABLE "fit_test_run" ALTER COLUMN "result" SET DEFAULT 'CONDITIONAL';
ALTER TABLE "fit_test_run" DROP COLUMN "outcome";
DROP TYPE "FitTestOutcome";

ALTER TABLE "fit_test_run" RENAME COLUMN "testedAt" TO "performedAt";
ALTER TABLE "fit_test_run" RENAME COLUMN "nextDueAt" TO "expiresAt";
ALTER TABLE "fit_test_run" RENAME COLUMN "evidenceNotes" TO "notes";
ALTER TABLE "fit_test_run" RENAME COLUMN "createdByUserId" TO "createdById";
ALTER TABLE "fit_test_run" RENAME COLUMN "companyId" TO "tenantId";

DROP INDEX IF EXISTS "fit_test_run_workerId_testedAt_idx";
DROP INDEX IF EXISTS "fit_test_run_nextDueAt_idx";
DROP INDEX IF EXISTS "fit_test_run_companyId_nextDueAt_idx";

CREATE INDEX "fit_test_run_workerId_performedAt_idx" ON "fit_test_run"("workerId", "performedAt");
CREATE INDEX "fit_test_run_expiresAt_idx" ON "fit_test_run"("expiresAt");
CREATE INDEX "fit_test_run_tenantId_expiresAt_idx" ON "fit_test_run"("tenantId", "expiresAt");

ALTER TABLE "fit_test_run" DROP CONSTRAINT IF EXISTS "worker_fit_test_companyId_fkey";
ALTER TABLE "fit_test_run" DROP CONSTRAINT IF EXISTS "fit_test_run_companyId_fkey";
ALTER TABLE "fit_test_run" ADD CONSTRAINT "fit_test_run_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fit_test_run" DROP CONSTRAINT IF EXISTS "worker_fit_test_createdByUserId_fkey";
ALTER TABLE "fit_test_run" DROP CONSTRAINT IF EXISTS "fit_test_run_createdByUserId_fkey";
ALTER TABLE "fit_test_run" ADD CONSTRAINT "fit_test_run_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
