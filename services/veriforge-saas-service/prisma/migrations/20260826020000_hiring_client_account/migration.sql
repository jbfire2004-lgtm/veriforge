-- Hiring Client Account System

DO $$ BEGIN
  CREATE TYPE "HiringClientStatus" AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "HiringClientRole" AS ENUM ('ClientAdmin', 'Reviewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContractAwardStatus" AS ENUM ('pending', 'awarded', 'declined', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "hiring_clients" (
  "id" UUID NOT NULL,
  "company_name" TEXT NOT NULL,
  "contact_name" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "contact_phone" TEXT,
  "status" "HiringClientStatus" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hiring_clients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "hiring_clients_status_idx" ON "hiring_clients"("status");
CREATE INDEX IF NOT EXISTS "hiring_clients_contact_email_idx" ON "hiring_clients"("contact_email");

CREATE TABLE IF NOT EXISTS "hiring_client_users" (
  "id" UUID NOT NULL,
  "hiring_client_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "HiringClientRole" NOT NULL DEFAULT 'Reviewer',
  "permissions" JSONB NOT NULL DEFAULT '[]',
  "full_name" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'active',
  "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hiring_client_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hiring_client_users_hiring_client_id_email_key"
  ON "hiring_client_users"("hiring_client_id", "email");
CREATE INDEX IF NOT EXISTS "hiring_client_users_email_idx" ON "hiring_client_users"("email");
CREATE INDEX IF NOT EXISTS "hiring_client_users_hiring_client_id_idx"
  ON "hiring_client_users"("hiring_client_id");

ALTER TABLE "hiring_client_users"
  DROP CONSTRAINT IF EXISTS "hiring_client_users_hiring_client_id_fkey";
ALTER TABLE "hiring_client_users"
  ADD CONSTRAINT "hiring_client_users_hiring_client_id_fkey"
  FOREIGN KEY ("hiring_client_id") REFERENCES "hiring_clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hiring_client_refresh_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hiring_client_refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hiring_client_refresh_tokens_token_hash_key"
  ON "hiring_client_refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "hiring_client_refresh_tokens_user_id_idx"
  ON "hiring_client_refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "hiring_client_refresh_tokens_expires_at_idx"
  ON "hiring_client_refresh_tokens"("expires_at");

ALTER TABLE "hiring_client_refresh_tokens"
  DROP CONSTRAINT IF EXISTS "hiring_client_refresh_tokens_user_id_fkey";
ALTER TABLE "hiring_client_refresh_tokens"
  ADD CONSTRAINT "hiring_client_refresh_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "hiring_client_users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "contract_awards" (
  "id" UUID NOT NULL,
  "hiring_client_id" UUID NOT NULL,
  "contractor_org_id" UUID NOT NULL,
  "awarded_by_user_id" UUID,
  "status" "ContractAwardStatus" NOT NULL DEFAULT 'awarded',
  "project_name" TEXT,
  "notes" TEXT,
  "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "contract_awards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contract_awards_hiring_client_id_awarded_at_idx"
  ON "contract_awards"("hiring_client_id", "awarded_at");
CREATE INDEX IF NOT EXISTS "contract_awards_contractor_org_id_idx"
  ON "contract_awards"("contractor_org_id");

ALTER TABLE "contract_awards"
  DROP CONSTRAINT IF EXISTS "contract_awards_hiring_client_id_fkey";
ALTER TABLE "contract_awards"
  ADD CONSTRAINT "contract_awards_hiring_client_id_fkey"
  FOREIGN KEY ("hiring_client_id") REFERENCES "hiring_clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contract_awards"
  DROP CONSTRAINT IF EXISTS "contract_awards_awarded_by_user_id_fkey";
ALTER TABLE "contract_awards"
  ADD CONSTRAINT "contract_awards_awarded_by_user_id_fkey"
  FOREIGN KEY ("awarded_by_user_id") REFERENCES "hiring_client_users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
