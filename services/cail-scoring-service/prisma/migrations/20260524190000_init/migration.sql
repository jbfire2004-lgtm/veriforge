-- CreateEnum
CREATE TYPE "ScoreType" AS ENUM (
  'worker_safety',
  'equipment_safety',
  'project_safety',
  'company_safety',
  'hazard_severity',
  'control_strength',
  'jha_quality',
  'inspection_quality',
  'corrective_action_priority',
  'emergency_readiness',
  'access_compliance'
);

-- CreateTable
CREATE TABLE "cail_scores" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "worker_id" UUID,
    "equipment_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "score_type" "ScoreType" NOT NULL,
    "score_value" DOUBLE PRECISION NOT NULL,
    "contributing_factors" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_scores_company_id_idx" ON "cail_scores"("company_id");
CREATE INDEX "cail_scores_company_id_score_type_idx" ON "cail_scores"("company_id", "score_type");
CREATE INDEX "cail_scores_entity_type_entity_id_idx" ON "cail_scores"("entity_type", "entity_id");
CREATE INDEX "cail_scores_company_id_entity_type_entity_id_idx" ON "cail_scores"("company_id", "entity_type", "entity_id");
CREATE INDEX "cail_scores_project_id_idx" ON "cail_scores"("project_id");
CREATE INDEX "cail_scores_worker_id_idx" ON "cail_scores"("worker_id");
CREATE INDEX "cail_scores_equipment_id_idx" ON "cail_scores"("equipment_id");
CREATE INDEX "cail_scores_created_at_idx" ON "cail_scores"("created_at");
