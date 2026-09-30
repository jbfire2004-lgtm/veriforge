-- Idempotent catalog seed (roles, modules, permissions, mappings, default prices).
-- Prefer `npm run db:seed` (TypeScript) in app deploys; this SQL is for ops / Flyway-style runs.
-- Safe to re-run.

BEGIN;

-- Roles
INSERT INTO roles (id, code, name, description, is_system, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'owner',   'Owner',   'Full organization control including billing and trial', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'admin',   'Admin',   'Manage users, modules, and most org settings', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'manager', 'Manager', 'Operational access across enabled modules', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'user',    'User',    'Read-focused access to enabled modules', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system = true,
  updated_at = CURRENT_TIMESTAMP;

-- Modules
INSERT INTO modules (id, code, name, description, is_active, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'vericore', 'VeriCore', 'Workforce, credentials, training, and compliance core', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm',   'VeriPM',   'Project safety, SMS, field operations', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub',  'VeriHub',  'Hub, calculators, and cross-module surfaces', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- Default list prices (only insert when no open price row exists)
INSERT INTO module_prices (id, module_id, billing_cycle, currency, unit_amount_cents, effective_from, created_at, updated_at)
SELECT gen_random_uuid(), m.id, 'monthly'::"BillingCycle", 'USD',
  CASE m.code WHEN 'vericore' THEN 29900 WHEN 'veripm' THEN 39900 ELSE 9900 END,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM modules m
WHERE NOT EXISTS (
  SELECT 1 FROM module_prices mp
  WHERE mp.module_id = m.id AND mp.billing_cycle = 'monthly' AND mp.effective_to IS NULL
);

INSERT INTO module_prices (id, module_id, billing_cycle, currency, unit_amount_cents, effective_from, created_at, updated_at)
SELECT gen_random_uuid(), m.id, 'annual'::"BillingCycle", 'USD',
  CASE m.code WHEN 'vericore' THEN 299000 WHEN 'veripm' THEN 399000 ELSE 99000 END,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM modules m
WHERE NOT EXISTS (
  SELECT 1 FROM module_prices mp
  WHERE mp.module_id = m.id AND mp.billing_cycle = 'annual' AND mp.effective_to IS NULL
);

-- Permissions (catalog)
INSERT INTO permissions (id, key, name, created_at, updated_at) VALUES
  (gen_random_uuid(), 'org.users.manage', 'Manage organization users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'org.billing.manage', 'Manage organization billing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'org.profile.update', 'Update organization profile', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'org.trial.extend', 'Extend organization trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'org.settings.view', 'View organization settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'platform.admin', 'Platform administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.audit.view', 'View VeriCore audits', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.audit.edit', 'Edit VeriCore audits', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.workers.view', 'View workers', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.workers.edit', 'Edit workers', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.credentials.view', 'View credentials', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.credentials.edit', 'Edit credentials', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'vericore.compliance.manage', 'Manage compliance workflows', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.project.view', 'View projects', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.project.edit', 'Edit projects', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.task.view', 'View tasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.task.edit', 'Edit tasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.timeline.view', 'View timelines', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.timeline.edit', 'Edit timelines', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'veripm.safety.manage', 'Manage VeriPM safety', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.file.view', 'View Hub files', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.file.upload', 'Upload Hub files', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.file.delete', 'Delete Hub files', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.collab.view', 'View Hub collaboration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.collab.edit', 'Edit Hub collaboration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'verihub.calculators.use', 'Use Hub calculators', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP;

-- Module ↔ permission mappings
INSERT INTO module_permissions (module_id, permission_id, created_at)
SELECT m.id, p.id, CURRENT_TIMESTAMP
FROM modules m
JOIN permissions p ON (
  (m.code = 'vericore' AND p.key LIKE 'vericore.%')
  OR (m.code = 'veripm' AND p.key LIKE 'veripm.%')
  OR (m.code = 'verihub' AND p.key LIKE 'verihub.%')
)
ON CONFLICT DO NOTHING;

-- Role ↔ permission defaults
-- Owner: all except platform.admin
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'owner' AND p.key <> 'platform.admin'
ON CONFLICT DO NOTHING;

-- Admin: all except platform.admin and org.trial.extend
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
  AND p.key NOT IN ('platform.admin', 'org.trial.extend')
ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
JOIN permissions p ON p.key IN (
  'org.settings.view',
  'vericore.audit.view','vericore.audit.edit','vericore.workers.view','vericore.workers.edit',
  'vericore.credentials.view','vericore.credentials.edit','vericore.compliance.manage',
  'veripm.project.view','veripm.project.edit','veripm.task.view','veripm.task.edit',
  'veripm.timeline.view','veripm.timeline.edit','veripm.safety.manage',
  'verihub.file.view','verihub.file.upload','verihub.collab.view','verihub.collab.edit',
  'verihub.calculators.use'
)
WHERE r.code = 'manager'
ON CONFLICT DO NOTHING;

-- User (read-focused)
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
JOIN permissions p ON p.key IN (
  'org.settings.view',
  'vericore.audit.view','vericore.workers.view','vericore.credentials.view',
  'veripm.project.view','veripm.task.view','veripm.timeline.view',
  'verihub.file.view','verihub.collab.view','verihub.calculators.use'
)
WHERE r.code = 'user'
ON CONFLICT DO NOTHING;

-- Platform setting: annual discount
INSERT INTO platform_settings (key, value, created_at, updated_at)
VALUES ('annual_discount_percent', '{"percent": 17}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

COMMIT;
