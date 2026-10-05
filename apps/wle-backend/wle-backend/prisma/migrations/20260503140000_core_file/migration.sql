-- CreateEnum
CREATE TYPE "CoreUploadStorage" AS ENUM ('LOCAL', 'S3', 'DIRECT_S3');

-- CreateEnum
CREATE TYPE "CoreUploadStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "CoreFile" (
    "id" SERIAL NOT NULL,
    "storage" "CoreUploadStorage" NOT NULL,
    "status" "CoreUploadStatus" NOT NULL DEFAULT 'COMPLETED',
    "bucket" TEXT,
    "objectKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "publicUrl" TEXT,
    "purpose" TEXT,
    "failedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "CoreFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoreFile_objectKey_key" ON "CoreFile"("objectKey");

-- CreateIndex
CREATE INDEX "CoreFile_createdAt_idx" ON "CoreFile"("createdAt");

-- CreateIndex
CREATE INDEX "CoreFile_userId_idx" ON "CoreFile"("userId");

-- CreateIndex
CREATE INDEX "CoreFile_status_idx" ON "CoreFile"("status");

-- AddForeignKey
ALTER TABLE "CoreFile" ADD CONSTRAINT "CoreFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
