-- Rollback for 20260720000000_init
-- WARNING: Destroys all VeriForge schema objects and data.
-- Use only on empty/dev databases or after an approved incident rollback plan.
--
-- Prisma does not auto-run down migrations. Apply manually:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/rollbacks/20260720000000_init.down.sql
-- Then remove the history row:
--   DELETE FROM "_prisma_migrations" WHERE migration_name = '20260720000000_init';

BEGIN;

DROP TABLE IF EXISTS "schema_releases" CASCADE;
DROP TABLE IF EXISTS "stripe_webhook_events" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "subscription_items" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "organization_modules" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "module_permissions" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "platform_settings" CASCADE;
DROP TABLE IF EXISTS "trial_notification_logs" CASCADE;
DROP TABLE IF EXISTS "onboardings" CASCADE;
DROP TABLE IF EXISTS "module_prices" CASCADE;
DROP TABLE IF EXISTS "modules" CASCADE;
DROP TABLE IF EXISTS "organizations" CASCADE;

DROP TYPE IF EXISTS "SystemRoleCode";
DROP TYPE IF EXISTS "TrialNotificationKind";
DROP TYPE IF EXISTS "OnboardingStatus";
DROP TYPE IF EXISTS "SubscriptionItemStatus";
DROP TYPE IF EXISTS "SubscriptionStatus";
DROP TYPE IF EXISTS "BillingCycle";
DROP TYPE IF EXISTS "ModuleCode";
DROP TYPE IF EXISTS "UserStatus";
DROP TYPE IF EXISTS "OrgStatus";

COMMIT;
