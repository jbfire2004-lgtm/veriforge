-- AlterTable
ALTER TABLE "CoreActionItem" ADD COLUMN "coreMeetingRecordId" INTEGER;

-- CreateIndex
CREATE INDEX "CoreActionItem_coreMeetingRecordId_idx" ON "CoreActionItem"("coreMeetingRecordId");

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_coreMeetingRecordId_fkey" FOREIGN KEY ("coreMeetingRecordId") REFERENCES "CoreMeetingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
