-- Developer Account System

DO $$ BEGIN
  CREATE TYPE "DeveloperRole" AS ENUM ('SystemAdmin', 'ModuleArchitect', 'SupportEngineer', 'BillingAdmin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DeveloperStatus" AS ENUM ('active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "developers" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "DeveloperRole" NOT NULL,
  "permissions" JSONB NOT NULL DEFAULT '[]',
  "full_name" TEXT,
  "status" "DeveloperStatus" NOT NULL DEFAULT 'active',
  "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "developers_email_key" ON "developers"("email");
CREATE INDEX IF NOT EXISTS "developers_role_idx" ON "developers"("role");
CREATE INDEX IF NOT EXISTS "developers_status_idx" ON "developers"("status");

CREATE TABLE IF NOT EXISTS "developer_refresh_tokens" (
  "id" UUID NOT NULL,
  "developer_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "developer_refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "developer_refresh_tokens_token_hash_key"
  ON "developer_refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "developer_refresh_tokens_developer_id_idx"
  ON "developer_refresh_tokens"("developer_id");
CREATE INDEX IF NOT EXISTS "developer_refresh_tokens_expires_at_idx"
  ON "developer_refresh_tokens"("expires_at");

ALTER TABLE "developer_refresh_tokens"
  DROP CONSTRAINT IF EXISTS "developer_refresh_tokens_developer_id_fkey";
ALTER TABLE "developer_refresh_tokens"
  ADD CONSTRAINT "developer_refresh_tokens_developer_id_fkey"
  FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "developer_api_keys" (
  "id" UUID NOT NULL,
  "developer_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "key_prefix" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "scopes" JSONB NOT NULL DEFAULT '[]',
  "last_used_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "developer_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "developer_api_keys_key_hash_key" ON "developer_api_keys"("key_hash");
CREATE INDEX IF NOT EXISTS "developer_api_keys_developer_id_idx" ON "developer_api_keys"("developer_id");

ALTER TABLE "developer_api_keys"
  DROP CONSTRAINT IF EXISTS "developer_api_keys_developer_id_fkey";
ALTER TABLE "developer_api_keys"
  ADD CONSTRAINT "developer_api_keys_developer_id_fkey"
  FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_key" ON "feature_flags"("key");

CREATE TABLE IF NOT EXISTS "impersonation_sessions" (
  "id" UUID NOT NULL,
  "developer_id" UUID NOT NULL,
  "target_org_id" UUID NOT NULL,
  "reason" TEXT,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "impersonation_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "impersonation_sessions_developer_id_started_at_idx"
  ON "impersonation_sessions"("developer_id", "started_at");
CREATE INDEX IF NOT EXISTS "impersonation_sessions_target_org_id_idx"
  ON "impersonation_sessions"("target_org_id");

ALTER TABLE "impersonation_sessions"
  DROP CONSTRAINT IF EXISTS "impersonation_sessions_developer_id_fkey";
ALTER TABLE "impersonation_sessions"
  ADD CONSTRAINT "impersonation_sessions_developer_id_fkey"
  FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "developer_action_logs" (
  "id" UUID NOT NULL,
  "developer_id" UUID,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resource_id" TEXT,
  "ip" TEXT,
  "user_agent" TEXT,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "developer_action_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "developer_action_logs_developer_id_created_at_idx"
  ON "developer_action_logs"("developer_id", "created_at");
CREATE INDEX IF NOT EXISTS "developer_action_logs_action_created_at_idx"
  ON "developer_action_logs"("action", "created_at");

ALTER TABLE "developer_action_logs"
  DROP CONSTRAINT IF EXISTS "developer_action_logs_developer_id_fkey";
ALTER TABLE "developer_action_logs"
  ADD CONSTRAINT "developer_action_logs_developer_id_fkey"
  FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
