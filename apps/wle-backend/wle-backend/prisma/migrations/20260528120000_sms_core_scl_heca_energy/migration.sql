-- SMS Core: SCL / HECA / Energy Wheel unified layer

CREATE TYPE "PmSclState" AS ENUM ('safe', 'conditional', 'loss');
CREATE TYPE "PmEnergyControlState" AS ENUM ('controlled', 'uncontrolled', 'partially_controlled');
CREATE TYPE "PmSmsEntityType" AS ENUM (
  'inspection_finding',
  'inspection_deficiency',
  'corrective_action',
  'safety_event',
  'investigation',
  'substance_test',
  'equipment_inspection',
  'jha_task'
);
CREATE TYPE "PmSmsHecaType" AS ENUM ('critical_task', 'critical_equipment', 'both');

ALTER TABLE "pm_safety_event"
  ADD COLUMN IF NOT EXISTS "scl_state" "PmSclState",
  ADD COLUMN IF NOT EXISTS "scl_triggers_json" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "scl_precursors_json" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "scl_potential_severity" "PmSafetyEventSeverity",
  ADD COLUMN IF NOT EXISTS "energy_profile_json" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "mandatory_investigation" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "pm_inspection_photo_finding"
  ADD COLUMN IF NOT EXISTS "scl_state" "PmSclState",
  ADD COLUMN IF NOT EXISTS "heca_involved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "heca_type" TEXT,
  ADD COLUMN IF NOT EXISTS "heca_category_code" TEXT,
  ADD COLUMN IF NOT EXISTS "energy_types_json" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "energy_control_state" "PmEnergyControlState",
  ADD COLUMN IF NOT EXISTS "high_energy_flag" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "requires_investigation" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "escalated_severity" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "pm_inspection_photo_finding_scl_heca_idx"
  ON "pm_inspection_photo_finding" ("scl_state", "heca_involved");

CREATE TABLE "pm_sms_risk_context" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "entity_type" "PmSmsEntityType" NOT NULL,
  "entity_id" TEXT NOT NULL,
  "scl_state" "PmSclState",
  "scl_triggers_json" JSONB NOT NULL DEFAULT '[]',
  "scl_precursors_json" JSONB NOT NULL DEFAULT '[]',
  "scl_potential_severity" TEXT,
  "heca_involved" BOOLEAN NOT NULL DEFAULT false,
  "heca_type" "PmSmsHecaType",
  "heca_category_code" TEXT,
  "heca_library_entry_id" TEXT,
  "energy_types_json" JSONB NOT NULL DEFAULT '[]',
  "energy_control_state" "PmEnergyControlState",
  "high_energy_flag" BOOLEAN NOT NULL DEFAULT false,
  "missing_controls_json" JSONB NOT NULL DEFAULT '[]',
  "escalation_score" INTEGER NOT NULL DEFAULT 0,
  "requires_investigation" BOOLEAN NOT NULL DEFAULT false,
  "metadata_json" JSONB NOT NULL DEFAULT '{}',
  "client_sync_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_sms_risk_context_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_sms_risk_context_entity_type_entity_id_key"
  ON "pm_sms_risk_context" ("entity_type", "entity_id");
CREATE UNIQUE INDEX "pm_sms_risk_context_client_sync_id_key"
  ON "pm_sms_risk_context" ("client_sync_id");
CREATE INDEX "pm_sms_risk_context_company_id_scl_state_idx"
  ON "pm_sms_risk_context" ("company_id", "scl_state");
CREATE INDEX "pm_sms_risk_context_company_id_heca_involved_high_energy_flag_idx"
  ON "pm_sms_risk_context" ("company_id", "heca_involved", "high_energy_flag");
CREATE INDEX "pm_sms_risk_context_project_id_entity_type_idx"
  ON "pm_sms_risk_context" ("project_id", "entity_type");

ALTER TABLE "pm_sms_risk_context"
  ADD CONSTRAINT "pm_sms_risk_context_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_sms_risk_context"
  ADD CONSTRAINT "pm_sms_risk_context_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_sms_heca_library" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "heca_type" "PmSmsHecaType" NOT NULL,
  "required_controls_json" JSONB NOT NULL DEFAULT '[]',
  "verification_steps_json" JSONB NOT NULL DEFAULT '[]',
  "training_codes_json" JSONB NOT NULL DEFAULT '[]',
  "energy_types_json" JSONB NOT NULL DEFAULT '[]',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_sms_heca_library_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_sms_heca_library_company_id_code_key"
  ON "pm_sms_heca_library" ("company_id", "code");
CREATE INDEX "pm_sms_heca_library_company_id_active_idx"
  ON "pm_sms_heca_library" ("company_id", "active");

ALTER TABLE "pm_sms_heca_library"
  ADD CONSTRAINT "pm_sms_heca_library_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_sms_heca_library"
  ADD CONSTRAINT "pm_sms_heca_library_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_sms_risk_context"
  ADD CONSTRAINT "pm_sms_risk_context_heca_library_entry_id_fkey"
  FOREIGN KEY ("heca_library_entry_id") REFERENCES "pm_sms_heca_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_sms_weekly_risk_forecast" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "week_start" TIMESTAMP(3) NOT NULL,
  "forecast_json" JSONB NOT NULL,
  "alerts_json" JSONB NOT NULL DEFAULT '[]',
  "recommendations_json" JSONB NOT NULL DEFAULT '[]',
  "scl_breakdown_json" JSONB NOT NULL DEFAULT '{}',
  "heca_hotspots_json" JSONB NOT NULL DEFAULT '[]',
  "energy_gaps_json" JSONB NOT NULL DEFAULT '[]',
  "model_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_sms_weekly_risk_forecast_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_sms_weekly_risk_forecast_company_id_project_id_week_start_key"
  ON "pm_sms_weekly_risk_forecast" ("company_id", "project_id", "week_start");
CREATE INDEX "pm_sms_weekly_risk_forecast_company_id_week_start_idx"
  ON "pm_sms_weekly_risk_forecast" ("company_id", "week_start");

ALTER TABLE "pm_sms_weekly_risk_forecast"
  ADD CONSTRAINT "pm_sms_weekly_risk_forecast_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_sms_weekly_risk_forecast"
  ADD CONSTRAINT "pm_sms_weekly_risk_forecast_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pm_sms_notification_route" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "event_key" TEXT NOT NULL,
  "channels_json" JSONB NOT NULL DEFAULT '["in_app","email"]',
  "roles_json" JSONB NOT NULL DEFAULT '[]',
  "template_key" TEXT NOT NULL,
  "escalate_on_heca_high_energy" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_sms_notification_route_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_sms_notification_route_company_id_event_key_key"
  ON "pm_sms_notification_route" ("company_id", "event_key");

ALTER TABLE "pm_sms_notification_route"
  ADD CONSTRAINT "pm_sms_notification_route_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
