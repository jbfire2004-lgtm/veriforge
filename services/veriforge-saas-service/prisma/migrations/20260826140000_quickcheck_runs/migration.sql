-- QuickCheck run logs

CREATE TYPE "QuickCheckRiskLevel" AS ENUM ('green', 'yellow', 'red');

CREATE TABLE "quickcheck_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "risk_level" "QuickCheckRiskLevel" NOT NULL,
    "breakdown" JSONB NOT NULL,
    "missing_items" JSONB NOT NULL DEFAULT '[]',
    "triggered_by_id" UUID,
    "source" TEXT NOT NULL DEFAULT 'api',
    "hiring_client_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quickcheck_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "quickcheck_runs_contractor_id_created_at_idx"
  ON "quickcheck_runs"("contractor_id", "created_at");
CREATE INDEX "quickcheck_runs_risk_level_created_at_idx"
  ON "quickcheck_runs"("risk_level", "created_at");
CREATE INDEX "quickcheck_runs_source_created_at_idx"
  ON "quickcheck_runs"("source", "created_at");

ALTER TABLE "quickcheck_runs"
  ADD CONSTRAINT "quickcheck_runs_contractor_id_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
