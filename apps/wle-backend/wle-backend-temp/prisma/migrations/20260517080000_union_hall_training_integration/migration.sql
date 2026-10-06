CREATE TYPE "UnionHallTrainingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PUSHED');

CREATE TABLE "UnionHallProviderLink" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingProviderId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnionHallProviderLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnionHallTrainingReceipt" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "status" "UnionHallTrainingStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" INTEGER,
    "validatedAt" TIMESTAMP(3),
    "pushedAt" TIMESTAMP(3),
    "pushedCompanyId" INTEGER,
    "pushedProjectId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UnionHallTrainingReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "union_hall_training_receipt_unique" ON "UnionHallTrainingReceipt"("unionHallId", "trainingRecordId");
CREATE INDEX "UnionHallTrainingReceipt_trainingRecordId_idx" ON "UnionHallTrainingReceipt"("trainingRecordId");
CREATE UNIQUE INDEX "union_hall_provider_unique" ON "UnionHallProviderLink"("unionHallId", "trainingProviderId");
CREATE INDEX "UnionHallProviderLink_unionHallId_active_idx" ON "UnionHallProviderLink"("unionHallId", "active");
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_status_idx" ON "UnionHallTrainingReceipt"("unionHallId", "status");
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_createdAt_idx" ON "UnionHallTrainingReceipt"("unionHallId", "createdAt");

ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_unionHallId_fkey"
  FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_trainingProviderId_fkey"
  FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_unionHallId_fkey"
  FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_trainingRecordId_fkey"
  FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_acceptedByUserId_fkey"
  FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
