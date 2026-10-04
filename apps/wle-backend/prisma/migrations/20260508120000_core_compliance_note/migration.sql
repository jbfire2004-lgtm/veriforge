-- CreateEnum
CREATE TYPE "CoreComplianceNoteCategory" AS ENUM ('REGULATORY', 'AUDIT', 'INTERNAL', 'CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CoreComplianceNoteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CoreComplianceNotePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateTable
CREATE TABLE "CoreComplianceNote" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "category" "CoreComplianceNoteCategory" NOT NULL DEFAULT 'INTERNAL',
    "status" "CoreComplianceNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "CoreComplianceNotePriority" NOT NULL DEFAULT 'NORMAL',
    "dueAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreComplianceNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreComplianceNote_companyId_status_idx" ON "CoreComplianceNote"("companyId", "status");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_siteId_status_idx" ON "CoreComplianceNote"("siteId", "status");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_category_idx" ON "CoreComplianceNote"("category");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_dueAt_idx" ON "CoreComplianceNote"("dueAt");

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
