BEGIN;

UPDATE "TrainingIngestionRun"
SET "status" = UPPER(TRIM("status"))
WHERE "status" IS NOT NULL;

UPDATE "CoreActionItem"
SET "status" = UPPER(TRIM("status")),
    "priority" = UPPER(TRIM("priority"))
WHERE "status" IS NOT NULL OR "priority" IS NOT NULL;

UPDATE "Incident"
SET "status" = UPPER(TRIM("status")),
    "severity" = UPPER(TRIM("severity"))
WHERE "status" IS NOT NULL OR "severity" IS NOT NULL;

UPDATE "Inspection"
SET "status" = UPPER(TRIM("status"))
WHERE "status" IS NOT NULL;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "companyId", LOWER(TRIM("courseName"))
      ORDER BY "id"
    ) AS rn
  FROM "TrainingRequirement"
)
DELETE FROM "TrainingRequirement" tr
USING ranked r
WHERE tr."id" = r."id"
  AND r.rn > 1;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "equipmentId", "certificationId"
      ORDER BY "id"
    ) AS rn
  FROM "EquipmentTrainingRequirement"
)
DELETE FROM "EquipmentTrainingRequirement" etr
USING ranked r
WHERE etr."id" = r."id"
  AND r.rn > 1;

COMMIT;
