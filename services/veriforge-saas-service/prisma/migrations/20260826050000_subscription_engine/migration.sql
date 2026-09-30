-- Subscription engine: product module entitlements per organization.

CREATE TYPE "ProductModuleCode" AS ENUM (
  'core',
  'pm',
  'safety',
  'compliance',
  'wallet',
  'training',
  'audits',
  'investigations',
  'scorecards',
  'hiring_client_tools'
);

CREATE TYPE "SubscriptionPlan" AS ENUM (
  'trial',
  'starter',
  'professional',
  'enterprise'
);

CREATE TABLE "subscription_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "modules_enabled" JSONB NOT NULL DEFAULT '{}',
  "billing_plan" "SubscriptionPlan" NOT NULL DEFAULT 'trial',
  "billing_status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "subscription_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscription_profiles_org_id_key" UNIQUE ("org_id"),
  CONSTRAINT "subscription_profiles_org_id_fkey"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "subscription_profiles_billing_status_idx"
  ON "subscription_profiles"("billing_status");

-- Backfill one profile per existing organization (core enabled by default).
INSERT INTO "subscription_profiles" ("org_id", "modules_enabled", "billing_plan", "billing_status")
SELECT
  o."id",
  '{"core": true}'::jsonb,
  'trial'::"SubscriptionPlan",
  CASE
    WHEN o."is_trial_active" THEN 'trialing'::"SubscriptionStatus"
    WHEN o."status" = 'suspended' THEN 'paused'::"SubscriptionStatus"
    ELSE 'active'::"SubscriptionStatus"
  END
FROM "organizations" o
ON CONFLICT ("org_id") DO NOTHING;
