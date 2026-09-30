-- Program Verification System (PVS)

CREATE TYPE "PvsProgramCategory" AS ENUM (
  'hazard_assessment', 'emergency_response', 'incident_investigation', 'ppe',
  'working_at_heights', 'confined_space', 'lockout_tagout', 'substance_abuse',
  'orientation_training', 'environmental', 'other'
);
CREATE TYPE "PvsVerificationStatus" AS ENUM (
  'draft', 'submitted', 'in_review', 'verified', 'rejected', 'exempt', 'missing'
);
CREATE TYPE "PvsExemptionApprovalStatus" AS ENUM (
  'none', 'pending', 'approved', 'rejected'
);
CREATE TYPE "PvsElementStatus" AS ENUM (
  'pending', 'verified', 'missing', 'exempt', 'na'
);

CREATE TABLE "program_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "program_category" "PvsProgramCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "program_body" TEXT,
    "file_url" TEXT,
    "verification_status" "PvsVerificationStatus" NOT NULL DEFAULT 'draft',
    "exemption_flag" BOOLEAN NOT NULL DEFAULT false,
    "exemption_reason" TEXT,
    "exemption_approval_status" "PvsExemptionApprovalStatus" NOT NULL DEFAULT 'none',
    "exemption_reviewed_at" TIMESTAMP(3),
    "exemption_reviewed_by" UUID,
    "reviewer_id" UUID,
    "reviewer_name" TEXT,
    "verified_at" TIMESTAMP(3),
    "verification_notes" TEXT,
    "safety_matrix" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "program_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "program_verifications_contractor_id_program_category_key"
  ON "program_verifications"("contractor_id", "program_category");
CREATE INDEX "program_verifications_contractor_id_verification_status_idx"
  ON "program_verifications"("contractor_id", "verification_status");
CREATE INDEX "program_verifications_reviewer_id_verification_status_idx"
  ON "program_verifications"("reviewer_id", "verification_status");
CREATE INDEX "program_verifications_exemption_flag_exemption_approval_status_idx"
  ON "program_verifications"("exemption_flag", "exemption_approval_status");

ALTER TABLE "program_verifications"
  ADD CONSTRAINT "program_verifications_contractor_id_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pvs_matrix_elements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pvs_id" UUID NOT NULL,
    "element_key" TEXT NOT NULL,
    "element_label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "status" "PvsElementStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pvs_matrix_elements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pvs_matrix_elements_pvs_id_element_key_key"
  ON "pvs_matrix_elements"("pvs_id", "element_key");
CREATE INDEX "pvs_matrix_elements_pvs_id_status_idx"
  ON "pvs_matrix_elements"("pvs_id", "status");

ALTER TABLE "pvs_matrix_elements"
  ADD CONSTRAINT "pvs_matrix_elements_pvs_id_fkey"
  FOREIGN KEY ("pvs_id") REFERENCES "program_verifications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
