-- VeriSuite SMS Final Production Data Model
-- Standalone from-empty migration (not yet applied in production).
--
-- SoR deviation: sor_jha_flha_id, sor_action_id, sor_meeting_id, sor_emergency_plan_id
-- are TEXT (UUID), matching Nest SoR primary keys — not INT as in early canvas literals.
--
-- Retention (Final Data Model §9 — enforced by jobs/policy, not DB constraints):
--   *_metrics (day grain): hot 90d, roll to month; purge day rows >90d.
--   *_metrics (month/quarter): hot 5y; purge per tenant/legal hold.
--   geo_nodes / entitlements: life of tenant; soft then hard delete.
--   industry_benchmark_cohorts: hot 5y; older anon aggregates safe to purge.
--   flha/jha/erp/meeting/actions: project + 5y; soft → hard per policy.
--   erp_drill_roster: hot 3y; minimize PII after 1y; hard after 3y.
--   ai_insights_cache (active): TTL 15m–24h; nightly expired purge.
--   ai_suggestion_audit / sms_audit_log: 2–7y immutable; legal hold overrides.
--   cail_inference_logs: 2y then hard purge.
--   metrics_outbox: processed rows purged by worker policy after ack.

-- Enums
CREATE TYPE "SmsAccessPlane" AS ENUM ('project', 'company', 'subcontractor');

CREATE TYPE "SmsPeriodGrain" AS ENUM ('day', 'week', 'month', 'quarter');

CREATE TYPE "SmsGeoLevel" AS ENUM ('global', 'continent', 'country', 'province', 'region', 'city', 'site');

CREATE TYPE "SmsFlhaStatus" AS ENUM ('draft', 'active', 'closed', 'void');

CREATE TYPE "SmsQualityBand" AS ENUM ('pass', 'warn', 'fail');

CREATE TYPE "SmsFieldOsSyncStatus" AS ENUM ('pending', 'synced', 'error', 'na');

CREATE TYPE "SmsJhaStatus" AS ENUM ('draft', 'in_review', 'approved', 'archived');

CREATE TYPE "SmsErpScenario" AS ENUM ('electrical', 'fall', 'trench', 'chemical', 'rollover', 'general');

CREATE TYPE "SmsErpStatus" AS ENUM ('draft', 'active', 'archived');

CREATE TYPE "SmsActionKind" AS ENUM ('corrective', 'preventive');

CREATE TYPE "SmsActionStatus" AS ENUM ('open', 'in_progress', 'pending_verify', 'closed', 'void');

CREATE TYPE "SmsPriority" AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE "SmsSourceModule" AS ENUM ('incident', 'inspection', 'jha', 'flha', 'meeting', 'manual', 'ai');

CREATE TYPE "SmsMeetingType" AS ENUM ('toolbox', 'orientation', 'emergency_drill_brief', 'other');

CREATE TYPE "SmsMeetingStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TYPE "SmsAiModelTier" AS ENUM ('D0', 'D1', 'L1', 'L2');

CREATE TYPE "SmsAiTone" AS ENUM ('neutral', 'positive', 'caution', 'alert');

CREATE TYPE "SmsAiSource" AS ENUM ('rules', 'scorer', 'llm', 'fallback');

CREATE TYPE "SmsAiStatus" AS ENUM ('active', 'accepted', 'rejected', 'expired', 'superseded');

CREATE TYPE "SmsDrillRosterStatus" AS ENUM ('expected', 'accounted', 'missing', 'excused');

CREATE TYPE "SmsEntitlementReason" AS ENUM ('no_data', 'license', 'denied');

-- Tables
CREATE TABLE "sms_geo_nodes" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "parent_geo_node_id" TEXT,
    "geo_level" "SmsGeoLevel" NOT NULL,
    "geo_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "iso_country" TEXT,
    "admin1_code" TEXT,
    "timezone" TEXT,
    "centroid_lat" DOUBLE PRECISION,
    "centroid_lng" DOUBLE PRECISION,
    "path_ltree" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_geo_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_geo_node_entitlements" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "geo_node_id" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reason_code" "SmsEntitlementReason",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sms_geo_node_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_project_geo_map" (
    "project_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "site_geo_node_id" TEXT NOT NULL,
    "country_geo_node_id" TEXT,
    "province_geo_node_id" TEXT,

    CONSTRAINT "sms_project_geo_map_pkey" PRIMARY KEY ("project_id")
);

CREATE TABLE "sms_industry_benchmark_cohorts" (
    "id" TEXT NOT NULL,
    "industry_code" TEXT NOT NULL,
    "region_scope" TEXT NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "metric_key" TEXT NOT NULL,
    "cohort_n" INTEGER NOT NULL,
    "p25" NUMERIC(12, 4),
    "p50" NUMERIC(12, 4),
    "p75" NUMERIC(12, 4),
    "mean" NUMERIC(12, 4),
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "computed_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sms_industry_benchmark_cohorts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_company_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "lt_count" INTEGER NOT NULL DEFAULT 0,
    "recordable_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" NUMERIC(12, 4),
    "near_miss_rate_per_200k" NUMERIC(12, 4),
    "ltifr" NUMERIC(12, 4),
    "trir" NUMERIC(12, 4),
    "open_actions_count" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions_count" INTEGER NOT NULL DEFAULT 0,
    "action_effectiveness_pct" NUMERIC(5, 2),
    "inspection_completion_pct" NUMERIC(5, 2),
    "flha_avg_quality" NUMERIC(5, 2),
    "meeting_attendance_pct" NUMERIC(5, 2),
    "training_coverage_pct" NUMERIC(5, 2),
    "erp_drill_readiness_pct" NUMERIC(5, 2),
    "competency_risk_index_avg" NUMERIC(5, 2),
    "industry_code" TEXT,
    "benchmark_region_scope" TEXT,
    "industry_benchmark_json" JSONB,
    "kpis_ext_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_company_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_project_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "site_geo_node_id" TEXT,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "open_incident_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" NUMERIC(12, 4),
    "severity_json" JSONB,
    "open_actions_count" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions_count" INTEGER NOT NULL DEFAULT 0,
    "inspection_findings_open" INTEGER NOT NULL DEFAULT 0,
    "bbo_quality_avg" NUMERIC(5, 2),
    "flha_avg_quality" NUMERIC(5, 2),
    "flha_energy_coverage_pct" NUMERIC(5, 2),
    "jha_high_residual_count" INTEGER NOT NULL DEFAULT 0,
    "meeting_attendance_pct" NUMERIC(5, 2),
    "training_overdue_count" INTEGER NOT NULL DEFAULT 0,
    "erp_quality_avg" NUMERIC(5, 2),
    "drill_readiness_pct" NUMERIC(5, 2),
    "leading_heatmap_json" JSONB,
    "industry_benchmark_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_project_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_regional_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "geo_node_id" TEXT NOT NULL,
    "geo_level" "SmsGeoLevel" NOT NULL,
    "geo_code" TEXT NOT NULL,
    "parent_geo_node_id" TEXT,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "project_count" INTEGER NOT NULL DEFAULT 0,
    "hours_worked" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" NUMERIC(12, 4),
    "open_incidents" INTEGER NOT NULL DEFAULT 0,
    "open_actions" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions" INTEGER NOT NULL DEFAULT 0,
    "competency_risk_index" NUMERIC(5, 2),
    "flha_avg_quality" NUMERIC(5, 2),
    "drill_readiness_pct" NUMERIC(5, 2),
    "parent_incident_rate_per_200k" NUMERIC(12, 4),
    "delta_vs_parent_rate" NUMERIC(12, 4),
    "hotspot_score" NUMERIC(5, 2),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "metrics_json" JSONB,
    "industry_benchmark_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_regional_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_competency_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "role_key" TEXT NOT NULL,
    "competency_key" TEXT NOT NULL,
    "headcount" INTEGER NOT NULL DEFAULT 0,
    "coverage_pct" NUMERIC(5, 2),
    "overdue_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_30d_count" INTEGER NOT NULL DEFAULT 0,
    "auth_gap_count" INTEGER NOT NULL DEFAULT 0,
    "risk_index" NUMERIC(5, 2),
    "forecast_series_json" JSONB,
    "model_version" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_competency_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_inspection_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "inspections_completed" INTEGER NOT NULL DEFAULT 0,
    "inspections_planned" INTEGER NOT NULL DEFAULT 0,
    "completion_pct" NUMERIC(5, 2),
    "bbo_count" INTEGER NOT NULL DEFAULT 0,
    "focus_audit_count" INTEGER NOT NULL DEFAULT 0,
    "bbo_quality_avg" NUMERIC(5, 2),
    "findings_open" INTEGER NOT NULL DEFAULT 0,
    "findings_closed" INTEGER NOT NULL DEFAULT 0,
    "findings_rate_per_200k" NUMERIC(12, 4),
    "ai_flagged_count" INTEGER NOT NULL DEFAULT 0,
    "repeat_finding_count" INTEGER NOT NULL DEFAULT 0,
    "actions_linked_count" INTEGER NOT NULL DEFAULT 0,
    "focus_packs_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_inspection_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_incident_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    "total_incidents" INTEGER NOT NULL DEFAULT 0,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "investigating_count" INTEGER NOT NULL DEFAULT 0,
    "closed_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" NUMERIC(12, 4),
    "severity_json" JSONB,
    "type_json" JSONB,
    "overdue_investigations_gt_14d" INTEGER NOT NULL DEFAULT 0,
    "sif_potential_count" INTEGER NOT NULL DEFAULT 0,
    "top_root_causes_json" JSONB,
    "top_locations_json" JSONB,
    "industry_code" TEXT,
    "industry_compare_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMPTZ NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_incident_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_flha_records" (
    "id" TEXT NOT NULL,
    "sor_jha_flha_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL DEFAULT '',
    "status" "SmsFlhaStatus" NOT NULL DEFAULT 'draft',
    "work_type" TEXT,
    "location" TEXT,
    "crew_key" TEXT,
    "jha_record_id" TEXT,
    "energy_json" JSONB,
    "hazard_count" INTEGER NOT NULL DEFAULT 0,
    "control_count" INTEGER NOT NULL DEFAULT 0,
    "quality_score" NUMERIC(5, 2),
    "quality_band" "SmsQualityBand",
    "sign_in_count" INTEGER NOT NULL DEFAULT 0,
    "gate_log_match_pct" NUMERIC(5, 2),
    "ai_flags_json" JSONB,
    "fieldos_sync_status" "SmsFieldOsSyncStatus" NOT NULL DEFAULT 'na',
    "effective_on" DATE,
    "closed_at" TIMESTAMPTZ,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_flha_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_jha_records" (
    "id" TEXT NOT NULL,
    "sor_jha_flha_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "template_key" TEXT,
    "work_type" TEXT,
    "industry" TEXT,
    "status" "SmsJhaStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "residual_risk_max" NUMERIC(8, 2),
    "risk_rank_json" JSONB,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "quality_score" NUMERIC(5, 2),
    "quality_band" "SmsQualityBand",
    "erp_record_id" TEXT,
    "tasks_count" INTEGER NOT NULL DEFAULT 0,
    "hazards_count" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMPTZ,
    "approved_by_user_id" INTEGER,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_jha_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_erp_records" (
    "id" TEXT NOT NULL,
    "sor_emergency_plan_id" TEXT,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "scenario" "SmsErpScenario" NOT NULL DEFAULT 'general',
    "work_type" TEXT,
    "region_code" TEXT,
    "geo_node_id" TEXT,
    "hazards_json" JSONB,
    "steps_json" JSONB,
    "muster_point" TEXT,
    "ems_contacts_json" JSONB,
    "ems_call_script" TEXT,
    "quality_score" NUMERIC(5, 2),
    "compliance_json" JSONB,
    "status" "SmsErpStatus" NOT NULL DEFAULT 'draft',
    "last_drill_at" TIMESTAMPTZ,
    "drill_readiness_pct" NUMERIC(5, 2),
    "simulation_last_score" NUMERIC(5, 2),
    "ai_suggestion_id" TEXT,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_erp_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_erp_drill_sessions" (
    "id" TEXT NOT NULL,
    "erp_record_id" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL,
    "ended_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "track_everyone" BOOLEAN NOT NULL DEFAULT false,
    "outcome_score" NUMERIC(5, 2),
    "failed_gates_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sms_erp_drill_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_erp_drill_roster" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "person_key" TEXT NOT NULL,
    "display_name_redacted" TEXT NOT NULL,
    "sources_json" JSONB,
    "status" "SmsDrillRosterStatus" NOT NULL DEFAULT 'expected',
    "sign_in_refs_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sms_erp_drill_roster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_corrective_actions" (
    "id" TEXT NOT NULL,
    "sor_action_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "kind" "SmsActionKind" NOT NULL DEFAULT 'corrective',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SmsActionStatus" NOT NULL DEFAULT 'open',
    "priority" "SmsPriority" NOT NULL DEFAULT 'medium',
    "root_cause_key" TEXT,
    "source_module" "SmsSourceModule" NOT NULL DEFAULT 'manual',
    "source_record_id" TEXT,
    "owner_user_id" INTEGER,
    "owner_role" TEXT,
    "due_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "days_open" INTEGER,
    "effectiveness_pct" NUMERIC(5, 2),
    "ai_suggestion_id" TEXT,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_corrective_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_safety_meetings" (
    "id" TEXT NOT NULL,
    "sor_meeting_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "meeting_type" "SmsMeetingType" NOT NULL DEFAULT 'toolbox',
    "scheduled_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "status" "SmsMeetingStatus" NOT NULL DEFAULT 'scheduled',
    "topic_titles_json" JSONB,
    "ai_generated_topic" BOOLEAN NOT NULL DEFAULT false,
    "ai_suggestion_id" TEXT,
    "attendee_expected" INTEGER NOT NULL DEFAULT 0,
    "attendee_signed" INTEGER NOT NULL DEFAULT 0,
    "attendance_pct" NUMERIC(5, 2),
    "linked_erp_drill_id" TEXT,
    "location" TEXT,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_safety_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_ai_insights_cache" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "geo_node_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL,
    "visibility_roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "behavior_id" TEXT NOT NULL,
    "page_context" TEXT,
    "model_id" TEXT NOT NULL,
    "model_tier" "SmsAiModelTier" NOT NULL,
    "model_version" TEXT,
    "input_hash" TEXT NOT NULL,
    "confidence" NUMERIC(4, 3) NOT NULL,
    "tone" "SmsAiTone" NOT NULL DEFAULT 'neutral',
    "headline" TEXT,
    "body" TEXT,
    "payload_json" JSONB NOT NULL DEFAULT '{}',
    "evidence_refs_json" JSONB,
    "source" "SmsAiSource" NOT NULL DEFAULT 'rules',
    "status" "SmsAiStatus" NOT NULL DEFAULT 'active',
    "accepted_by_user_id" INTEGER,
    "accepted_at" TIMESTAMPTZ,
    "created_entity_type" TEXT,
    "created_entity_id" TEXT,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "latency_ms" INTEGER,
    "request_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sms_ai_insights_cache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_record_links" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "from_type" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_type" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "link_role" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_record_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_audit_log" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "plane" "SmsAccessPlane",
    "request_id" TEXT,
    "before_hash" TEXT,
    "after_hash" TEXT,
    "payload_json" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_ai_suggestion_audit" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "suggestion_id" TEXT NOT NULL,
    "behavior_id" TEXT NOT NULL,
    "actor_user_id" INTEGER,
    "decision" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "reason" TEXT,
    "payload_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_ai_suggestion_audit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_cail_inference_logs" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "behavior_id" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "model_tier" "SmsAiModelTier" NOT NULL,
    "model_version" TEXT,
    "score" NUMERIC(5, 2),
    "factors_json" JSONB,
    "input_hash" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_cail_inference_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sms_metrics_outbox" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "event_type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_metrics_outbox_pkey" PRIMARY KEY ("id")
);

-- Indexes (Prisma @@index / @@unique / @unique)
CREATE UNIQUE INDEX "sms_geo_nodes_company_id_geo_code_key" ON "sms_geo_nodes" ("company_id", "geo_code");

CREATE INDEX "sms_geo_nodes_company_id_parent_geo_node_id_idx" ON "sms_geo_nodes" ("company_id", "parent_geo_node_id");

CREATE INDEX "sms_geo_nodes_company_id_geo_level_geo_code_idx" ON "sms_geo_nodes" ("company_id", "geo_level", "geo_code");

CREATE UNIQUE INDEX "sms_geo_node_entitlements_company_id_geo_node_id_key" ON "sms_geo_node_entitlements" ("company_id", "geo_node_id");

CREATE INDEX "sms_geo_node_entitlements_company_id_available_idx" ON "sms_geo_node_entitlements" ("company_id", "available");

CREATE INDEX "sms_project_geo_map_company_id_site_geo_node_id_idx" ON "sms_project_geo_map" ("company_id", "site_geo_node_id");

CREATE UNIQUE INDEX "sms_industry_benchmark_cohorts_industry_code_region_scope_p_key" ON "sms_industry_benchmark_cohorts" ("industry_code", "region_scope", "period_grain", "period_start", "metric_key");

CREATE INDEX "sms_industry_benchmark_cohorts_industry_code_region_scope_p_idx" ON "sms_industry_benchmark_cohorts" ("industry_code", "region_scope", "period_end");

CREATE UNIQUE INDEX "sms_company_metrics_company_id_period_grain_period_start_key" ON "sms_company_metrics" ("company_id", "period_grain", "period_start");

CREATE INDEX "sms_company_metrics_company_id_period_end_idx" ON "sms_company_metrics" ("company_id", "period_end" DESC);

CREATE INDEX "sms_company_metrics_company_id_industry_code_period_end_idx" ON "sms_company_metrics" ("company_id", "industry_code", "period_end" DESC);

CREATE INDEX "sms_company_metrics_company_id_incident_rate_per_200k_idx" ON "sms_company_metrics" ("company_id", "incident_rate_per_200k");

CREATE UNIQUE INDEX "sms_project_metrics_company_id_project_id_period_grain_peri_key" ON "sms_project_metrics" ("company_id", "project_id", "period_grain", "period_start");

CREATE INDEX "sms_project_metrics_company_id_project_id_period_end_idx" ON "sms_project_metrics" ("company_id", "project_id", "period_end" DESC);

CREATE INDEX "sms_project_metrics_site_geo_node_id_period_end_idx" ON "sms_project_metrics" ("site_geo_node_id", "period_end" DESC);

CREATE UNIQUE INDEX "sms_regional_metrics_company_id_geo_node_id_period_grain_pe_key" ON "sms_regional_metrics" ("company_id", "geo_node_id", "period_grain", "period_start");

CREATE INDEX "sms_regional_metrics_company_id_parent_geo_node_id_period_e_idx" ON "sms_regional_metrics" ("company_id", "parent_geo_node_id", "period_end" DESC);

CREATE INDEX "sms_regional_metrics_company_id_geo_code_idx" ON "sms_regional_metrics" ("company_id", "geo_code");

CREATE INDEX "sms_regional_metrics_company_id_geo_level_hotspot_score_idx" ON "sms_regional_metrics" ("company_id", "geo_level", "hotspot_score" DESC);

CREATE INDEX "sms_regional_metrics_company_id_available_idx" ON "sms_regional_metrics" ("company_id", "available");

CREATE INDEX "sms_competency_metrics_company_id_period_grain_period_start_idx" ON "sms_competency_metrics" ("company_id", "period_grain", "period_start");

CREATE INDEX "sms_competency_metrics_company_id_project_id_role_key_compe_idx" ON "sms_competency_metrics" ("company_id", "project_id", "role_key", "competency_key");

CREATE INDEX "sms_competency_metrics_company_id_risk_index_idx" ON "sms_competency_metrics" ("company_id", "risk_index" DESC);

CREATE INDEX "sms_inspection_metrics_company_id_project_id_period_grain_p_idx" ON "sms_inspection_metrics" ("company_id", "project_id", "period_grain", "period_start");

CREATE INDEX "sms_inspection_metrics_company_id_project_id_period_end_idx" ON "sms_inspection_metrics" ("company_id", "project_id", "period_end" DESC);

CREATE INDEX "sms_inspection_metrics_company_id_project_id_bbo_quality_av_idx" ON "sms_inspection_metrics" ("company_id", "project_id", "bbo_quality_avg");

CREATE INDEX "sms_inspection_metrics_company_id_findings_open_idx" ON "sms_inspection_metrics" ("company_id", "findings_open");

CREATE INDEX "sms_incident_metrics_company_id_project_id_period_grain_per_idx" ON "sms_incident_metrics" ("company_id", "project_id", "period_grain", "period_start");

CREATE INDEX "sms_incident_metrics_company_id_project_id_period_end_idx" ON "sms_incident_metrics" ("company_id", "project_id", "period_end" DESC);

CREATE INDEX "sms_incident_metrics_company_id_overdue_investigations_gt_1_idx" ON "sms_incident_metrics" ("company_id", "overdue_investigations_gt_14d");

CREATE UNIQUE INDEX "sms_flha_records_sor_jha_flha_id_key" ON "sms_flha_records" ("sor_jha_flha_id");

CREATE INDEX "sms_flha_records_company_id_project_id_status_effective_on_idx" ON "sms_flha_records" ("company_id", "project_id", "status", "effective_on" DESC);

CREATE INDEX "sms_flha_records_company_id_quality_score_idx" ON "sms_flha_records" ("company_id", "quality_score");

CREATE INDEX "sms_flha_records_jha_record_id_idx" ON "sms_flha_records" ("jha_record_id");

CREATE UNIQUE INDEX "sms_jha_records_sor_jha_flha_id_version_key" ON "sms_jha_records" ("sor_jha_flha_id", "version");

CREATE INDEX "sms_jha_records_company_id_project_id_status_idx" ON "sms_jha_records" ("company_id", "project_id", "status");

CREATE INDEX "sms_jha_records_company_id_sif_potential_idx" ON "sms_jha_records" ("company_id", "sif_potential");

CREATE INDEX "sms_jha_records_erp_record_id_idx" ON "sms_jha_records" ("erp_record_id");

CREATE UNIQUE INDEX "sms_erp_records_sor_emergency_plan_id_key" ON "sms_erp_records" ("sor_emergency_plan_id");

CREATE INDEX "sms_erp_records_company_id_project_id_scenario_status_idx" ON "sms_erp_records" ("company_id", "project_id", "scenario", "status");

CREATE INDEX "sms_erp_records_company_id_last_drill_at_idx" ON "sms_erp_records" ("company_id", "last_drill_at");

CREATE INDEX "sms_erp_records_geo_node_id_idx" ON "sms_erp_records" ("geo_node_id");

CREATE INDEX "sms_erp_drill_sessions_erp_record_id_started_at_idx" ON "sms_erp_drill_sessions" ("erp_record_id", "started_at" DESC);

CREATE UNIQUE INDEX "sms_erp_drill_roster_session_id_person_key_key" ON "sms_erp_drill_roster" ("session_id", "person_key");

CREATE UNIQUE INDEX "sms_corrective_actions_sor_action_id_key" ON "sms_corrective_actions" ("sor_action_id");

CREATE INDEX "sms_corrective_actions_company_id_project_id_status_due_at_idx" ON "sms_corrective_actions" ("company_id", "project_id", "status", "due_at");

CREATE INDEX "sms_corrective_actions_company_id_kind_root_cause_key_idx" ON "sms_corrective_actions" ("company_id", "kind", "root_cause_key");

CREATE INDEX "sms_corrective_actions_company_id_sla_breached_idx" ON "sms_corrective_actions" ("company_id", "sla_breached");

CREATE INDEX "sms_corrective_actions_source_module_source_record_id_idx" ON "sms_corrective_actions" ("source_module", "source_record_id");

CREATE UNIQUE INDEX "sms_safety_meetings_sor_meeting_id_key" ON "sms_safety_meetings" ("sor_meeting_id");

CREATE INDEX "sms_safety_meetings_company_id_project_id_scheduled_at_idx" ON "sms_safety_meetings" ("company_id", "project_id", "scheduled_at" DESC);

CREATE INDEX "sms_safety_meetings_company_id_attendance_pct_idx" ON "sms_safety_meetings" ("company_id", "attendance_pct");

CREATE INDEX "sms_ai_insights_cache_company_id_behavior_id_expires_at_idx" ON "sms_ai_insights_cache" ("company_id", "behavior_id", "expires_at");

CREATE INDEX "sms_ai_insights_cache_company_id_project_id_behavior_id_idx" ON "sms_ai_insights_cache" ("company_id", "project_id", "behavior_id");

CREATE INDEX "sms_ai_insights_cache_expires_at_idx" ON "sms_ai_insights_cache" ("expires_at");

CREATE INDEX "sms_ai_insights_cache_company_id_input_hash_behavior_id_pag_idx" ON "sms_ai_insights_cache" ("company_id", "input_hash", "behavior_id", "page_context");

CREATE INDEX "sms_ai_insights_cache_geo_node_id_idx" ON "sms_ai_insights_cache" ("geo_node_id");

CREATE UNIQUE INDEX "sms_record_links_company_id_from_type_from_id_to_type_to_id_key" ON "sms_record_links" ("company_id", "from_type", "from_id", "to_type", "to_id", "link_role");

CREATE INDEX "sms_record_links_company_id_to_type_to_id_idx" ON "sms_record_links" ("company_id", "to_type", "to_id");

CREATE INDEX "sms_audit_log_company_id_created_at_idx" ON "sms_audit_log" ("company_id", "created_at" DESC);

CREATE INDEX "sms_audit_log_entity_type_entity_id_idx" ON "sms_audit_log" ("entity_type", "entity_id");

CREATE INDEX "sms_audit_log_actor_user_id_created_at_idx" ON "sms_audit_log" ("actor_user_id", "created_at" DESC);

CREATE INDEX "sms_ai_suggestion_audit_company_id_suggestion_id_idx" ON "sms_ai_suggestion_audit" ("company_id", "suggestion_id");

CREATE INDEX "sms_ai_suggestion_audit_company_id_created_at_idx" ON "sms_ai_suggestion_audit" ("company_id", "created_at" DESC);

CREATE INDEX "sms_cail_inference_logs_company_id_behavior_id_created_at_idx" ON "sms_cail_inference_logs" ("company_id", "behavior_id", "created_at" DESC);

CREATE INDEX "sms_metrics_outbox_processed_at_created_at_idx" ON "sms_metrics_outbox" ("processed_at", "created_at");

CREATE INDEX "sms_metrics_outbox_company_id_event_type_idx" ON "sms_metrics_outbox" ("company_id", "event_type");

-- Partial / expression indexes (Final Data Model §7 Hot queues)
CREATE INDEX "sms_project_metrics_hot_open_incidents_idx" ON "sms_project_metrics" ("project_id", "open_incident_count") WHERE "open_incident_count" > 0;

CREATE INDEX "sms_regional_metrics_hot_available_idx" ON "sms_regional_metrics" ("company_id", "available") WHERE "available" = true;

CREATE INDEX "sms_competency_metrics_hot_overdue_idx" ON "sms_competency_metrics" ("company_id", "overdue_count") WHERE "overdue_count" > 0;

CREATE INDEX "sms_inspection_metrics_hot_findings_open_idx" ON "sms_inspection_metrics" ("company_id", "findings_open") WHERE "findings_open" > 0;

CREATE INDEX "sms_incident_metrics_hot_overdue_inv_gt_14d_idx" ON "sms_incident_metrics" ("company_id", "overdue_investigations_gt_14d") WHERE "overdue_investigations_gt_14d" > 0;

CREATE INDEX "sms_jha_records_hot_sif_potential_idx" ON "sms_jha_records" ("company_id", "sif_potential") WHERE "sif_potential" = true;

CREATE INDEX "sms_corrective_actions_hot_sla_breached_idx" ON "sms_corrective_actions" ("company_id", "sla_breached") WHERE "sla_breached" = true;

CREATE UNIQUE INDEX "sms_competency_metrics_grain_unique_idx" ON "sms_competency_metrics" ("company_id", COALESCE("project_id", 0), "role_key", "competency_key", "period_grain", "period_start");

CREATE UNIQUE INDEX "sms_inspection_metrics_grain_unique_idx" ON "sms_inspection_metrics" ("company_id", COALESCE("project_id", 0), "period_grain", "period_start");

CREATE UNIQUE INDEX "sms_incident_metrics_grain_unique_idx" ON "sms_incident_metrics" ("company_id", COALESCE("project_id", 0), "period_grain", "period_start");

CREATE UNIQUE INDEX "sms_ai_insights_cache_active_hit" ON "sms_ai_insights_cache" ("company_id", "behavior_id", "input_hash", COALESCE("page_context", '')) WHERE "status" = 'active';

CREATE INDEX "sms_ai_insights_cache_geo_node_id_partial_idx" ON "sms_ai_insights_cache" ("geo_node_id") WHERE "geo_node_id" IS NOT NULL;

-- Foreign keys
ALTER TABLE "sms_geo_nodes" ADD CONSTRAINT "sms_geo_nodes_parent_geo_node_id_fkey" FOREIGN KEY ("parent_geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sms_geo_node_entitlements" ADD CONSTRAINT "sms_geo_node_entitlements_geo_node_id_fkey" FOREIGN KEY ("geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_site_geo_node_id_fkey" FOREIGN KEY ("site_geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_country_geo_node_id_fkey" FOREIGN KEY ("country_geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_province_geo_node_id_fkey" FOREIGN KEY ("province_geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sms_project_metrics" ADD CONSTRAINT "sms_project_metrics_site_geo_node_id_fkey" FOREIGN KEY ("site_geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sms_regional_metrics" ADD CONSTRAINT "sms_regional_metrics_geo_node_id_fkey" FOREIGN KEY ("geo_node_id") REFERENCES "sms_geo_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sms_flha_records" ADD CONSTRAINT "sms_flha_records_jha_record_id_fkey" FOREIGN KEY ("jha_record_id") REFERENCES "sms_jha_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sms_jha_records" ADD CONSTRAINT "sms_jha_records_erp_record_id_fkey" FOREIGN KEY ("erp_record_id") REFERENCES "sms_erp_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sms_erp_drill_sessions" ADD CONSTRAINT "sms_erp_drill_sessions_erp_record_id_fkey" FOREIGN KEY ("erp_record_id") REFERENCES "sms_erp_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sms_erp_drill_roster" ADD CONSTRAINT "sms_erp_drill_roster_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sms_erp_drill_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
