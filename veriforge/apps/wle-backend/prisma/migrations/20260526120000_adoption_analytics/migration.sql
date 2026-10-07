-- Vera Adoption & Usage Tracking System

-- Extend companies with geographic fields
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "province" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;

CREATE TYPE "FeedbackRequestStatus" AS ENUM (
  'NEW',
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'DECLINED'
);

CREATE TABLE "company_analytics" (
  "id" SERIAL PRIMARY KEY,
  "company_id" INTEGER NOT NULL UNIQUE REFERENCES "Company"("id") ON DELETE CASCADE,
  "last_login" TIMESTAMP(3),
  "active_users_30d" INTEGER NOT NULL DEFAULT 0,
  "modules_used" JSONB NOT NULL DEFAULT '{}',
  "total_workers" INTEGER NOT NULL DEFAULT 0,
  "total_equipment" INTEGER NOT NULL DEFAULT 0,
  "total_projects" INTEGER NOT NULL DEFAULT 0,
  "churn_risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "analytics_events" (
  "id" SERIAL PRIMARY KEY,
  "company_id" INTEGER NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "event_type" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "analytics_events_company_id_created_at_idx"
  ON "analytics_events"("company_id", "created_at" DESC);
CREATE INDEX "analytics_events_event_type_created_at_idx"
  ON "analytics_events"("event_type", "created_at" DESC);

CREATE TABLE "company_usage_daily" (
  "id" SERIAL PRIMARY KEY,
  "company_id" INTEGER NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "training_events" INTEGER NOT NULL DEFAULT 0,
  "verification_events" INTEGER NOT NULL DEFAULT 0,
  "signoff_events" INTEGER NOT NULL DEFAULT 0,
  "incident_events" INTEGER NOT NULL DEFAULT 0,
  "project_events" INTEGER NOT NULL DEFAULT 0,
  "jha_events" INTEGER NOT NULL DEFAULT 0,
  "flha_events" INTEGER NOT NULL DEFAULT 0,
  "sif_events" INTEGER NOT NULL DEFAULT 0,
  "equipment_events" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "company_usage_daily_company_id_date_key" UNIQUE ("company_id", "date")
);

CREATE INDEX "company_usage_daily_date_idx" ON "company_usage_daily"("date" DESC);

CREATE TABLE "feedback_requests" (
  "id" SERIAL PRIMARY KEY,
  "company_id" INTEGER REFERENCES "Company"("id") ON DELETE SET NULL,
  "user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "status" "FeedbackRequestStatus" NOT NULL DEFAULT 'NEW',
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "internal_notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "feedback_requests_status_upvotes_idx"
  ON "feedback_requests"("status", "upvotes" DESC);

CREATE TABLE "feedback_votes" (
  "id" SERIAL PRIMARY KEY,
  "feedback_id" INTEGER NOT NULL REFERENCES "feedback_requests"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feedback_votes_feedback_id_user_id_key" UNIQUE ("feedback_id", "user_id")
);
