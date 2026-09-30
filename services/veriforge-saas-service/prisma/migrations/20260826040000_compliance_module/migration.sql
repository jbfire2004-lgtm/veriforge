-- Compliance Module

DO $$ BEGIN
  CREATE TYPE "ComplianceArtifactType" AS ENUM ('insurance', 'wcb', 'cor', 'scsa', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ComplianceArtifactStatus" AS ENUM ('valid', 'expired', 'pending_review', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ComplianceNotificationKind" AS ENUM ('expiry_warning', 'expired', 'review_pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "compliance_artifacts" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "type" "ComplianceArtifactType" NOT NULL,
  "label" TEXT,
  "file_url" TEXT NOT NULL,
  "expiry_date" TIMESTAMP(3),
  "status" "ComplianceArtifactStatus" NOT NULL DEFAULT 'pending_review',
  "reviewer_id" UUID,
  "uploaded_by_id" UUID,
  "review_notes" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "compliance_artifacts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "compliance_artifacts_org_id_type_idx" ON "compliance_artifacts"("org_id", "type");
CREATE INDEX IF NOT EXISTS "compliance_artifacts_org_id_status_idx" ON "compliance_artifacts"("org_id", "status");
CREATE INDEX IF NOT EXISTS "compliance_artifacts_expiry_date_idx" ON "compliance_artifacts"("expiry_date");
CREATE INDEX IF NOT EXISTS "compliance_artifacts_status_expiry_date_idx" ON "compliance_artifacts"("status", "expiry_date");

ALTER TABLE "compliance_artifacts"
  DROP CONSTRAINT IF EXISTS "compliance_artifacts_org_id_fkey";
ALTER TABLE "compliance_artifacts"
  ADD CONSTRAINT "compliance_artifacts_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "compliance_artifacts"
  DROP CONSTRAINT IF EXISTS "compliance_artifacts_reviewer_id_fkey";
ALTER TABLE "compliance_artifacts"
  ADD CONSTRAINT "compliance_artifacts_reviewer_id_fkey"
  FOREIGN KEY ("reviewer_id") REFERENCES "hiring_client_users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "compliance_artifacts"
  DROP CONSTRAINT IF EXISTS "compliance_artifacts_uploaded_by_id_fkey";
ALTER TABLE "compliance_artifacts"
  ADD CONSTRAINT "compliance_artifacts_uploaded_by_id_fkey"
  FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "org_compliance_scorecards" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "compliance_score" INTEGER NOT NULL DEFAULT 0,
  "overall_score" INTEGER NOT NULL DEFAULT 0,
  "breakdown" JSONB NOT NULL DEFAULT '{}',
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "org_compliance_scorecards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "org_compliance_scorecards_org_id_key"
  ON "org_compliance_scorecards"("org_id");

ALTER TABLE "org_compliance_scorecards"
  DROP CONSTRAINT IF EXISTS "org_compliance_scorecards_org_id_fkey";
ALTER TABLE "org_compliance_scorecards"
  ADD CONSTRAINT "org_compliance_scorecards_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "compliance_notification_logs" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "artifact_id" UUID,
  "kind" "ComplianceNotificationKind" NOT NULL,
  "recipient_email" TEXT NOT NULL,
  "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "meta" JSONB,
  CONSTRAINT "compliance_notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "compliance_notification_logs_org_id_artifact_id_kind_key"
  ON "compliance_notification_logs"("org_id", "artifact_id", "kind");
CREATE INDEX IF NOT EXISTS "compliance_notification_logs_org_id_sent_at_idx"
  ON "compliance_notification_logs"("org_id", "sent_at");
CREATE INDEX IF NOT EXISTS "compliance_notification_logs_kind_sent_at_idx"
  ON "compliance_notification_logs"("kind", "sent_at");

ALTER TABLE "compliance_notification_logs"
  DROP CONSTRAINT IF EXISTS "compliance_notification_logs_org_id_fkey";
ALTER TABLE "compliance_notification_logs"
  ADD CONSTRAINT "compliance_notification_logs_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
