-- SMS Core: investigation table extensions (runs after investigation_module_v2)

ALTER TABLE "pm_safety_event_investigation"
  ADD COLUMN IF NOT EXISTS "scl_classification_json" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "heca_verification_json" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "energy_wheel_json" JSONB NOT NULL DEFAULT '{}';
