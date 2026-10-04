-- CreateTable
CREATE TABLE "ToolboxTalk" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "notes" TEXT,
    "conductedAt" TIMESTAMP(3) NOT NULL,
    "facilitatorWorkerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolboxTalk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolboxTalk_siteId_conductedAt_idx" ON "ToolboxTalk"("siteId", "conductedAt");

-- AddForeignKey
ALTER TABLE "ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_facilitatorWorkerId_fkey" FOREIGN KEY ("facilitatorWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
