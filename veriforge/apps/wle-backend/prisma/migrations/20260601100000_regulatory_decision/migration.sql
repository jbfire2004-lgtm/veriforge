-- Regulatory decision layer (additive; reuses TrainingStandard / JurisdictionRequirement)
CREATE TYPE "RegulatoryComplianceStatus" AS ENUM (
  'COMPLIANT',
  'PARTIALLY_COMPLIANT',
  'NON_COMPLIANT',
  'UNKNOWN'
);

CREATE TABLE "regulatory_equivalencies" (
    "id" SERIAL NOT NULL,
    "from_jurisdiction" TEXT NOT NULL,
    "to_jurisdiction" TEXT NOT NULL,
    "standard_code" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "regulatory_equivalencies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "regulatory_equivalency_unique"
  ON "regulatory_equivalencies"("from_jurisdiction", "to_jurisdiction", "standard_code");
CREATE INDEX "regulatory_equivalency_from_std_idx"
  ON "regulatory_equivalencies"("from_jurisdiction", "standard_code");
CREATE INDEX "regulatory_equivalency_to_std_idx"
  ON "regulatory_equivalencies"("to_jurisdiction", "standard_code");

CREATE TABLE "regulatory_verification_decisions" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "regulatory_compliance_status" "RegulatoryComplianceStatus" NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "jurisdiction_code" TEXT NOT NULL,
    "matched_standards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jurisdiction_coverage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validation_result_id" INTEGER,
    "recommended_action" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "regulatory_verification_decisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "regulatory_decision_record_created_idx"
  ON "regulatory_verification_decisions"("training_record_id", "created_at");
CREATE INDEX "regulatory_decision_status_idx"
  ON "regulatory_verification_decisions"("regulatory_compliance_status");

ALTER TABLE "regulatory_verification_decisions"
  ADD CONSTRAINT "regulatory_verification_decisions_training_record_id_fkey"
  FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "regulatory_verification_decisions"
  ADD CONSTRAINT "regulatory_verification_decisions_validation_result_id_fkey"
  FOREIGN KEY ("validation_result_id") REFERENCES "TrainingValidationResult"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
