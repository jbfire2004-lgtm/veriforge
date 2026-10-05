-- CreateTable
CREATE TABLE "TrainingIngestionRun" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceMime" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "ocrText" TEXT,
    "metadataSnapshot" JSONB,
    "validationErrors" JSONB,
    "resultSummary" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingIngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingIngestionRun_companyId_createdAt_idx" ON "TrainingIngestionRun"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "TrainingIngestionRun" ADD CONSTRAINT "TrainingIngestionRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
