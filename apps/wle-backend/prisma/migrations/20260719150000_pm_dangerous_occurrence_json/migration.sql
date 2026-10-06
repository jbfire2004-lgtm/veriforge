-- Persist province-specific dangerous occurrence auto-flags on PM safety events
ALTER TABLE "pm_safety_events" ADD COLUMN IF NOT EXISTS "dangerous_occurrence_json" JSONB NOT NULL DEFAULT '{}';
