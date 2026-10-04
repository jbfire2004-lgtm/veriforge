-- Fall clearance equipment profiles (PFAS catalog for clearance calculator)

DO $$ BEGIN
  CREATE TYPE "FallClearanceEquipmentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "equipment_profiles" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER,
  "category" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "clearance_params" JSONB NOT NULL,
  "status" "FallClearanceEquipmentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "notes" TEXT,
  "manual_text" TEXT,
  "ai_parse_meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equipment_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "equipment_profiles_status_idx" ON "equipment_profiles"("status");
CREATE INDEX IF NOT EXISTS "equipment_profiles_company_id_status_idx" ON "equipment_profiles"("company_id", "status");
CREATE INDEX IF NOT EXISTS "equipment_profiles_category_idx" ON "equipment_profiles"("category");

-- Seed approved teaching defaults (idempotent by id)
INSERT INTO "equipment_profiles" (
  "id", "category", "manufacturer", "model", "clearance_params", "status", "notes", "created_at", "updated_at"
) VALUES
(
  'system-shock-lanyard-6ft',
  'system',
  'Generic',
  '6 ft shock-absorbing lanyard system',
  '{"maxFreeFallM":1.8,"decelerationDistanceM":1.07,"harnessStretchM":0.3,"lifelinePayoutM":0,"anchorDeflectionM":0.15,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  'Teaching defaults — replace with manufacturer datasheet values.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'system-srl-leading-edge',
  'system',
  'Generic',
  'Leading-edge SRL system',
  '{"maxFreeFallM":0.6,"decelerationDistanceM":1.4,"harnessStretchM":0.3,"lifelinePayoutM":0.3,"anchorDeflectionM":0.15,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  'SRL payout and LE deceleration vary widely — verify product instructions.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'lanyard-shock-4ft',
  'lanyard',
  'Generic',
  'Shock-absorbing lanyard 4 ft',
  '{"maxFreeFallM":1.22,"decelerationDistanceM":0.9,"harnessStretchM":0.3,"lifelinePayoutM":0,"anchorDeflectionM":0.1,"safetyMarginM":0.9}'::jsonb,
  'APPROVED',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
