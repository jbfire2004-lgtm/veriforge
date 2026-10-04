BEGIN;

ALTER TABLE "SafetyStation"
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "lastPing" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'safety_station_code_key'
  ) THEN
    CREATE UNIQUE INDEX "safety_station_code_key"
      ON "SafetyStation" ("code")
      WHERE "code" IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_safety_station_site_active"
  ON "SafetyStation" ("siteId", "active");

COMMIT;
