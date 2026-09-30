-- CreateTable
CREATE TABLE "sds_documents" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "cas_number" TEXT,
    "whmis_classification" TEXT,
    "ppe_requirements" JSONB NOT NULL DEFAULT '[]',
    "first_aid" JSONB NOT NULL DEFAULT '{}',
    "handling_storage" JSONB NOT NULL DEFAULT '{}',
    "extracted_hazards" JSONB NOT NULL DEFAULT '[]',
    "extracted_controls" JSONB NOT NULL DEFAULT '[]',
    "expiry_date" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sds_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_acknowledgments" (
    "id" UUID NOT NULL,
    "sds_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sds_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_sds_rules" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "required_sds_ids" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zone_sds_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sds_documents_company_id_idx" ON "sds_documents"("company_id");
CREATE INDEX "sds_documents_company_id_product_name_idx" ON "sds_documents"("company_id", "product_name");
CREATE INDEX "sds_documents_expiry_date_idx" ON "sds_documents"("expiry_date");
CREATE UNIQUE INDEX "sds_acknowledgments_sds_id_worker_id_key" ON "sds_acknowledgments"("sds_id", "worker_id");
CREATE INDEX "sds_acknowledgments_worker_id_idx" ON "sds_acknowledgments"("worker_id");
CREATE INDEX "sds_acknowledgments_sds_id_idx" ON "sds_acknowledgments"("sds_id");
CREATE UNIQUE INDEX "zone_sds_rules_company_id_zone_id_key" ON "zone_sds_rules"("company_id", "zone_id");
CREATE INDEX "zone_sds_rules_company_id_idx" ON "zone_sds_rules"("company_id");

-- AddForeignKey
ALTER TABLE "sds_acknowledgments" ADD CONSTRAINT "sds_acknowledgments_sds_id_fkey" FOREIGN KEY ("sds_id") REFERENCES "sds_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
