-- CreateEnum
CREATE TYPE "CailSourceType" AS ENUM ('inspection', 'bbo', 'incident', 'equipment', 'jha', 'flha', 'heca', 'sif', 'training', 'general');

-- CreateEnum
CREATE TYPE "CailStatus" AS ENUM ('open', 'in_progress', 'overdue', 'resolved', 'verified', 'cancelled');

-- CreateEnum
CREATE TYPE "CailSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "CailRiskCategory" AS ENUM ('behavior', 'equipment', 'environment', 'process', 'ppe', 'ergonomic', 'other');

-- CreateTable
CREATE TABLE "cail_entry" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "ownerCompanyId" INTEGER NOT NULL,
    "assignedUserId" INTEGER,
    "sourceType" "CailSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CailStatus" NOT NULL DEFAULT 'open',
    "severity" "CailSeverity" NOT NULL DEFAULT 'medium',
    "riskCategory" "CailRiskCategory",
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER,
    "verifiedByUserId" INTEGER,
    "evidenceBefore" JSONB NOT NULL DEFAULT '[]',
    "evidenceAfter" JSONB NOT NULL DEFAULT '[]',
    "rootCauseCategory" TEXT,
    "rootCauseNotes" TEXT,
    "aiRootCauseSuggestions" JSONB,
    "aiCorrectiveActionSuggestions" JSONB,
    "aiClassification" JSONB,
    "lessonsLearnedGenerated" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "siteId" INTEGER,
    "locationNote" VARCHAR(500),
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "overdueAt" TIMESTAMP(3),
    "timeToResolveHours" DOUBLE PRECISION,

    CONSTRAINT "cail_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_attachment" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "uploadedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_activity_log" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cail_entry_sourceType_sourceId_sourceItemId_key" ON "cail_entry"("sourceType", "sourceId", "sourceItemId");

-- CreateIndex
CREATE INDEX "cail_entry_projectId_status_idx" ON "cail_entry"("projectId", "status");

-- CreateIndex
CREATE INDEX "cail_entry_ownerCompanyId_status_idx" ON "cail_entry"("ownerCompanyId", "status");

-- CreateIndex
CREATE INDEX "cail_entry_dueDate_idx" ON "cail_entry"("dueDate");

-- CreateIndex
CREATE INDEX "cail_entry_sourceType_sourceId_idx" ON "cail_entry"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "cail_attachment_cailId_idx" ON "cail_attachment"("cailId");

-- CreateIndex
CREATE INDEX "cail_activity_log_cailId_createdAt_idx" ON "cail_activity_log"("cailId", "createdAt");

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_attachment" ADD CONSTRAINT "cail_attachment_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_attachment" ADD CONSTRAINT "cail_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_activity_log" ADD CONSTRAINT "cail_activity_log_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_activity_log" ADD CONSTRAINT "cail_activity_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
