-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "module_type" TEXT NOT NULL,
    "module_record_id" UUID NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "thumbnail_path" TEXT,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_company_id_uploaded_at_idx" ON "attachments"("company_id", "uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "attachments_company_id_module_type_module_record_id_idx" ON "attachments"("company_id", "module_type", "module_record_id");

-- CreateIndex
CREATE INDEX "attachments_project_id_idx" ON "attachments"("project_id");
