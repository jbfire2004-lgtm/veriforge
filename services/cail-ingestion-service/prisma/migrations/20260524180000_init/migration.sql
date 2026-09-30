-- CreateTable
CREATE TABLE "cail_training_data" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "model_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "dataset_reference" TEXT NOT NULL,
    "feature_set" JSONB NOT NULL,
    "label_set" JSONB,
    "source_event" TEXT,
    "anomaly_flag" BOOLEAN NOT NULL DEFAULT false,
    "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_training_data_company_id_idx" ON "cail_training_data"("company_id");
CREATE INDEX "cail_training_data_company_id_model_id_version_idx" ON "cail_training_data"("company_id", "model_id", "version");
CREATE INDEX "cail_training_data_dataset_reference_idx" ON "cail_training_data"("dataset_reference");
CREATE INDEX "cail_training_data_company_id_created_at_idx" ON "cail_training_data"("company_id", "created_at");
CREATE INDEX "cail_training_data_anomaly_flag_idx" ON "cail_training_data"("anomaly_flag");
