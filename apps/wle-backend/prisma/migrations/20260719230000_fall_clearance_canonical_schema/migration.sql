-- Canonical fall clearance schema (replaces earlier draft tables)

DROP TABLE IF EXISTS "clearance_audit_logs" CASCADE;
DROP TABLE IF EXISTS "fall_calculation_results" CASCADE;
DROP TABLE IF EXISTS "fall_configurations" CASCADE;
DROP TABLE IF EXISTS "equipment_profiles" CASCADE;

DO $$ BEGIN
  CREATE TYPE "FallClearanceEquipmentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE "equipment_profiles" (
  "id" UUID NOT NULL,
  "type" VARCHAR(32) NOT NULL,
  "manufacturer" VARCHAR(128) NOT NULL,
  "model" VARCHAR(128) NOT NULL,
  "standard_refs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "clearance_params" JSONB NOT NULL,
  "raw_manual_data" TEXT,
  "status" "FallClearanceEquipmentStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "equipment_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "equipment_profiles_status_idx" ON "equipment_profiles"("status");
CREATE INDEX "equipment_profiles_type_idx" ON "equipment_profiles"("type");

CREATE TABLE "fall_configurations" (
  "id" UUID NOT NULL,
  "site_id" UUID,
  "project_id" UUID,
  "worker_mass_kg" NUMERIC(5, 2),
  "anchor_height_m" NUMERIC(6, 3) NOT NULL,
  "work_surface_height_m" NUMERIC(6, 3) NOT NULL,
  "horizontal_offset_m" NUMERIC(6, 3),
  "equipment_id" UUID,
  "environment" VARCHAR(32),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "fall_configurations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fall_configurations_equipment_id_fkey"
    FOREIGN KEY ("equipment_id") REFERENCES "equipment_profiles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "fall_configurations_site_id_idx" ON "fall_configurations"("site_id");
CREATE INDEX "fall_configurations_project_id_idx" ON "fall_configurations"("project_id");
CREATE INDEX "fall_configurations_equipment_id_idx" ON "fall_configurations"("equipment_id");

CREATE TABLE "fall_calculation_results" (
  "id" UUID NOT NULL,
  "config_id" UUID NOT NULL,
  "required_clearance_m" NUMERIC(6, 3) NOT NULL,
  "available_clearance_m" NUMERIC(6, 3) NOT NULL,
  "status" VARCHAR(16) NOT NULL,
  "breakdown" JSONB,
  "standard_basis" JSONB,
  "ai_explanation" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "fall_calculation_results_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fall_calculation_results_config_id_fkey"
    FOREIGN KEY ("config_id") REFERENCES "fall_configurations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "fall_calculation_results_config_id_idx" ON "fall_calculation_results"("config_id");
CREATE INDEX "fall_calculation_results_status_idx" ON "fall_calculation_results"("status");

CREATE TABLE "clearance_audit_logs" (
  "id" UUID NOT NULL,
  "config_id" UUID,
  "result_id" UUID,
  "user_id" UUID,
  "site_id" UUID,
  "project_id" UUID,
  "payload" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "clearance_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "clearance_audit_logs_config_id_idx" ON "clearance_audit_logs"("config_id");
CREATE INDEX "clearance_audit_logs_result_id_idx" ON "clearance_audit_logs"("result_id");
CREATE INDEX "clearance_audit_logs_site_id_created_at_idx"
  ON "clearance_audit_logs"("site_id", "created_at" DESC);
CREATE INDEX "clearance_audit_logs_project_id_created_at_idx"
  ON "clearance_audit_logs"("project_id", "created_at" DESC);
CREATE INDEX "clearance_audit_logs_created_at_idx"
  ON "clearance_audit_logs"("created_at" DESC);

-- Seed approved teaching defaults
INSERT INTO "equipment_profiles" (
  "id", "type", "manufacturer", "model", "standard_refs", "clearance_params", "status", "created_at", "updated_at"
) VALUES
(
  'a1000000-0000-4000-8000-000000000001',
  'system',
  'Generic',
  '6 ft shock-absorbing lanyard system',
  ARRAY['CSA Z259.16-15', 'CSA Z259.11'],
  '{"maxFreeFallM":1.8,"decelerationDistanceM":1.07,"harnessStretchM":0.3,"lifelinePayoutM":0,"anchorDeflectionM":0.15,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000002',
  'system',
  'Generic',
  'Leading-edge SRL system',
  ARRAY['CSA Z259.16-15'],
  '{"maxFreeFallM":0.6,"decelerationDistanceM":1.4,"harnessStretchM":0.3,"lifelinePayoutM":0.3,"anchorDeflectionM":0.15,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000003',
  'lanyard',
  'Generic',
  'Shock-absorbing lanyard 4 ft',
  ARRAY['CSA Z259.11'],
  '{"maxFreeFallM":1.22,"decelerationDistanceM":0.9,"harnessStretchM":0.3,"lifelinePayoutM":0,"anchorDeflectionM":0.1,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
