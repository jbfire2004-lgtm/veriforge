-- Contractor Directory: profiles, documents, audits, sites, connections

CREATE TYPE "InsuranceStatus" AS ENUM ('valid', 'expiring', 'expired', 'missing', 'unknown');
CREATE TYPE "ContractorConnectionStatus" AS ENUM ('pending', 'approved', 'rejected', 'revoked');
CREATE TYPE "ContractorDocumentKind" AS ENUM ('insurance', 'wcb', 'cor', 'scsa', 'license', 'other');
CREATE TYPE "ContractorDocumentStatus" AS ENUM ('valid', 'expired', 'pending_review', 'rejected', 'missing');
CREATE TYPE "ContractorAuditResult" AS ENUM ('pass', 'conditional', 'fail', 'pending');

CREATE TABLE "contractor_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "safety_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insurance_status" "InsuranceStatus" NOT NULL DEFAULT 'unknown',
    "compliance_score" INTEGER NOT NULL DEFAULT 0,
    "contact_info" JSONB NOT NULL DEFAULT '{}',
    "industry" TEXT,
    "region" TEXT,
    "is_listed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contractor_profiles_contractor_id_key" ON "contractor_profiles"("contractor_id");
CREATE INDEX "contractor_profiles_is_listed_compliance_score_idx" ON "contractor_profiles"("is_listed", "compliance_score");
CREATE INDEX "contractor_profiles_insurance_status_idx" ON "contractor_profiles"("insurance_status");
CREATE INDEX "contractor_profiles_legal_name_idx" ON "contractor_profiles"("legal_name");

ALTER TABLE "contractor_profiles"
  ADD CONSTRAINT "contractor_profiles_contractor_id_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contractor_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "kind" "ContractorDocumentKind" NOT NULL,
    "label" TEXT,
    "file_url" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "status" "ContractorDocumentStatus" NOT NULL DEFAULT 'pending_review',
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contractor_documents_contractor_id_kind_idx" ON "contractor_documents"("contractor_id", "kind");
CREATE INDEX "contractor_documents_contractor_id_status_idx" ON "contractor_documents"("contractor_id", "status");

ALTER TABLE "contractor_documents"
  ADD CONSTRAINT "contractor_documents_profile_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contractor_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "auditor" TEXT,
    "audited_at" TIMESTAMP(3) NOT NULL,
    "result" "ContractorAuditResult" NOT NULL DEFAULT 'pending',
    "score" INTEGER,
    "findings" JSONB,
    "report_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contractor_audits_contractor_id_audited_at_idx" ON "contractor_audits"("contractor_id", "audited_at");
CREATE INDEX "contractor_audits_contractor_id_result_idx" ON "contractor_audits"("contractor_id", "result");

ALTER TABLE "contractor_audits"
  ADD CONSTRAINT "contractor_audits_profile_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contractor_sites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "region" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_sites_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contractor_sites_contractor_id_is_active_idx" ON "contractor_sites"("contractor_id", "is_active");

ALTER TABLE "contractor_sites"
  ADD CONSTRAINT "contractor_sites_profile_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contractor_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hiring_client_id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "status" "ContractorConnectionStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "response_message" TEXT,
    "requested_by_user_id" UUID,
    "responded_by_user_id" UUID,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contractor_connections_hiring_client_id_contractor_id_key"
  ON "contractor_connections"("hiring_client_id", "contractor_id");
CREATE INDEX "contractor_connections_contractor_id_status_idx"
  ON "contractor_connections"("contractor_id", "status");
CREATE INDEX "contractor_connections_hiring_client_id_status_idx"
  ON "contractor_connections"("hiring_client_id", "status");

ALTER TABLE "contractor_connections"
  ADD CONSTRAINT "contractor_connections_hiring_client_id_fkey"
  FOREIGN KEY ("hiring_client_id") REFERENCES "hiring_clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contractor_connections"
  ADD CONSTRAINT "contractor_connections_profile_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
