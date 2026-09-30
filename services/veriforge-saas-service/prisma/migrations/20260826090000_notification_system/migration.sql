-- Notification inbox fields + email_queue outbox

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'system_alert';

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "read" BOOLEAN NOT NULL DEFAULT false;

-- Backfill title from subject when empty
UPDATE "notifications"
SET "title" = COALESCE(NULLIF("subject", ''), "title")
WHERE "title" = '' AND "subject" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "notifications_user_id_read_created_at_idx"
  ON "notifications"("user_id", "read", "created_at");

CREATE INDEX IF NOT EXISTS "notifications_org_id_read_created_at_idx"
  ON "notifications"("org_id", "read", "created_at");

CREATE INDEX IF NOT EXISTS "notifications_type_created_at_idx"
  ON "notifications"("type", "created_at");

CREATE TABLE IF NOT EXISTS "email_queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "org_id" UUID,
    "dedupe_key" TEXT,
    "error" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_queue_dedupe_key_key" ON "email_queue"("dedupe_key");
CREATE INDEX IF NOT EXISTS "email_queue_status_created_at_idx" ON "email_queue"("status", "created_at");
