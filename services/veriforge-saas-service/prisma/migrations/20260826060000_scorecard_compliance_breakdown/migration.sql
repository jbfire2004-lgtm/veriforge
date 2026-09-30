-- Rename scorecard breakdown column to compliance_breakdown (explicit compliance weighting payload).

ALTER TABLE "org_compliance_scorecards"
  RENAME COLUMN "breakdown" TO "compliance_breakdown";
