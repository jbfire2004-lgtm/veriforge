-- CreateEnum
CREATE TYPE "SafetyObservationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SafetyObservationStatus" AS ENUM ('OPEN', 'REVIEWED', 'CLOSED');

-- CreateTable
CREATE TABLE "SafetyObservation" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "SafetyObservationSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "SafetyObservationStatus" NOT NULL DEFAULT 'OPEN',
    "observedAt" TIMESTAMP(3) NOT NULL,
    "locationNote" VARCHAR(500),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "reportedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SafetyObservation_companyId_observedAt_idx" ON "SafetyObservation"("companyId", "observedAt");

-- CreateIndex
CREATE INDEX "SafetyObservation_siteId_observedAt_idx" ON "SafetyObservation"("siteId", "observedAt");

-- CreateIndex
CREATE INDEX "SafetyObservation_status_idx" ON "SafetyObservation"("status");

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
