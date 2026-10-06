-- Notification engine: enriched notifications + user preferences

DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "body" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);

-- Migrate legacy string channel/status to enums (best-effort; skip if already converted)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Notification' AND column_name = 'channel' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "Notification" ALTER COLUMN "channel" DROP DEFAULT;
    ALTER TABLE "Notification"
      ALTER COLUMN "channel" TYPE "NotificationChannel"
      USING (
        (CASE UPPER(COALESCE("channel"::text, 'IN_APP'))
          WHEN 'EMAIL' THEN 'EMAIL'
          WHEN 'SMS' THEN 'SMS'
          WHEN 'PUSH' THEN 'PUSH'
          ELSE 'IN_APP'
        END)::"NotificationChannel"
      );
    ALTER TABLE "Notification" ALTER COLUMN "channel" SET DEFAULT 'IN_APP'::"NotificationChannel";
  END IF;
END $$;

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "notification_status_check";

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Notification' AND column_name = 'status' AND udt_name = 'text'
  ) THEN
    ALTER TABLE "Notification" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "Notification"
      ALTER COLUMN "status" TYPE "NotificationStatus"
      USING (
        (CASE UPPER(COALESCE("status"::text, 'PENDING'))
          WHEN 'READ' THEN 'READ'
          WHEN 'FAILED' THEN 'FAILED'
          WHEN 'SENT' THEN 'SENT'
          ELSE 'PENDING'
        END)::"NotificationStatus"
      );
    ALTER TABLE "Notification" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"NotificationStatus";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_dedupe_key" ON "Notification"("dedupeKey");
CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification"("userId", "readAt");

CREATE TABLE "UserNotificationPreference" (
    "userId" INT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inspectionDue" BOOLEAN NOT NULL DEFAULT true,
    "competencyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "ppeExpiry" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceDue" BOOLEAN NOT NULL DEFAULT true,
    "calibrationDue" BOOLEAN NOT NULL DEFAULT true,
    "assignmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "phone" TEXT,
    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
