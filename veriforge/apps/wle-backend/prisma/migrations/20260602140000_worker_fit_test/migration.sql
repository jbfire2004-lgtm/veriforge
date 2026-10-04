-- CreateEnum
CREATE TYPE "FitTestOutcome" AS ENUM ('PASS', 'FAIL', 'PENDING');

-- CreateTable
CREATE TABLE "worker_fit_test" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "respiratorType" VARCHAR(128),
    "testMethod" VARCHAR(128),
    "outcome" "FitTestOutcome" NOT NULL DEFAULT 'PENDING',
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueAt" TIMESTAMP(3),
    "evidenceNotes" TEXT,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_fit_test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_fit_test_workerId_testedAt_idx" ON "worker_fit_test"("workerId", "testedAt");
CREATE INDEX "worker_fit_test_nextDueAt_idx" ON "worker_fit_test"("nextDueAt");

-- AddForeignKey
ALTER TABLE "worker_fit_test" ADD CONSTRAINT "worker_fit_test_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worker_fit_test" ADD CONSTRAINT "worker_fit_test_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "worker_fit_test" ADD CONSTRAINT "worker_fit_test_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
