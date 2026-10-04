-- Vera Core / PM catalog seed support: stable keys, permit types, system catalog

ALTER TYPE "PmPermitType" ADD VALUE IF NOT EXISTS 'fall_protection';
ALTER TYPE "PmPermitType" ADD VALUE IF NOT EXISTS 'live_line';
ALTER TYPE "PmPermitType" ADD VALUE IF NOT EXISTS 'open_hole';

ALTER TABLE "InspectionChecklist" ADD COLUMN IF NOT EXISTS "seed_key" TEXT;
ALTER TABLE "InspectionChecklist" ADD COLUMN IF NOT EXISTS "seed_version" INTEGER NOT NULL DEFAULT 1;
CREATE UNIQUE INDEX IF NOT EXISTS "InspectionChecklist_seed_key_key" ON "InspectionChecklist"("seed_key");

ALTER TABLE "InspectionTemplate" ADD COLUMN IF NOT EXISTS "seed_version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "hazard_library" ADD COLUMN IF NOT EXISTS "seed_key" TEXT;
ALTER TABLE "hazard_library" ADD COLUMN IF NOT EXISTS "default_control_keys" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "hazard_library" ADD COLUMN IF NOT EXISTS "seed_version" INTEGER NOT NULL DEFAULT 1;
DROP INDEX IF EXISTS "hazard_library_seed_key_key";
CREATE UNIQUE INDEX IF NOT EXISTS "hazard_library_seed_key_companyId_key"
    ON "hazard_library"("seed_key", "companyId");

ALTER TABLE "control_library" ADD COLUMN IF NOT EXISTS "seed_key" TEXT;
ALTER TABLE "control_library" ADD COLUMN IF NOT EXISTS "seed_version" INTEGER NOT NULL DEFAULT 1;
DROP INDEX IF EXISTS "control_library_seed_key_key";
CREATE UNIQUE INDEX IF NOT EXISTS "control_library_seed_key_companyId_key"
    ON "control_library"("seed_key", "companyId");

ALTER TABLE "pm_inspection_template" ADD COLUMN IF NOT EXISTS "seed_key" TEXT;
ALTER TABLE "pm_inspection_template" ADD COLUMN IF NOT EXISTS "seed_version" INTEGER NOT NULL DEFAULT 1;
DROP INDEX IF EXISTS "pm_inspection_template_seed_key_key";
CREATE UNIQUE INDEX IF NOT EXISTS "pm_inspection_template_seed_key_companyId_key"
    ON "pm_inspection_template"("seed_key", "companyId");

CREATE TABLE IF NOT EXISTS "system_catalog" (
    "id" TEXT NOT NULL,
    "catalog_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_catalog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "system_catalog_catalog_type_active_idx"
    ON "system_catalog"("catalog_type", "active");
