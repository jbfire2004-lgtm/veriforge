-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "project_safety_profiles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'medium',
    "required_jha_types" JSONB NOT NULL DEFAULT '[]',
    "required_inspections" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_equipment_certifications" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "required_emergency_plans" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_safety_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_safety_profile_versions" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_safety_profile_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_hazard_library" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "hazard_id" UUID NOT NULL,
    "title" TEXT,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "heca_category" TEXT NOT NULL DEFAULT 'routine',
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_hazard_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_control_library" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "title" TEXT,
    "control_strength" INTEGER NOT NULL,
    "verification_steps" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_control_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_zones" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "risk_level" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_zone_rules" (
    "id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "required_jha" JSONB NOT NULL DEFAULT '[]',
    "required_permits" JSONB NOT NULL DEFAULT '[]',
    "required_equipment_authorization" JSONB NOT NULL DEFAULT '[]',
    "required_sds" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_zone_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_equipment_rules" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "rule_key" TEXT NOT NULL,
    "required_inspections" JSONB NOT NULL DEFAULT '[]',
    "required_certs" JSONB NOT NULL DEFAULT '[]',
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_equipment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_training_requirements" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "required_courses" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_training_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_emergency_requirements" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "plan_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_emergency_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_safety_profiles_project_id_key" ON "project_safety_profiles"("project_id");
CREATE INDEX "project_safety_profiles_company_id_idx" ON "project_safety_profiles"("company_id");
CREATE INDEX "project_safety_profiles_company_id_project_id_idx" ON "project_safety_profiles"("company_id", "project_id");
CREATE UNIQUE INDEX "project_safety_profile_versions_profile_id_version_key" ON "project_safety_profile_versions"("profile_id", "version");
CREATE INDEX "project_safety_profile_versions_project_id_idx" ON "project_safety_profile_versions"("project_id");
CREATE UNIQUE INDEX "project_hazard_library_project_id_hazard_id_key" ON "project_hazard_library"("project_id", "hazard_id");
CREATE INDEX "project_hazard_library_company_id_project_id_idx" ON "project_hazard_library"("company_id", "project_id");
CREATE UNIQUE INDEX "project_control_library_project_id_control_id_key" ON "project_control_library"("project_id", "control_id");
CREATE INDEX "project_control_library_company_id_project_id_idx" ON "project_control_library"("company_id", "project_id");
CREATE INDEX "project_zones_project_id_idx" ON "project_zones"("project_id");
CREATE INDEX "project_zones_company_id_project_id_idx" ON "project_zones"("company_id", "project_id");
CREATE INDEX "project_zone_rules_zone_id_idx" ON "project_zone_rules"("zone_id");
CREATE UNIQUE INDEX "project_equipment_rules_project_id_rule_key_key" ON "project_equipment_rules"("project_id", "rule_key");
CREATE INDEX "project_equipment_rules_company_id_project_id_idx" ON "project_equipment_rules"("company_id", "project_id");
CREATE UNIQUE INDEX "project_training_requirements_project_id_role_key" ON "project_training_requirements"("project_id", "role");
CREATE INDEX "project_training_requirements_company_id_project_id_idx" ON "project_training_requirements"("company_id", "project_id");
CREATE INDEX "project_emergency_requirements_company_id_project_id_idx" ON "project_emergency_requirements"("company_id", "project_id");

-- AddForeignKey
ALTER TABLE "project_safety_profile_versions" ADD CONSTRAINT "project_safety_profile_versions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "project_safety_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_zone_rules" ADD CONSTRAINT "project_zone_rules_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "project_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
