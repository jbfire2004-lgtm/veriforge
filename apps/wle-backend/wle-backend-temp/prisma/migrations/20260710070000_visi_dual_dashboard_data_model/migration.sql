-- VeriHub Dual-Dashboard Data Model (VISI)
-- Project and company planes are isolated: no cross-plane FKs.

-- CreateEnum
CREATE TYPE "VisiDataPlane" AS ENUM ('project', 'company');

-- CreateEnum
CREATE TYPE "VisiTrendReportKind" AS ENUM (
  'cohort',
  'heca',
  'trif_ltif',
  'seasonal',
  'leading',
  'root_cause',
  'workforce',
  'predictive',
  'full_trends'
);

-- CreateTable
CREATE TABLE "anonymized_tokens" (
    "id" TEXT NOT NULL,
    "plane" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "salt_version" TEXT NOT NULL,
    "source_id_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymized_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_projects" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "region_band" TEXT,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_companies" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "region_band" TEXT,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_metrics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "hours_basis" INTEGER NOT NULL DEFAULT 200000,
    "hours_worked" DOUBLE PRECISION,
    "incident_rate_per_200k" DOUBLE PRECISION,
    "recordable_rate_per_200k" DOUBLE PRECISION,
    "lost_time_rate_per_200k" DOUBLE PRECISION,
    "near_miss_rate_per_200k" DOUBLE PRECISION,
    "severity_index" DOUBLE PRECISION,
    "heca_high_energy_rate" DOUBLE PRECISION,
    "heca_controls_verified_rate" DOUBLE PRECISION,
    "heca_distribution" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_metrics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "project_metrics_hours_basis_check" CHECK ("hours_basis" = 200000)
);

-- CreateTable
CREATE TABLE "company_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "hours_basis" INTEGER NOT NULL DEFAULT 200000,
    "hours_worked" DOUBLE PRECISION,
    "incident_rate_per_200k" DOUBLE PRECISION,
    "recordable_rate_per_200k" DOUBLE PRECISION,
    "lost_time_rate_per_200k" DOUBLE PRECISION,
    "near_miss_rate_per_200k" DOUBLE PRECISION,
    "severity_index" DOUBLE PRECISION,
    "heca_high_energy_rate" DOUBLE PRECISION,
    "heca_controls_verified_rate" DOUBLE PRECISION,
    "heca_distribution" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_metrics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_metrics_hours_basis_check" CHECK ("hours_basis" = 200000)
);

-- CreateTable
CREATE TABLE "leading_indicators" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "observation_rate" DOUBLE PRECISION,
    "inspection_completion_rate" DOUBLE PRECISION,
    "training_currency_rate" DOUBLE PRECISION,
    "near_miss_reporting_index" DOUBLE PRECISION,
    "controls_verified_rate" DOUBLE PRECISION,
    "leading_composite" DOUBLE PRECISION,
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leading_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visi_corrective_actions" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "on_time_rate" DOUBLE PRECISION,
    "open_avg" DOUBLE PRECISION,
    "overdue_count_avg" DOUBLE PRECISION,
    "aging" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visi_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_profiles" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "current_rate" DOUBLE PRECISION,
    "expiring_30d_rate" DOUBLE PRECISION,
    "expiring_60d_rate" DOUBLE PRECISION,
    "expiring_90d_rate" DOUBLE PRECISION,
    "role_distribution" JSONB,
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Industry aggregates are partitioned by entity_type (never mixed in one row).
CREATE TABLE "trend_cache" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "report_kind" "VisiTrendReportKind" NOT NULL,
    "horizon" TEXT NOT NULL DEFAULT '',
    "payload" JSONB NOT NULL,
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "entity_count" INTEGER,
    "min_sample" INTEGER NOT NULL DEFAULT 5,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "trend_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selector_state" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selector_state_pkey" PRIMARY KEY ("id")
);

-- Unique / indexes: anonymized_tokens
CREATE UNIQUE INDEX "anonymized_tokens_token_key" ON "anonymized_tokens"("token");
CREATE INDEX "anonymized_tokens_plane_idx" ON "anonymized_tokens"("plane");
CREATE INDEX "anonymized_tokens_source_id_hash_idx" ON "anonymized_tokens"("source_id_hash");

-- industry_projects
CREATE UNIQUE INDEX "industry_projects_token_key" ON "industry_projects"("token");
CREATE INDEX "industry_projects_industry_subtype_scale_idx" ON "industry_projects"("industry", "subtype", "scale");

-- industry_companies
CREATE UNIQUE INDEX "industry_companies_token_key" ON "industry_companies"("token");
CREATE INDEX "industry_companies_industry_subtype_scale_idx" ON "industry_companies"("industry", "subtype", "scale");

-- project_metrics
CREATE UNIQUE INDEX "project_metrics_project_id_period_key" ON "project_metrics"("project_id", "period");
CREATE INDEX "project_metrics_period_idx" ON "project_metrics"("period");

-- company_metrics
CREATE UNIQUE INDEX "company_metrics_company_id_period_key" ON "company_metrics"("company_id", "period");
CREATE INDEX "company_metrics_period_idx" ON "company_metrics"("period");

-- leading_indicators
CREATE UNIQUE INDEX "leading_indicators_entity_type_token_period_key" ON "leading_indicators"("entity_type", "token", "period");
CREATE INDEX "leading_indicators_entity_type_period_idx" ON "leading_indicators"("entity_type", "period");

-- visi_corrective_actions
CREATE UNIQUE INDEX "visi_corrective_actions_entity_type_token_period_key" ON "visi_corrective_actions"("entity_type", "token", "period");
CREATE INDEX "visi_corrective_actions_entity_type_period_idx" ON "visi_corrective_actions"("entity_type", "period");

-- competency_profiles
CREATE UNIQUE INDEX "competency_profiles_entity_type_token_period_key" ON "competency_profiles"("entity_type", "token", "period");
CREATE INDEX "competency_profiles_entity_type_period_idx" ON "competency_profiles"("entity_type", "period");

-- trend_cache (industry aggregates keyed by entity_type)
CREATE UNIQUE INDEX "trend_cache_cohort_key" ON "trend_cache"("entity_type", "industry", "subtype", "scale", "period", "report_kind", "horizon");
CREATE INDEX "trend_cache_entity_type_period_idx" ON "trend_cache"("entity_type", "period");
CREATE INDEX "trend_cache_expires_at_idx" ON "trend_cache"("expires_at");

-- selector_state
CREATE UNIQUE INDEX "selector_state_user_id_key" ON "selector_state"("user_id");
CREATE INDEX "selector_state_entity_type_idx" ON "selector_state"("entity_type");

-- FKs: tokens → plane entities (no project↔ company links)
ALTER TABLE "industry_projects" ADD CONSTRAINT "industry_projects_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "industry_companies" ADD CONSTRAINT "industry_companies_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_metrics" ADD CONSTRAINT "project_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "industry_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_metrics" ADD CONSTRAINT "company_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "industry_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leading_indicators" ADD CONSTRAINT "leading_indicators_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "visi_corrective_actions" ADD CONSTRAINT "visi_corrective_actions_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competency_profiles" ADD CONSTRAINT "competency_profiles_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- Token prefix must match plane
ALTER TABLE "anonymized_tokens" ADD CONSTRAINT "anonymized_tokens_prefix_check" CHECK (
  ("plane" = 'project' AND "token" LIKE 'proj_%')
  OR ("plane" = 'company' AND "token" LIKE 'co_%')
);
