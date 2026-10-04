-- Document Storage: linked_project_id on CoreFile
ALTER TABLE "CoreFile" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;

CREATE INDEX IF NOT EXISTS "CoreFile_projectId_idx" ON "CoreFile"("projectId");
CREATE INDEX IF NOT EXISTS "idx_core_file_project_created" ON "CoreFile"("projectId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoreFile_projectId_fkey'
  ) THEN
    ALTER TABLE "CoreFile"
      ADD CONSTRAINT "CoreFile_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
