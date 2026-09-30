-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "company_safety_profiles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "corporate_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "corporate_policies" JSONB NOT NULL DEFAULT '[]',
    "corporate_ppe_standards" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_safety_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_profile_versions" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_safety_profile_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_hazard_library" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "hazard_id" UUID NOT NULL,
    "title" TEXT,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "heca_category" TEXT NOT NULL DEFAULT 'routine',
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_hazard_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_control_library" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "title" TEXT,
    "control_strength" INTEGER NOT NULL,
    "verification_steps" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_control_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_training_matrix" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "required_courses" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_training_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "policy_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "requires_ack_for_access" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_sds_library" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "cas_number" TEXT,
    "whmis_classification" TEXT,
    "ppe_requirements" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "file_path" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_sds_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_emergency_plans" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "plan_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_emergency_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_equipment_rules" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "rule_key" TEXT NOT NULL,
    "required_inspections" JSONB NOT NULL DEFAULT '[]',
    "required_certs" JSONB NOT NULL DEFAULT '[]',
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_equipment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_zone_templates" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "template_code" TEXT NOT NULL,
    "zone_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "requires_jha" BOOLEAN NOT NULL DEFAULT false,
    "high_risk" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_zone_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_profiles_company_id_key" ON "company_safety_profiles"("company_id");
CREATE INDEX "company_safety_profiles_company_id_idx" ON "company_safety_profiles"("company_id");
CREATE UNIQUE INDEX "company_safety_profile_versions_profile_id_version_key" ON "company_safety_profile_versions"("profile_id", "version");
CREATE INDEX "company_safety_profile_versions_company_id_idx" ON "company_safety_profile_versions"("company_id");
CREATE UNIQUE INDEX "company_hazard_library_company_id_hazard_id_key" ON "company_hazard_library"("company_id", "hazard_id");
CREATE INDEX "company_hazard_library_company_id_idx" ON "company_hazard_library"("company_id");
CREATE UNIQUE INDEX "company_control_library_company_id_control_id_key" ON "company_control_library"("company_id", "control_id");
CREATE INDEX "company_control_library_company_id_idx" ON "company_control_library"("company_id");
CREATE UNIQUE INDEX "company_training_matrix_company_id_role_key" ON "company_training_matrix"("company_id", "role");
CREATE INDEX "company_training_matrix_company_id_idx" ON "company_training_matrix"("company_id");
CREATE INDEX "company_policies_company_id_idx" ON "company_policies"("company_id");
CREATE INDEX "company_sds_library_company_id_idx" ON "company_sds_library"("company_id");
CREATE INDEX "company_emergency_plans_company_id_idx" ON "company_emergency_plans"("company_id");
CREATE UNIQUE INDEX "company_equipment_rules_company_id_rule_key_key" ON "company_equipment_rules"("company_id", "rule_key");
CREATE INDEX "company_equipment_rules_company_id_idx" ON "company_equipment_rules"("company_id");
CREATE UNIQUE INDEX "company_zone_templates_company_id_template_code_key" ON "company_zone_templates"("company_id", "template_code");
CREATE INDEX "company_zone_templates_company_id_idx" ON "company_zone_templates"("company_id");

-- AddForeignKey
ALTER TABLE "company_safety_profile_versions" ADD CONSTRAINT "company_safety_profile_versions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "company_safety_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
