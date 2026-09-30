-- Organization account extensions
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "industry" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "contact_email" TEXT,
  ADD COLUMN IF NOT EXISTS "contact_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "subscription_profile" JSONB,
  ADD COLUMN IF NOT EXISTS "modules_enabled" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "first_name" TEXT,
  ADD COLUMN IF NOT EXISTS "last_name" TEXT;

CREATE TABLE IF NOT EXISTS "org_roles" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "permissions" JSONB NOT NULL DEFAULT '[]',
  "system_code" "SystemRoleCode",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "org_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "org_roles_org_id_name_key" ON "org_roles"("org_id", "name");
CREATE INDEX IF NOT EXISTS "org_roles_org_id_idx" ON "org_roles"("org_id");

ALTER TABLE "org_roles"
  DROP CONSTRAINT IF EXISTS "org_roles_org_id_fkey";
ALTER TABLE "org_roles"
  ADD CONSTRAINT "org_roles_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "org_role_users" (
  "id" UUID NOT NULL,
  "org_role_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "org_role_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "org_role_users_org_role_id_user_id_key"
  ON "org_role_users"("org_role_id", "user_id");
CREATE INDEX IF NOT EXISTS "org_role_users_user_id_idx" ON "org_role_users"("user_id");

ALTER TABLE "org_role_users"
  DROP CONSTRAINT IF EXISTS "org_role_users_org_role_id_fkey";
ALTER TABLE "org_role_users"
  ADD CONSTRAINT "org_role_users_org_role_id_fkey"
  FOREIGN KEY ("org_role_id") REFERENCES "org_roles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "org_role_users"
  DROP CONSTRAINT IF EXISTS "org_role_users_user_id_fkey";
ALTER TABLE "org_role_users"
  ADD CONSTRAINT "org_role_users_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "onboarding_events" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "onboarding_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "onboarding_events_org_id_created_at_idx"
  ON "onboarding_events"("org_id", "created_at");
CREATE INDEX IF NOT EXISTS "onboarding_events_type_created_at_idx"
  ON "onboarding_events"("type", "created_at");

ALTER TABLE "onboarding_events"
  DROP CONSTRAINT IF EXISTS "onboarding_events_org_id_fkey";
ALTER TABLE "onboarding_events"
  ADD CONSTRAINT "onboarding_events_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
