-- CreateTable
CREATE TABLE "lessons_learned_entry" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "sourceType" "CailSourceType" NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "summary" TEXT NOT NULL,
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "beforeEvidence" JSONB NOT NULL DEFAULT '[]',
    "afterEvidence" JSONB NOT NULL DEFAULT '[]',
    "severity" "CailSeverity",
    "timeToCloseHours" DOUBLE PRECISION,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "aiClusterId" TEXT,
    "aiInsights" JSONB,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_learned_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lessons_learned_entry_cailId_key" ON "lessons_learned_entry"("cailId");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_projectId_publishedAt_idx" ON "lessons_learned_entry"("projectId", "publishedAt");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_companyId_publishedAt_idx" ON "lessons_learned_entry"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_aiClusterId_idx" ON "lessons_learned_entry"("aiClusterId");

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
