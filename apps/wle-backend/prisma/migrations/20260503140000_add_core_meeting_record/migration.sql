-- CreateEnum
CREATE TYPE "CoreMeetingRecordType" AS ENUM ('TEAM_SAFETY', 'TOOLBOX', 'MANAGEMENT_REVIEW', 'OTHER');

-- CreateTable
CREATE TABLE "CoreMeetingRecord" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "meetingType" "CoreMeetingRecordType" NOT NULL DEFAULT 'TOOLBOX',
    "heldAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER,
    "siteId" INTEGER,
    "recordedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreMeetingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_companyId_heldAt_idx" ON "CoreMeetingRecord"("companyId", "heldAt");

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_siteId_heldAt_idx" ON "CoreMeetingRecord"("siteId", "heldAt");

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_meetingType_idx" ON "CoreMeetingRecord"("meetingType");

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
