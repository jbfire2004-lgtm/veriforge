/*
  Warnings:

  - You are about to drop the `PreUseSignoff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreUseSignoff" DROP CONSTRAINT "PreUseSignoff_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "PreUseSignoff" DROP CONSTRAINT "PreUseSignoff_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "PreUseSignoff" DROP CONSTRAINT "PreUseSignoff_workerId_fkey";

-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "certificationId" INTEGER,
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkerSiteAccess" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "PreUseSignoff";

-- CreateTable
CREATE TABLE "DigitalSignoff" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "supervisorId" INTEGER,
    "siteId" INTEGER,
    "checklist" JSONB NOT NULL,
    "workerSignature" TEXT,
    "supervisorSignature" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "DigitalSignoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
