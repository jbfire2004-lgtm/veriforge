-- CreateEnum
CREATE TYPE "TrainingAttestationRole" AS ENUM ('SUPERVISOR', 'WORKER', 'OTHER');

-- CreateTable
CREATE TABLE "TrainingAttestation" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "attestedByWorkerId" INTEGER NOT NULL,
    "role" "TrainingAttestationRole" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingAttestation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingAttestation_trainingRecordId_idx" ON "TrainingAttestation"("trainingRecordId");

-- CreateIndex
CREATE INDEX "TrainingAttestation_attestedByWorkerId_idx" ON "TrainingAttestation"("attestedByWorkerId");

-- CreateIndex
CREATE INDEX "TrainingAttestation_createdAt_idx" ON "TrainingAttestation"("createdAt");

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_attestedByWorkerId_fkey" FOREIGN KEY ("attestedByWorkerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
