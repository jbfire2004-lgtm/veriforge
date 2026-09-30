-- CreateTable
CREATE TABLE "cail_explainability" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "prediction_id" UUID,
    "explanation_text" TEXT NOT NULL,
    "contributing_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_explainability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_explainability_company_id_idx" ON "cail_explainability"("company_id");
CREATE INDEX "cail_explainability_prediction_id_idx" ON "cail_explainability"("prediction_id");
CREATE INDEX "cail_explainability_company_id_prediction_id_idx" ON "cail_explainability"("company_id", "prediction_id");
CREATE INDEX "cail_explainability_created_at_idx" ON "cail_explainability"("created_at");
