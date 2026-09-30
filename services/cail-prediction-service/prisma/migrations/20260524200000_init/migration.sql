-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM (
  'incident_likelihood',
  'equipment_failure',
  'hazard_emergence',
  'sif_heca_potential',
  'training_lapse',
  'capa_overdue',
  'access_denial',
  'emergency_likelihood'
);

-- CreateTable
CREATE TABLE "cail_predictions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "worker_id" UUID,
    "equipment_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "module_type" TEXT NOT NULL,
    "prediction_type" "PredictionType" NOT NULL,
    "prediction_value" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "factors" JSONB NOT NULL DEFAULT '[]',
    "model_key" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_predictions_company_id_idx" ON "cail_predictions"("company_id");
CREATE INDEX "cail_predictions_company_id_prediction_type_idx" ON "cail_predictions"("company_id", "prediction_type");
CREATE INDEX "cail_predictions_entity_type_entity_id_idx" ON "cail_predictions"("entity_type", "entity_id");
CREATE INDEX "cail_predictions_company_id_entity_type_entity_id_idx" ON "cail_predictions"("company_id", "entity_type", "entity_id");
CREATE INDEX "cail_predictions_module_type_idx" ON "cail_predictions"("module_type");
CREATE INDEX "cail_predictions_created_at_idx" ON "cail_predictions"("created_at");
