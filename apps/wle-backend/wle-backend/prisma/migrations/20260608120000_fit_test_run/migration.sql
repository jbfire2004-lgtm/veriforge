-- Rename WorkerFitTest table to FitTestRun
ALTER TABLE "worker_fit_test" RENAME TO "fit_test_run";

ALTER INDEX IF EXISTS "worker_fit_test_pkey" RENAME TO "fit_test_run_pkey";
ALTER INDEX IF EXISTS "worker_fit_test_workerId_testedAt_idx" RENAME TO "fit_test_run_workerId_testedAt_idx";
ALTER INDEX IF EXISTS "worker_fit_test_nextDueAt_idx" RENAME TO "fit_test_run_nextDueAt_idx";

CREATE INDEX IF NOT EXISTS "fit_test_run_companyId_nextDueAt_idx" ON "fit_test_run"("companyId", "nextDueAt");
