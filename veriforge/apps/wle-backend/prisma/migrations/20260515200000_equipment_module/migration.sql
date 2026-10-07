-- Vera Core Equipment Module

CREATE TYPE "EquipmentMaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'SCHEDULED', 'EMERGENCY');
CREATE TYPE "EquipmentAttachmentType" AS ENUM ('PHOTO', 'MANUAL', 'CERTIFICATE', 'INSPECTION_REPORT', 'OTHER');

CREATE TABLE "EquipmentCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EquipmentCategory_name_key" ON "EquipmentCategory"("name");
CREATE UNIQUE INDEX "EquipmentCategory_code_key" ON "EquipmentCategory"("code");

CREATE TABLE "EquipmentType" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "catalogTypeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EquipmentType_categoryId_name_key" ON "EquipmentType"("categoryId", "name");
CREATE INDEX "EquipmentType_catalogTypeKey_idx" ON "EquipmentType"("catalogTypeKey");
ALTER TABLE "EquipmentType" ADD CONSTRAINT "EquipmentType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "categoryId" INTEGER;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "typeId" INTEGER;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "manufacturer" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "yearMade" INTEGER;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "idx_equipment_category" ON "Equipment"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_equipment_type" ON "Equipment"("typeId");
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "EquipmentAttachment" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentAttachmentType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentAttachment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EquipmentAttachment_equipmentId_createdAt_idx" ON "EquipmentAttachment"("equipmentId", "createdAt");
ALTER TABLE "EquipmentAttachment" ADD CONSTRAINT "EquipmentAttachment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EquipmentMaintenance" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentMaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" INTEGER,
    "notes" TEXT,
    "nextDueAt" TIMESTAMP(3),
    "meterHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentMaintenance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EquipmentMaintenance_equipmentId_performedAt_idx" ON "EquipmentMaintenance"("equipmentId", "performedAt");
ALTER TABLE "EquipmentMaintenance" ADD CONSTRAINT "EquipmentMaintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EquipmentCalibration" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "calibratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibratedBy" INTEGER,
    "certificateNumber" TEXT,
    "expiresAt" TIMESTAMP(3),
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentCalibration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EquipmentCalibration_equipmentId_calibratedAt_idx" ON "EquipmentCalibration"("equipmentId", "calibratedAt");
CREATE INDEX "EquipmentCalibration_equipmentId_expiresAt_idx" ON "EquipmentCalibration"("equipmentId", "expiresAt");
ALTER TABLE "EquipmentCalibration" ADD CONSTRAINT "EquipmentCalibration_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EquipmentLockout" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "reason" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),
    "lockedByUserId" INTEGER,
    "unlockedByUserId" INTEGER,
    CONSTRAINT "EquipmentLockout_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EquipmentLockout_equipmentId_lockedAt_idx" ON "EquipmentLockout"("equipmentId", "lockedAt");
CREATE INDEX "EquipmentLockout_companyId_lockedAt_idx" ON "EquipmentLockout"("companyId", "lockedAt");
ALTER TABLE "EquipmentLockout" ADD CONSTRAINT "EquipmentLockout_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentLockout" ADD CONSTRAINT "EquipmentLockout_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "EquipmentComplianceStatus" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "status" "LinkComplianceStatus" NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedByUserId" INTEGER,
    "notes" TEXT,
    "inspectionId" INTEGER,
    CONSTRAINT "EquipmentComplianceStatus_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EquipmentComplianceStatus_equipmentId_assessedAt_idx" ON "EquipmentComplianceStatus"("equipmentId", "assessedAt");
CREATE INDEX "EquipmentComplianceStatus_companyId_status_idx" ON "EquipmentComplianceStatus"("companyId", "status");
ALTER TABLE "EquipmentComplianceStatus" ADD CONSTRAINT "EquipmentComplianceStatus_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentComplianceStatus" ADD CONSTRAINT "EquipmentComplianceStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default categories & types
INSERT INTO "EquipmentCategory" ("name", "code", "description") VALUES
  ('Mobile Equipment', 'MOBILE', 'Cranes, lifts, powered mobile assets'),
  ('Safety Critical', 'SAFETY', 'PPE, rigging, fall protection'),
  ('Serialized Tools', 'TOOLS', 'Hand and power tools with serial tracking'),
  ('Other', 'OTHER', 'General equipment')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "EquipmentType" ("categoryId", "name", "code", "catalogTypeKey")
SELECT c."id", t.type_name, t.type_code, t.catalog_key
FROM (VALUES
  ('MOBILE', 'Skid Steer', 'SKID_STEER', 'Skid Steer'),
  ('MOBILE', 'Forklift', 'FORKLIFT', 'Forklift'),
  ('SAFETY', 'Full Body Harness', 'HARNESS', 'Full Body Harness'),
  ('TOOLS', 'Torque Wrench', 'TORQUE', 'Torque Wrench'),
  ('OTHER', 'General', 'GENERAL', NULL)
) AS t(cat_code, type_name, type_code, catalog_key)
JOIN "EquipmentCategory" c ON c."code" = t.cat_code
ON CONFLICT ("categoryId", "name") DO NOTHING;

-- Backfill compliance history from active links
INSERT INTO "EquipmentComplianceStatus" ("equipmentId", "companyId", "status", "assessedAt")
SELECT el."equipmentId", el."companyId", el."complianceStatus", COALESCE(el."startDate", CURRENT_TIMESTAMP)
FROM "EquipmentLink" el
WHERE el."active" = true
  AND NOT EXISTS (
    SELECT 1 FROM "EquipmentComplianceStatus" ecs
    WHERE ecs."equipmentId" = el."equipmentId" AND ecs."companyId" = el."companyId"
      AND ecs."assessedAt" >= el."startDate" - INTERVAL '1 minute'
  );
