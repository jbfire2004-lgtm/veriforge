-- AlterTable
ALTER TABLE "CoreActionItem" ADD COLUMN "coreDailyLogId" INTEGER;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_coreDailyLogId_fkey" FOREIGN KEY ("coreDailyLogId") REFERENCES "CoreDailyLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CoreActionItem_coreDailyLogId_idx" ON "CoreActionItem"("coreDailyLogId");
