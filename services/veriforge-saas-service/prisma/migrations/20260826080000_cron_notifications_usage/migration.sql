-- Notification queue + module usage analytics for Veriforge cron jobs

CREATE TYPE "NotificationChannel" AS ENUM ('email', 'in_app');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "user_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'queued',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "recipient_email" TEXT,
    "dedupe_key" TEXT,
    "meta" JSONB,
    "error" TEXT,
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key");
CREATE INDEX "notifications_status_queued_at_idx" ON "notifications"("status", "queued_at");
CREATE INDEX "notifications_org_id_status_idx" ON "notifications"("org_id", "status");
CREATE INDEX "notifications_channel_status_idx" ON "notifications"("channel", "status");

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "module_usage_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "module_code" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "event_count" INTEGER NOT NULL DEFAULT 0,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_usage_metrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "module_usage_metrics_org_id_module_code_period_start_key"
  ON "module_usage_metrics"("org_id", "module_code", "period_start");
CREATE INDEX "module_usage_metrics_module_code_period_start_idx"
  ON "module_usage_metrics"("module_code", "period_start");
CREATE INDEX "module_usage_metrics_org_id_recorded_at_idx"
  ON "module_usage_metrics"("org_id", "recorded_at");

ALTER TABLE "module_usage_metrics"
  ADD CONSTRAINT "module_usage_metrics_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
