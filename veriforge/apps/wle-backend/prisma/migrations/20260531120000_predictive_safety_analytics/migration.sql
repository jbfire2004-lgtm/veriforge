CREATE TABLE "pm_predictive_safety_forecast" (
  "id" TEXT NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "week_start" TIMESTAMP(3) NOT NULL,
  "risk_index" DOUBLE PRECISION NOT NULL,
  "risk_level" TEXT NOT NULL,
  "forecast_json" JSONB NOT NULL DEFAULT '{}',
  "alerts_json" JSONB NOT NULL DEFAULT '[]',
  "model_key" TEXT NOT NULL DEFAULT 'predictive_safety_v1',
  "model_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_predictive_safety_forecast_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_predictive_safety_forecast_company_id_project_id_week_start_key"
  ON "pm_predictive_safety_forecast"("company_id", "project_id", "week_start");

CREATE INDEX "pm_predictive_safety_forecast_company_id_week_start_idx"
  ON "pm_predictive_safety_forecast"("company_id", "week_start");

ALTER TABLE "pm_predictive_safety_forecast"
  ADD CONSTRAINT "pm_predictive_safety_forecast_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_predictive_safety_forecast"
  ADD CONSTRAINT "pm_predictive_safety_forecast_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
