-- FieldOS worker lifecycle persistence baseline
-- Apply via Prisma SQL migration or DBA workflow.

BEGIN;

-- 1) Company-scoped lifecycle/expiry rules
CREATE TABLE IF NOT EXISTS worker_lifecycle_rule_set (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL UNIQUE REFERENCES "Company"(id) ON DELETE CASCADE,
  orientation_expiry_days INTEGER NOT NULL DEFAULT 90,
  certification_expiry_days INTEGER NOT NULL DEFAULT 365,
  not_seen_days INTEGER NOT NULL DEFAULT 30,
  auto_deactivate BOOLEAN NOT NULL DEFAULT TRUE,
  auto_notify BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_lifecycle_rule_set_company
  ON worker_lifecycle_rule_set(company_id);

-- 2) Worker heartbeat column for lifecycle recency checks
ALTER TABLE "Worker"
  ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_worker_last_heartbeat
  ON "Worker"(last_heartbeat);

COMMIT;
