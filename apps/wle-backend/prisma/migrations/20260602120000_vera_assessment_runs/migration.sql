CREATE TYPE "VeraAssessmentEngine" AS ENUM (
  'TRAINING_ASSESSMENT',
  'SAFETY_PROGRAM_COMPLIANCE',
  'SMART_GAP_ANALYSIS',
  'SAFETY_KNOWLEDGE'
);

CREATE TABLE "vera_assessment_run" (
  "id" TEXT NOT NULL,
  "engine" "VeraAssessmentEngine" NOT NULL,
  "companyId" INTEGER,
  "projectId" INTEGER,
  "workerId" INTEGER,
  "hiringClientId" INTEGER,
  "overallScore" INTEGER NOT NULL,
  "overallStatus" VARCHAR(64) NOT NULL,
  "resultJson" JSONB NOT NULL,
  "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdByUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vera_assessment_run_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vera_assessment_run_engine_companyId_evaluatedAt_idx"
  ON "vera_assessment_run"("engine", "companyId", "evaluatedAt");
CREATE INDEX "vera_assessment_run_engine_workerId_evaluatedAt_idx"
  ON "vera_assessment_run"("engine", "workerId", "evaluatedAt");
CREATE INDEX "vera_assessment_run_engine_projectId_evaluatedAt_idx"
  ON "vera_assessment_run"("engine", "projectId", "evaluatedAt");

ALTER TABLE "vera_assessment_run"
  ADD CONSTRAINT "vera_assessment_run_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vera_assessment_run"
  ADD CONSTRAINT "vera_assessment_run_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vera_assessment_run"
  ADD CONSTRAINT "vera_assessment_run_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vera_assessment_run"
  ADD CONSTRAINT "vera_assessment_run_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
