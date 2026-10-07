-- Daily log schema: activities, safety_notes, supervisor, CoreFile attachments
ALTER TABLE "CoreDailyLog" ADD COLUMN IF NOT EXISTS "activities" TEXT;
ALTER TABLE "CoreDailyLog" ADD COLUMN IF NOT EXISTS "safetyNotes" TEXT;
ALTER TABLE "CoreDailyLog" ADD COLUMN IF NOT EXISTS "supervisorUserId" INTEGER;

CREATE INDEX IF NOT EXISTS "CoreDailyLog_supervisorUserId_idx" ON "CoreDailyLog"("supervisorUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoreDailyLog_supervisorUserId_fkey'
  ) THEN
    ALTER TABLE "CoreDailyLog"
      ADD CONSTRAINT "CoreDailyLog_supervisorUserId_fkey"
      FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill activities from legacy body when empty
UPDATE "CoreDailyLog"
SET "activities" = "body"
WHERE "activities" IS NULL AND "body" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "CoreDailyLogAttachment" (
  "id" SERIAL PRIMARY KEY,
  "dailyLogId" INTEGER NOT NULL,
  "coreFileId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "CoreDailyLogAttachment_dailyLogId_coreFileId_key"
  ON "CoreDailyLogAttachment"("dailyLogId", "coreFileId");
CREATE INDEX IF NOT EXISTS "CoreDailyLogAttachment_dailyLogId_idx"
  ON "CoreDailyLogAttachment"("dailyLogId");
CREATE INDEX IF NOT EXISTS "CoreDailyLogAttachment_coreFileId_idx"
  ON "CoreDailyLogAttachment"("coreFileId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoreDailyLogAttachment_dailyLogId_fkey'
  ) THEN
    ALTER TABLE "CoreDailyLogAttachment"
      ADD CONSTRAINT "CoreDailyLogAttachment_dailyLogId_fkey"
      FOREIGN KEY ("dailyLogId") REFERENCES "CoreDailyLog"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoreDailyLogAttachment_coreFileId_fkey'
  ) THEN
    ALTER TABLE "CoreDailyLogAttachment"
      ADD CONSTRAINT "CoreDailyLogAttachment_coreFileId_fkey"
      FOREIGN KEY ("coreFileId") REFERENCES "CoreFile"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
