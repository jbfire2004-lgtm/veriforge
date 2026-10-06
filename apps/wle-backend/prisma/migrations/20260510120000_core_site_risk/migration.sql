-- CreateEnum
CREATE TYPE "CoreSiteRiskCategory" AS ENUM ('STRUCTURAL', 'ELECTRICAL', 'ERGONOMIC', 'ENVIRONMENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CoreSiteRiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CoreSiteRiskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'MITIGATED', 'CLOSED');

-- CreateTable
CREATE TABLE "CoreSiteRisk" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "CoreSiteRiskCategory" NOT NULL DEFAULT 'OTHER',
    "severity" "CoreSiteRiskSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "CoreSiteRiskStatus" NOT NULL DEFAULT 'OPEN',
    "identifiedAt" TIMESTAMP(3) NOT NULL,
    "mitigatedAt" TIMESTAMP(3),
    "locationNote" VARCHAR(500),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "ownerUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreSiteRisk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreSiteRisk_companyId_status_idx" ON "CoreSiteRisk"("companyId", "status");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_siteId_identifiedAt_idx" ON "CoreSiteRisk"("siteId", "identifiedAt");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_category_idx" ON "CoreSiteRisk"("category");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_severity_idx" ON "CoreSiteRisk"("severity");

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
