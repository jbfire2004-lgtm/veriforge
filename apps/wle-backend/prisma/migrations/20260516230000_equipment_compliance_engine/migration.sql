-- Equipment Compliance Engine — denormalized real-time fields on Equipment

CREATE TYPE "EquipmentLockoutStatus" AS ENUM ('CLEAR', 'LOCKED_OUT');

ALTER TABLE "Equipment" ADD COLUMN "complianceStatus" "LinkComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
ADD COLUMN "lastInspectionAt" TIMESTAMP(3),
ADD COLUMN "nextInspectionAt" TIMESTAMP(3),
ADD COLUMN "lockoutStatus" "EquipmentLockoutStatus" NOT NULL DEFAULT 'CLEAR',
ADD COLUMN "competencyRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "complianceUpdatedAt" TIMESTAMP(3);

CREATE INDEX "Equipment_complianceStatus_idx" ON "Equipment"("complianceStatus");
CREATE INDEX "Equipment_nextInspectionAt_idx" ON "Equipment"("nextInspectionAt");
CREATE INDEX "Equipment_lockoutStatus_idx" ON "Equipment"("lockoutStatus");

-- Backfill lockout from existing rows
UPDATE "Equipment"
SET "lockoutStatus" = 'LOCKED_OUT',
    "complianceStatus" = 'LOCKED_OUT'
WHERE "lockedOutAt" IS NOT NULL;

UPDATE "Equipment"
SET "lockoutStatus" = 'CLEAR'
WHERE "lockedOutAt" IS NULL;

-- Backfill inspection dates from latest completed inspection
UPDATE "Equipment" e
SET
  "lastInspectionAt" = sub."lastAt",
  "nextInspectionAt" = sub."nextAt"
FROM (
  SELECT DISTINCT ON ("equipmentId")
    "equipmentId",
    COALESCE("completedAt", "createdAt") AS "lastAt",
    "nextInspectionDate" AS "nextAt"
  FROM "Inspection"
  WHERE "equipmentId" IS NOT NULL
    AND "completedAt" IS NOT NULL
  ORDER BY "equipmentId", COALESCE("completedAt", "createdAt") DESC
) sub
WHERE e."id" = sub."equipmentId";

-- Training / competency required flags
UPDATE "Equipment" e
SET "trainingRequired" = true
WHERE EXISTS (
  SELECT 1 FROM "EquipmentTrainingRequirement" r WHERE r."equipmentId" = e."id"
);

UPDATE "Equipment" e
SET "competencyRequired" = true
WHERE EXISTS (
  SELECT 1 FROM "EquipmentCompetencyRequirement" r WHERE r."equipmentId" = e."id"
);

UPDATE "Equipment" SET "complianceUpdatedAt" = NOW() WHERE "complianceUpdatedAt" IS NULL;
