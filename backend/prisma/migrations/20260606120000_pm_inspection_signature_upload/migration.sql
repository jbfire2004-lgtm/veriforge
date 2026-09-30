-- PM inspection signatures: uploaded PNG reference + one signature per role per inspection
ALTER TABLE "pm_inspection_signature"
  ADD COLUMN IF NOT EXISTS "core_file_id" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pm_inspection_signature_core_file_id_fkey'
  ) THEN
    ALTER TABLE "pm_inspection_signature"
      ADD CONSTRAINT "pm_inspection_signature_core_file_id_fkey"
      FOREIGN KEY ("core_file_id") REFERENCES "CoreFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "pm_inspection_signature_inspectionId_role_key"
  ON "pm_inspection_signature"("inspectionId", "role");
