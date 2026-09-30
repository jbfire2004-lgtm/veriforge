-- Competency module: evaluation dates, expiry, type-level requirements

ALTER TABLE "CompetencyEvaluation" ADD COLUMN IF NOT EXISTS "evaluationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CompetencyEvaluation" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "CompetencyEvaluation" ADD COLUMN IF NOT EXISTS "notes" TEXT;

CREATE INDEX IF NOT EXISTS "CompetencyEvaluation_workerId_expiresAt_idx" ON "CompetencyEvaluation"("workerId", "expiresAt");
CREATE INDEX IF NOT EXISTS "CompetencyEvaluation_expiresAt_idx" ON "CompetencyEvaluation"("expiresAt");
CREATE INDEX IF NOT EXISTS "CompetencyEvaluation_workerId_equipmentId_evaluationDate_idx" ON "CompetencyEvaluation"("workerId", "equipmentId", "evaluationDate");

ALTER TABLE "EquipmentCompetencyRequirement" ADD COLUMN IF NOT EXISTS "expiryDays" INTEGER;
ALTER TABLE "EquipmentCompetencyRequirement" ADD COLUMN IF NOT EXISTS "requireEvaluation" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "EquipmentTypeCompetencyRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "minPassingScore" INTEGER NOT NULL DEFAULT 70,
    "expiryDays" INTEGER,
    "requireEvaluation" BOOLEAN NOT NULL DEFAULT true,
    "certificationId" INTEGER,
    CONSTRAINT "EquipmentTypeCompetencyRequirement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EquipmentTypeCompetencyRequirement_equipmentTypeId_key" ON "EquipmentTypeCompetencyRequirement"("equipmentTypeId");
ALTER TABLE "EquipmentTypeCompetencyRequirement" ADD CONSTRAINT "EquipmentTypeCompetencyRequirement_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentTypeCompetencyRequirement" ADD CONSTRAINT "EquipmentTypeCompetencyRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill evaluationDate from createdAt
UPDATE "CompetencyEvaluation" SET "evaluationDate" = "createdAt" WHERE "evaluationDate" IS NULL;
