-- Document Center: versioned docs + exemptions

CREATE TYPE "DocumentCategory" AS ENUM ('insurance', 'safety_program', 'license', 'training');
CREATE TYPE "DocumentCenterStatus" AS ENUM (
  'valid', 'expiring', 'expired', 'pending_review', 'rejected', 'exempt', 'missing'
);

CREATE TABLE "document_center_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "status" "DocumentCenterStatus" NOT NULL DEFAULT 'pending_review',
    "exemption_flag" BOOLEAN NOT NULL DEFAULT false,
    "exemption_reason" TEXT,
    "exemption_expires_at" TIMESTAMP(3),
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "file_url" TEXT,
    "storage_key" TEXT,
    "storage_provider" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_center_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "document_center_documents_contractor_id_category_idx"
  ON "document_center_documents"("contractor_id", "category");
CREATE INDEX "document_center_documents_contractor_id_status_idx"
  ON "document_center_documents"("contractor_id", "status");
CREATE INDEX "document_center_documents_expiry_date_idx"
  ON "document_center_documents"("expiry_date");
CREATE INDEX "document_center_documents_exemption_flag_idx"
  ON "document_center_documents"("exemption_flag");

ALTER TABLE "document_center_documents"
  ADD CONSTRAINT "document_center_documents_contractor_id_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "document_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "storage_key" TEXT,
    "file_name" TEXT,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "uploaded_by_id" UUID,
    "change_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_versions_document_id_version_key"
  ON "document_versions"("document_id", "version");
CREATE INDEX "document_versions_document_id_created_at_idx"
  ON "document_versions"("document_id", "created_at");

ALTER TABLE "document_versions"
  ADD CONSTRAINT "document_versions_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "document_center_documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
