-- User-owned clearance worksheets (no Vera PASS/FAIL verdict)

DO $$ BEGIN
  CREATE TYPE "FallClearanceWorksheetStatus" AS ENUM ('DRAFT', 'SAVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "fall_clearance_worksheets" (
  "id" UUID NOT NULL,
  "company_id" INTEGER,
  "project_id" INTEGER,
  "industry" VARCHAR(64),
  "equipment_id" UUID,
  "reference_params" JSONB NOT NULL,
  "user_params" JSONB NOT NULL,
  "geometry" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "user_required_m" NUMERIC(6, 3),
  "user_available_m" NUMERIC(6, 3),
  "user_line_subtotal_m" NUMERIC(6, 3),
  "user_notes" TEXT,
  "status" "FallClearanceWorksheetStatus" NOT NULL DEFAULT 'DRAFT',
  "acknowledged_at" TIMESTAMPTZ(6),
  "acknowledged_by" VARCHAR(128),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "fall_clearance_worksheets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fall_clearance_worksheets_equipment_id_fkey"
    FOREIGN KEY ("equipment_id") REFERENCES "equipment_profiles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "fall_clearance_worksheets_company_project_created_idx"
  ON "fall_clearance_worksheets"("company_id", "project_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "fall_clearance_worksheets_equipment_id_idx"
  ON "fall_clearance_worksheets"("equipment_id");
CREATE INDEX IF NOT EXISTS "fall_clearance_worksheets_status_idx"
  ON "fall_clearance_worksheets"("status");

-- Additional example manufacturer-style profiles (verify datasheet before use)
INSERT INTO "equipment_profiles" (
  "id", "type", "manufacturer", "model", "standard_refs", "clearance_params", "status", "created_at", "updated_at"
) VALUES
(
  'a1000000-0000-4000-8000-000000000010',
  'srl',
  'ExampleCo (verify datasheet)',
  'Personal SRL — overhead use example',
  ARRAY['CSA Z259.2.2', 'ANSI Z359.14'],
  '{"maxFreeFallM":0.6,"decelerationDistanceM":1.07,"harnessStretchM":0.3,"lifelinePayoutM":0.15,"anchorDeflectionM":0.1,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000011',
  'srl',
  'ExampleCo (verify datasheet)',
  'Leading-edge rated SRL example',
  ARRAY['CSA Z259.2.2', 'ANSI Z359.14'],
  '{"maxFreeFallM":1.2,"decelerationDistanceM":1.5,"harnessStretchM":0.3,"lifelinePayoutM":0.45,"anchorDeflectionM":0.15,"safetyMarginM":1.0}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000012',
  'lanyard',
  'ExampleCo (verify datasheet)',
  'Twin-leg 6 ft energy-absorbing lanyard example',
  ARRAY['CSA Z259.11', 'ANSI Z359.13'],
  '{"maxFreeFallM":1.8,"decelerationDistanceM":1.07,"harnessStretchM":0.3,"lifelinePayoutM":0,"anchorDeflectionM":0.15,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000013',
  'harness',
  'ExampleCo (verify datasheet)',
  'Full-body harness stretch allowance example',
  ARRAY['CSA Z259.10'],
  '{"maxFreeFallM":0,"decelerationDistanceM":0,"harnessStretchM":0.45,"lifelinePayoutM":0,"anchorDeflectionM":0,"safetyMarginM":0}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
),
(
  'a1000000-0000-4000-8000-000000000014',
  'anchor',
  'ExampleCo (verify datasheet)',
  'Temporary beam anchor deflection example',
  ARRAY['CSA Z259.15', 'ANSI Z359.18'],
  '{"maxFreeFallM":0,"decelerationDistanceM":0,"harnessStretchM":0,"lifelinePayoutM":0,"anchorDeflectionM":0.3,"safetyMarginM":0}'::jsonb,
  'APPROVED',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
