-- Rollback 20260720010000_perf_indexes
BEGIN;

DROP INDEX IF EXISTS "subscriptions_org_id_trialing_partial_idx";
DROP INDEX IF EXISTS "user_roles_active_partial_idx";
DROP INDEX IF EXISTS "organization_modules_active_enabled_partial_idx";
DROP INDEX IF EXISTS "module_prices_module_id_billing_cycle_currency_effective_to_idx";
DROP INDEX IF EXISTS "organization_modules_org_id_effective_to_enabled_idx";
DROP INDEX IF EXISTS "user_roles_user_id_revoked_at_idx";
DROP INDEX IF EXISTS "organizations_is_trial_active_trial_end_idx";

DELETE FROM "schema_releases" WHERE "release_tag" = 'v1.1.0-perf-indexes';

COMMIT;
