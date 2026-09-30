-- Performance indexes for hot tenant / RBAC / trial paths.
-- Additive only — safe for online deploy (short SHARE UPDATE EXCLUSIVE locks on CREATE INDEX).
-- For very large tables in production, prefer CREATE INDEX CONCURRENTLY via ops runbook
-- (see prisma/migrations/_templates/online_expand_contract.sql.example).

CREATE INDEX IF NOT EXISTS "organizations_is_trial_active_trial_end_idx"
  ON "organizations" ("is_trial_active", "trial_end");

CREATE INDEX IF NOT EXISTS "user_roles_user_id_revoked_at_idx"
  ON "user_roles" ("user_id", "revoked_at");

CREATE INDEX IF NOT EXISTS "organization_modules_org_id_effective_to_enabled_idx"
  ON "organization_modules" ("org_id", "effective_to", "enabled");

CREATE INDEX IF NOT EXISTS "module_prices_module_id_billing_cycle_currency_effective_to_idx"
  ON "module_prices" ("module_id", "billing_cycle", "currency", "effective_to");

-- Partial: only open (current) org-module rows
CREATE INDEX IF NOT EXISTS "organization_modules_active_enabled_partial_idx"
  ON "organization_modules" ("org_id", "module_id")
  WHERE "effective_to" IS NULL AND "enabled" = true;

-- Partial: only active (non-revoked) role assignments
CREATE INDEX IF NOT EXISTS "user_roles_active_partial_idx"
  ON "user_roles" ("user_id", "role_id", "org_id")
  WHERE "revoked_at" IS NULL;

-- Partial: trialing subscriptions by org
CREATE INDEX IF NOT EXISTS "subscriptions_org_id_trialing_partial_idx"
  ON "subscriptions" ("org_id")
  WHERE "status" = 'trialing';

INSERT INTO "schema_releases" ("id", "release_tag", "migration_name", "applied_at", "notes")
VALUES (
  gen_random_uuid(),
  'v1.1.0-perf-indexes',
  '20260720010000_perf_indexes',
  CURRENT_TIMESTAMP,
  'Hot-path + partial indexes for RBAC, modules, trials'
)
ON CONFLICT ("release_tag") DO NOTHING;
