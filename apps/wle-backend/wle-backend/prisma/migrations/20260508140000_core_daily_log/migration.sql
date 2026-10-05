-- CreateEnum
CREATE TYPE "CoreDailyLogShift" AS ENUM ('DAY', 'NIGHT', 'OTHER');

-- CreateTable
CREATE TABLE "CoreDailyLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "logDate" TIMESTAMP(3) NOT NULL,
    "shift" "CoreDailyLogShift" NOT NULL DEFAULT 'DAY',
    "companyId" INTEGER,
    "siteId" INTEGER,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreDailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreDailyLog_companyId_logDate_idx" ON "CoreDailyLog"("companyId", "logDate");

-- CreateIndex
CREATE INDEX "CoreDailyLog_siteId_logDate_idx" ON "CoreDailyLog"("siteId", "logDate");

-- CreateIndex
CREATE INDEX "CoreDailyLog_shift_idx" ON "CoreDailyLog"("shift");

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
