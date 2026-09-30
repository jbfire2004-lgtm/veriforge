-- CreateTable
CREATE TABLE "CoreActionItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "companyId" INTEGER,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreActionItem_pkey" PRIMARY KEY ("id")
);

-- Default UUID for id (PostgreSQL 13+)
ALTER TABLE "CoreActionItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE INDEX "CoreActionItem_companyId_idx" ON "CoreActionItem"("companyId");

-- CreateIndex
CREATE INDEX "CoreActionItem_status_idx" ON "CoreActionItem"("status");

-- CreateIndex
CREATE INDEX "CoreActionItem_dueAt_idx" ON "CoreActionItem"("dueAt");

-- CreateIndex
CREATE INDEX "CoreActionItem_createdById_idx" ON "CoreActionItem"("createdById");

-- CreateIndex
CREATE INDEX "CoreActionItem_createdAt_idx" ON "CoreActionItem"("createdAt");

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
