-- =============================================================================
-- VeriForge multi-tenant SaaS schema (Postgres)
-- Products: VeriCore · VeriPM · VeriHub
-- =============================================================================
-- Conventions:
--   * UUID primary keys
--   * org_id = tenant boundary on every tenant-scoped table
--   * soft lifecycle via status enums (not hard DELETE for billing/RBAC history)
--   * timestamptz for all timestamps
--   * Stripe IDs stored as text (cus_… / sub_… / si_…)
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE vf_org_status AS ENUM ('active', 'suspended', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_user_status AS ENUM ('invited', 'active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_module_code AS ENUM ('vericore', 'veripm', 'verihub');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_billing_cycle AS ENUM ('monthly', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'unpaid',
    'paused'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_subscription_item_status AS ENUM (
    'active',
    'trialing',
    'canceled',
    'incomplete'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vf_system_role_code AS ENUM ('owner', 'admin', 'manager', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- Catalog: modules & list prices
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            vf_module_code NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_prices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id             UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
  billing_cycle         vf_billing_cycle NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  unit_amount_cents     INT NOT NULL CHECK (unit_amount_cents >= 0),
  external_price_id     TEXT, -- Stripe Price id (price_…)
  effective_from        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to          TIMESTAMPTZ, -- NULL = current price row
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT module_prices_window_chk
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS module_prices_one_current_uidx
  ON module_prices (module_id, billing_cycle, currency)
  WHERE effective_to IS NULL;

CREATE INDEX IF NOT EXISTS module_prices_module_id_idx
  ON module_prices (module_id);

-- -----------------------------------------------------------------------------
-- Tenancy: organizations & users (1 user → 1 org)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  slug                    TEXT NOT NULL,
  status                  vf_org_status NOT NULL DEFAULT 'active',
  -- Trial (org-level, 7 days typical; length enforced in app or CHECK below)
  trial_start             TIMESTAMPTZ,
  trial_end               TIMESTAMPTZ,
  is_trial_active         BOOLEAN NOT NULL DEFAULT FALSE,
  -- Billing / Stripe
  external_customer_id    TEXT UNIQUE, -- Stripe Customer (cus_…)
  billing_email           TEXT,
  default_billing_cycle   vf_billing_cycle NOT NULL DEFAULT 'monthly',
  timezone                TEXT NOT NULL DEFAULT 'UTC',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organizations_slug_format_chk
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT organizations_trial_window_chk
    CHECK (
      (trial_start IS NULL AND trial_end IS NULL)
      OR (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end > trial_start)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_uidx
  ON organizations (slug);

CREATE INDEX IF NOT EXISTS organizations_status_idx
  ON organizations (status);

CREATE INDEX IF NOT EXISTS organizations_trial_active_idx
  ON organizations (is_trial_active)
  WHERE is_trial_active = TRUE;

CREATE INDEX IF NOT EXISTS organizations_external_customer_id_idx
  ON organizations (external_customer_id)
  WHERE external_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  email             TEXT NOT NULL,
  password_hash     TEXT, -- nullable for SSO-only users
  full_name         TEXT NOT NULL,
  status            vf_user_status NOT NULL DEFAULT 'invited',
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_format_chk
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

-- Exactly one org per user is modeled by single org_id column (no multi-org membership table).
CREATE UNIQUE INDEX IF NOT EXISTS users_org_email_uidx
  ON users (org_id, lower(email));

CREATE INDEX IF NOT EXISTS users_org_id_idx
  ON users (org_id);

CREATE INDEX IF NOT EXISTS users_status_idx
  ON users (status);

-- -----------------------------------------------------------------------------
-- RBAC
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            vf_system_role_code NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT NOT NULL UNIQUE, -- e.g. vericore.workers.read
  name            TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT permissions_key_format_chk
    CHECK (key ~ '^[a-z0-9]+(\.[a-z0-9_]+)+$')
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx
  ON role_permissions (permission_id);

-- Which permissions belong to which product module (for entitlement + UI gating)
CREATE TABLE IF NOT EXISTS module_permissions (
  module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (module_id, permission_id)
);

CREATE INDEX IF NOT EXISTS module_permissions_permission_id_idx
  ON module_permissions (permission_id);

-- User ↔ role assignment (within their org)
CREATE TABLE IF NOT EXISTS user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  revoked_at      TIMESTAMPTZ, -- soft revoke
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_roles_revoke_chk
    CHECK (revoked_at IS NULL OR revoked_at >= assigned_at)
);

-- One active role assignment per user (Owner/Admin/Manager/User) — adjust if multi-role needed
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_active_uidx
  ON user_roles (user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS user_roles_org_id_idx
  ON user_roles (org_id);

CREATE INDEX IF NOT EXISTS user_roles_role_id_idx
  ON user_roles (role_id);

-- Enforce user.org_id = user_roles.org_id
CREATE OR REPLACE FUNCTION vf_user_roles_same_org()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  u_org UUID;
BEGIN
  SELECT org_id INTO u_org FROM users WHERE id = NEW.user_id;
  IF u_org IS DISTINCT FROM NEW.org_id THEN
    RAISE EXCEPTION 'user_roles.org_id must match users.org_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_roles_same_org ON user_roles;
CREATE TRIGGER trg_user_roles_same_org
  BEFORE INSERT OR UPDATE OF org_id, user_id ON user_roles
  FOR EACH ROW EXECUTE PROCEDURE vf_user_roles_same_org();

-- -----------------------------------------------------------------------------
-- Organization ↔ modules (enablement history)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to    TIMESTAMPTZ, -- NULL = current open-ended period
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organization_modules_window_chk
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- At most one open (current) row per org+module
CREATE UNIQUE INDEX IF NOT EXISTS organization_modules_current_uidx
  ON organization_modules (org_id, module_id)
  WHERE effective_to IS NULL;

CREATE INDEX IF NOT EXISTS organization_modules_org_id_idx
  ON organization_modules (org_id);

CREATE INDEX IF NOT EXISTS organization_modules_module_id_idx
  ON organization_modules (module_id);

CREATE INDEX IF NOT EXISTS organization_modules_enabled_idx
  ON organization_modules (org_id, enabled)
  WHERE enabled = TRUE AND effective_to IS NULL;

-- -----------------------------------------------------------------------------
-- Subscriptions & line items (Stripe-aligned)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status                      vf_subscription_status NOT NULL DEFAULT 'trialing',
  billing_cycle               vf_billing_cycle NOT NULL DEFAULT 'monthly',
  currency                    CHAR(3) NOT NULL DEFAULT 'USD',
  -- Trial mirrored / linked from org for billing integration
  trial_start                 TIMESTAMPTZ,
  trial_end                   TIMESTAMPTZ,
  current_period_start        TIMESTAMPTZ,
  current_period_end          TIMESTAMPTZ,
  cancel_at_period_end        BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at                 TIMESTAMPTZ,
  external_customer_id        TEXT, -- denormalized from org for webhook speed
  external_subscription_id    TEXT UNIQUE, -- Stripe Subscription (sub_…)
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_trial_window_chk
    CHECK (
      (trial_start IS NULL AND trial_end IS NULL)
      OR (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end > trial_start)
    ),
  CONSTRAINT subscriptions_period_chk
    CHECK (
      current_period_start IS NULL
      OR current_period_end IS NULL
      OR current_period_end > current_period_start
    )
);

-- One "live" subscription per org (not canceled)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_live_per_org_uidx
  ON subscriptions (org_id)
  WHERE status IN ('trialing', 'active', 'past_due', 'incomplete', 'unpaid', 'paused');

CREATE INDEX IF NOT EXISTS subscriptions_org_id_idx
  ON subscriptions (org_id);

CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON subscriptions (status);

CREATE INDEX IF NOT EXISTS subscriptions_external_subscription_id_idx
  ON subscriptions (external_subscription_id)
  WHERE external_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS subscription_items (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id             UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  org_id                      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_id                   UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
  status                      vf_subscription_item_status NOT NULL DEFAULT 'active',
  billing_cycle               vf_billing_cycle NOT NULL,
  quantity                    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount_cents           INT NOT NULL CHECK (unit_amount_cents >= 0),
  currency                    CHAR(3) NOT NULL DEFAULT 'USD',
  external_subscription_item_id TEXT UNIQUE, -- Stripe Subscription Item (si_…)
  external_price_id           TEXT,          -- Stripe Price (price_…)
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_items_sub_module_uidx
  ON subscription_items (subscription_id, module_id)
  WHERE status IN ('active', 'trialing', 'incomplete');

CREATE INDEX IF NOT EXISTS subscription_items_subscription_id_idx
  ON subscription_items (subscription_id);

CREATE INDEX IF NOT EXISTS subscription_items_org_id_idx
  ON subscription_items (org_id);

CREATE INDEX IF NOT EXISTS subscription_items_module_id_idx
  ON subscription_items (module_id);

-- Keep subscription_items.org_id aligned with subscriptions.org_id
CREATE OR REPLACE FUNCTION vf_subscription_items_same_org()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  s_org UUID;
BEGIN
  SELECT org_id INTO s_org FROM subscriptions WHERE id = NEW.subscription_id;
  IF s_org IS DISTINCT FROM NEW.org_id THEN
    RAISE EXCEPTION 'subscription_items.org_id must match subscriptions.org_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscription_items_same_org ON subscription_items;
CREATE TRIGGER trg_subscription_items_same_org
  BEFORE INSERT OR UPDATE OF org_id, subscription_id ON subscription_items
  FOR EACH ROW EXECUTE PROCEDURE vf_subscription_items_same_org();

-- -----------------------------------------------------------------------------
-- Trial / subscription sync helpers (optional but production-useful)
-- -----------------------------------------------------------------------------

-- When org trial flips, keep live subscription status coherent if still trialing
CREATE OR REPLACE FUNCTION vf_sync_org_trial_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.trial_start IS NOT NULL AND NEW.trial_end IS NOT NULL THEN
    NEW.is_trial_active := (NOW() >= NEW.trial_start AND NOW() < NEW.trial_end);
  ELSE
    NEW.is_trial_active := FALSE;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organizations_trial_flag ON organizations;
CREATE TRIGGER trg_organizations_trial_flag
  BEFORE INSERT OR UPDATE OF trial_start, trial_end ON organizations
  FOR EACH ROW EXECUTE PROCEDURE vf_sync_org_trial_flag();

-- Touch updated_at
CREATE OR REPLACE FUNCTION vf_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'modules', 'module_prices', 'organizations', 'users', 'roles', 'permissions',
    'user_roles', 'organization_modules', 'subscriptions', 'subscription_items'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
       CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE PROCEDURE vf_touch_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- Seed: modules, roles, baseline list prices (adjust cents for production)
-- -----------------------------------------------------------------------------

INSERT INTO modules (code, name, description, sort_order) VALUES
  ('vericore', 'VeriCore', 'Workforce, credentials, training, and compliance core', 1),
  ('veripm',   'VeriPM',   'Project safety, SMS, field operations', 2),
  ('verihub',  'VeriHub',  'Hub, calculators, community, and cross-module surfaces', 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (code, name, description) VALUES
  ('owner',   'Owner',   'Full organization control including billing'),
  ('admin',   'Admin',   'Administer users, modules, and configuration'),
  ('manager', 'Manager', 'Operate day-to-day within enabled modules'),
  ('user',    'User',    'Standard end-user access within enabled modules')
ON CONFLICT (code) DO NOTHING;

-- Example permission keys (expand per product surface)
INSERT INTO permissions (key, name) VALUES
  ('vericore.workers.read', 'Read workers'),
  ('vericore.workers.write', 'Write workers'),
  ('vericore.billing.manage', 'Manage VeriCore billing entitlements'),
  ('veripm.projects.read', 'Read projects'),
  ('veripm.projects.write', 'Write projects'),
  ('veripm.safety.manage', 'Manage VeriPM safety workflows'),
  ('verihub.calculators.use', 'Use Hub calculators'),
  ('org.users.manage', 'Manage organization users'),
  ('org.billing.manage', 'Manage organization billing')
ON CONFLICT (key) DO NOTHING;

-- Map permissions → modules (org.* can map to all or none; here attach product perms)
INSERT INTO module_permissions (module_id, permission_id)
SELECT m.id, p.id
FROM modules m
JOIN permissions p ON (
  (m.code = 'vericore' AND p.key LIKE 'vericore.%')
  OR (m.code = 'veripm' AND p.key LIKE 'veripm.%')
  OR (m.code = 'verihub' AND p.key LIKE 'verihub.%')
)
ON CONFLICT DO NOTHING;

-- Owner gets all permissions; Admin gets all except could narrow later
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('owner', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.key IN (
  'vericore.workers.read', 'vericore.workers.write',
  'veripm.projects.read', 'veripm.projects.write', 'veripm.safety.manage',
  'verihub.calculators.use'
)
WHERE r.code = 'manager'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.key IN (
  'vericore.workers.read',
  'veripm.projects.read',
  'verihub.calculators.use'
)
WHERE r.code = 'user'
ON CONFLICT DO NOTHING;

-- Current list prices (placeholder — replace with real SKUs / Stripe price ids)
INSERT INTO module_prices (module_id, billing_cycle, currency, unit_amount_cents, effective_from)
SELECT m.id, 'monthly', 'USD',
  CASE m.code WHEN 'vericore' THEN 29900 WHEN 'veripm' THEN 39900 ELSE 9900 END,
  NOW()
FROM modules m
WHERE NOT EXISTS (
  SELECT 1 FROM module_prices mp
  WHERE mp.module_id = m.id AND mp.billing_cycle = 'monthly' AND mp.effective_to IS NULL
);

INSERT INTO module_prices (module_id, billing_cycle, currency, unit_amount_cents, effective_from)
SELECT m.id, 'annual', 'USD',
  CASE m.code WHEN 'vericore' THEN 299000 WHEN 'veripm' THEN 399000 ELSE 99000 END,
  NOW()
FROM modules m
WHERE NOT EXISTS (
  SELECT 1 FROM module_prices mp
  WHERE mp.module_id = m.id AND mp.billing_cycle = 'annual' AND mp.effective_to IS NULL
);

-- -----------------------------------------------------------------------------
-- Convenience view: effective entitlements
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_organization_effective_modules AS
SELECT
  om.org_id,
  om.module_id,
  m.code AS module_code,
  om.enabled,
  om.effective_from,
  om.effective_to,
  o.is_trial_active,
  o.trial_end,
  s.id AS subscription_id,
  s.status AS subscription_status,
  s.external_subscription_id
FROM organization_modules om
JOIN modules m ON m.id = om.module_id
JOIN organizations o ON o.id = om.org_id
LEFT JOIN LATERAL (
  SELECT s.*
  FROM subscriptions s
  WHERE s.org_id = om.org_id
    AND s.status IN ('trialing', 'active', 'past_due', 'paused')
  ORDER BY s.created_at DESC
  LIMIT 1
) s ON TRUE
WHERE om.effective_to IS NULL;

COMMIT;

-- =============================================================================
-- Suggested app rules (enforce in services, not only DB):
--   1. On org create: set trial_start=now(), trial_end=now()+7 days, is_trial_active=true;
--      create subscriptions row status=trialing; enable chosen modules in organization_modules.
--   2. Module access = organization_modules.enabled AND (is_trial_active OR subscription active)
--      AND user has permission via role_permissions, scoped by module_permissions.
--   3. Stripe webhooks update external_* ids and subscription/item statuses.
-- =============================================================================
