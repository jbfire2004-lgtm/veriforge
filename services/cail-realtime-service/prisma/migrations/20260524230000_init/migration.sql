-- CreateTable
CREATE TABLE "cail_inference_logs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "model_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "engine_layer" TEXT NOT NULL,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_inference_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cail_inference_logs_company_id_idx" ON "cail_inference_logs"("company_id");
CREATE INDEX "cail_inference_logs_company_id_timestamp_idx" ON "cail_inference_logs"("company_id", "timestamp");
CREATE INDEX "cail_inference_logs_model_id_version_idx" ON "cail_inference_logs"("model_id", "version");
CREATE INDEX "cail_inference_logs_engine_layer_idx" ON "cail_inference_logs"("engine_layer");
