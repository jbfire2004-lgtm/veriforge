-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM (
  'control',
  'training',
  'corrective_action',
  'equipment_maintenance',
  'jha_improvement',
  'inspection_focus',
  'pm_schedule_adjustment'
);

-- CreateTable
CREATE TABLE "cail_recommendations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "worker_id" UUID,
    "equipment_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "recommendation_type" "RecommendationType" NOT NULL,
    "recommendation_text" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_recommendations_company_id_idx" ON "cail_recommendations"("company_id");
CREATE INDEX "cail_recommendations_company_id_recommendation_type_idx" ON "cail_recommendations"("company_id", "recommendation_type");
CREATE INDEX "cail_recommendations_entity_type_entity_id_idx" ON "cail_recommendations"("entity_type", "entity_id");
CREATE INDEX "cail_recommendations_company_id_entity_type_entity_id_idx" ON "cail_recommendations"("company_id", "entity_type", "entity_id");
CREATE INDEX "cail_recommendations_project_id_idx" ON "cail_recommendations"("project_id");
CREATE INDEX "cail_recommendations_created_at_idx" ON "cail_recommendations"("created_at");
