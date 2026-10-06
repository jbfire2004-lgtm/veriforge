-- Vera Admin Control Panel (ACP)

CREATE TYPE "AcpTenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL');
CREATE TYPE "AcpSubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL');

CREATE TABLE "acp_tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" INTEGER,
    "status" "AcpTenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_user_roles" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_user_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'access',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "acp_role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

CREATE TABLE "acp_subscription_tiers" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "limits_json" JSONB NOT NULL DEFAULT '{}',
    "features_json" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_subscription_tiers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_tenant_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "status" "AcpSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_enabled" BOOLEAN NOT NULL DEFAULT false,
    "required_tier_key" TEXT,
    "module" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acp_tenant_feature_flags" (
    "tenant_id" TEXT NOT NULL,
    "feature_flag_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "acp_tenant_feature_flags_pkey" PRIMARY KEY ("tenant_id","feature_flag_id")
);

CREATE TABLE "acp_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_audit_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN "acp_tenant_id" TEXT;

CREATE UNIQUE INDEX "acp_tenants_slug_key" ON "acp_tenants"("slug");
CREATE UNIQUE INDEX "acp_tenants_company_id_key" ON "acp_tenants"("company_id");
CREATE UNIQUE INDEX "acp_roles_tenant_id_key_key" ON "acp_roles"("tenant_id", "key");
CREATE UNIQUE INDEX "acp_user_roles_user_id_role_id_tenant_id_key" ON "acp_user_roles"("user_id", "role_id", "tenant_id");
CREATE UNIQUE INDEX "acp_permissions_key_key" ON "acp_permissions"("key");
CREATE UNIQUE INDEX "acp_subscription_tiers_key_key" ON "acp_subscription_tiers"("key");
CREATE UNIQUE INDEX "acp_tenant_subscriptions_tenant_id_key" ON "acp_tenant_subscriptions"("tenant_id");
CREATE UNIQUE INDEX "acp_feature_flags_key_key" ON "acp_feature_flags"("key");

CREATE INDEX "acp_user_roles_user_id_idx" ON "acp_user_roles"("user_id");
CREATE INDEX "acp_user_roles_tenant_id_idx" ON "acp_user_roles"("tenant_id");
CREATE INDEX "acp_permissions_module_idx" ON "acp_permissions"("module");
CREATE INDEX "acp_audit_logs_tenant_id_created_at_idx" ON "acp_audit_logs"("tenant_id", "created_at");
CREATE INDEX "acp_audit_logs_entity_type_entity_id_idx" ON "acp_audit_logs"("entity_type", "entity_id");

ALTER TABLE "acp_tenants" ADD CONSTRAINT "acp_tenants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "acp_roles" ADD CONSTRAINT "acp_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "acp_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_tenant_subscriptions" ADD CONSTRAINT "acp_tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_tenant_subscriptions" ADD CONSTRAINT "acp_tenant_subscriptions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "acp_subscription_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "acp_tenant_feature_flags" ADD CONSTRAINT "acp_tenant_feature_flags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_tenant_feature_flags" ADD CONSTRAINT "acp_tenant_feature_flags_feature_flag_id_fkey" FOREIGN KEY ("feature_flag_id") REFERENCES "acp_feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_acp_tenant_id_fkey" FOREIGN KEY ("acp_tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
