-- VeriAgent metadata schema (apply via migrate job in production)
-- Stores configuration + audit metadata only — never prompts/images/FLHA bodies.

CREATE TABLE IF NOT EXISTS veri_agent_tenant_config (
  company_id      BIGINT PRIMARY KEY,
  region          TEXT NOT NULL DEFAULT 'ca-central-1',
  allow_image_egress BOOLEAN NOT NULL DEFAULT FALSE,
  llm_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  model_allowlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veri_agent_audit (
  id              BIGSERIAL PRIMARY KEY,
  correlation_id  TEXT NOT NULL,
  purpose         TEXT NOT NULL,
  company_id      BIGINT NOT NULL,
  project_id      BIGINT,
  actor_user_id   BIGINT,
  actor_roles     TEXT[] NOT NULL DEFAULT '{}',
  outcome         TEXT NOT NULL,
  reason          TEXT,
  image_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  prompt_hash     TEXT,
  prompt_char_count INT,
  model           TEXT,
  latency_ms      INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_veri_agent_audit_company_created
  ON veri_agent_audit (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_veri_agent_audit_correlation
  ON veri_agent_audit (correlation_id);
