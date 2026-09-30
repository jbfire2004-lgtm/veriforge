-- Scorecard engine: global_score + project_scores on org_compliance_scorecards.

ALTER TABLE "org_compliance_scorecards"
  ADD COLUMN IF NOT EXISTS "global_score" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "org_compliance_scorecards"
  ADD COLUMN IF NOT EXISTS "project_scores" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill global_score from existing overall_score.
UPDATE "org_compliance_scorecards"
SET "global_score" = "overall_score"
WHERE "global_score" = 0 AND "overall_score" <> 0;

CREATE INDEX IF NOT EXISTS "org_compliance_scorecards_org_id_idx"
  ON "org_compliance_scorecards"("org_id");

CREATE INDEX IF NOT EXISTS "org_compliance_scorecards_global_score_idx"
  ON "org_compliance_scorecards"("global_score");
