-- VeriForge SaaS initial schema
-- Migration: 20260720000000_init
-- Transactional (Prisma wraps in a transaction by default for PostgreSQL).
-- History: recorded in `_prisma_migrations`.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE "OrgStatus" AS ENUM ('active', 'suspended', 'closed');
CREATE TYPE "UserStatus" AS ENUM ('invited', 'active', 'disabled');
CREATE TYPE "ModuleCode" AS ENUM ('vericore', 'veripm', 'verihub');
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'annual');
CREATE TYPE "SubscriptionStatus" AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'paused'
);
CREATE TYPE "SubscriptionItemStatus" AS ENUM ('active', 'trialing', 'canceled', 'incomplete');
CREATE TYPE "OnboardingStatus" AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE "TrialNotificationKind" AS ENUM (
  'welcome',
  'trial_ending_soon',
  'trial_ended',
  'founder_new_trial'
);
CREATE TYPE "SystemRoleCode" AS ENUM ('owner', 'admin', 'manager', 'user');

-- Catalog: modules
CREATE TABLE "modules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" "ModuleCode" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");

CREATE TABLE "module_prices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "module_id" UUID NOT NULL,
  "billing_cycle" "BillingCycle" NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "unit_amount_cents" INTEGER NOT NULL,
  "external_price_id" TEXT,
  "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effective_to" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "module_prices_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "module_prices_module_id_idx" ON "module_prices"("module_id");

CREATE TABLE "organizations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "OrgStatus" NOT NULL DEFAULT 'active',
  "trial_start" TIMESTAMP(3),
  "trial_end" TIMESTAMP(3),
  "is_trial_active" BOOLEAN NOT NULL DEFAULT false,
  "external_customer_id" TEXT,
  "billing_email" TEXT,
  "default_billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "onboarding_notes" TEXT,
  "onboarding_checklist" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "organizations_external_customer_id_key" ON "organizations"("external_customer_id");
CREATE INDEX "organizations_status_idx" ON "organizations"("status");
CREATE INDEX "organizations_is_trial_active_idx" ON "organizations"("is_trial_active");

CREATE TABLE "onboardings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "status" "OnboardingStatus" NOT NULL DEFAULT 'not_started',
  "notes" TEXT,
  "checklist" JSONB,
  "assigned_to" TEXT,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "onboardings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "onboardings_org_id_key" ON "onboardings"("org_id");
CREATE INDEX "onboardings_status_idx" ON "onboardings"("status");

CREATE TABLE "trial_notification_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "kind" "TrialNotificationKind" NOT NULL,
  "recipient_email" TEXT NOT NULL,
  "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "meta" JSONB,
  CONSTRAINT "trial_notification_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trial_notification_logs_org_id_idx" ON "trial_notification_logs"("org_id");
CREATE INDEX "trial_notification_logs_kind_sent_at_idx" ON "trial_notification_logs"("kind", "sent_at");
CREATE UNIQUE INDEX "trial_notification_logs_org_id_kind_key" ON "trial_notification_logs"("org_id", "kind");

CREATE TABLE "platform_settings" (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT,
  "full_name" TEXT NOT NULL,
  "full_name_enc" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'invited',
  "email_verified_at" TIMESTAMP(3),
  "last_login_at" TIMESTAMP(3),
  "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
  "mfa_secret_enc" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "users_org_id_idx" ON "users"("org_id");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE UNIQUE INDEX "users_org_id_email_key" ON "users"("org_id", "email");

CREATE TABLE "roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" "SystemRoleCode" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_system" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

CREATE TABLE "permissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

CREATE TABLE "role_permissions" (
  "role_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id")
);
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

CREATE TABLE "module_permissions" (
  "module_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "module_permissions_pkey" PRIMARY KEY ("module_id", "permission_id")
);
CREATE INDEX "module_permissions_permission_id_idx" ON "module_permissions"("permission_id");

CREATE TABLE "user_roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role_id" UUID NOT NULL,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assigned_by" UUID,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "user_roles_org_id_idx" ON "user_roles"("org_id");
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

CREATE TABLE "organization_modules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "module_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effective_to" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_modules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "organization_modules_org_id_idx" ON "organization_modules"("org_id");
CREATE INDEX "organization_modules_module_id_idx" ON "organization_modules"("module_id");

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
  "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "trial_start" TIMESTAMP(3),
  "trial_end" TIMESTAMP(3),
  "current_period_start" TIMESTAMP(3),
  "current_period_end" TIMESTAMP(3),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "canceled_at" TIMESTAMP(3),
  "external_customer_id" TEXT,
  "external_subscription_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_external_subscription_id_key" ON "subscriptions"("external_subscription_id");
CREATE INDEX "subscriptions_org_id_idx" ON "subscriptions"("org_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE TABLE "subscription_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "module_id" UUID NOT NULL,
  "status" "SubscriptionItemStatus" NOT NULL DEFAULT 'active',
  "billing_cycle" "BillingCycle" NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit_amount_cents" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "external_subscription_item_id" TEXT,
  "external_price_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscription_items_external_subscription_item_id_key" ON "subscription_items"("external_subscription_item_id");
CREATE INDEX "subscription_items_subscription_id_idx" ON "subscription_items"("subscription_id");
CREATE INDEX "subscription_items_org_id_idx" ON "subscription_items"("org_id");
CREATE INDEX "subscription_items_module_id_idx" ON "subscription_items"("module_id");

CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID,
  "actor_id" UUID,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resource_id" TEXT,
  "ip" TEXT,
  "user_agent" TEXT,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_org_id_created_at_idx" ON "audit_logs"("org_id", "created_at");
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

CREATE TABLE "stripe_webhook_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload_hash" TEXT,
  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "stripe_webhook_events_event_id_key" ON "stripe_webhook_events"("event_id");
CREATE INDEX "stripe_webhook_events_type_processed_at_idx" ON "stripe_webhook_events"("type", "processed_at");

-- Foreign keys (after all tables exist — short locks on empty DB)
ALTER TABLE "module_prices"
  ADD CONSTRAINT "module_prices_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "onboardings"
  ADD CONSTRAINT "onboardings_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trial_notification_logs"
  ADD CONSTRAINT "trial_notification_logs_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users"
  ADD CONSTRAINT "users_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_permission_id_fkey"
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "module_permissions"
  ADD CONSTRAINT "module_permissions_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "module_permissions"
  ADD CONSTRAINT "module_permissions_permission_id_fkey"
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_assigned_by_fkey"
  FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "organization_modules"
  ADD CONSTRAINT "organization_modules_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_modules"
  ADD CONSTRAINT "organization_modules_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subscriptions"
  ADD CONSTRAINT "subscriptions_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_items"
  ADD CONSTRAINT "subscription_items_subscription_id_fkey"
  FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_items"
  ADD CONSTRAINT "subscription_items_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_items"
  ADD CONSTRAINT "subscription_items_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- App-level schema release marker (complements Prisma `_prisma_migrations`)
CREATE TABLE IF NOT EXISTS "schema_releases" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "release_tag" TEXT NOT NULL,
  "migration_name" TEXT NOT NULL,
  "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "schema_releases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "schema_releases_release_tag_key" ON "schema_releases"("release_tag");
CREATE INDEX "schema_releases_migration_name_idx" ON "schema_releases"("migration_name");

INSERT INTO "schema_releases" ("release_tag", "migration_name", "notes")
VALUES ('v1.0.0-schema', '20260720000000_init', 'Initial VeriForge multi-tenant schema');
