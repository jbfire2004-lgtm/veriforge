-- AlterEnum (PostgreSQL: one ADD VALUE per statement)
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'JHA';
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'FLHA';
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'SIF';
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'HECA';
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'ENERGY_WHEEL';
ALTER TYPE "PmSafetyWorkflowKind" ADD VALUE 'INSPECTION';

-- AlterTable
ALTER TABLE "PmSafetyWorkflow" ADD COLUMN "jobLocation" VARCHAR(500),
ADD COLUMN "taskStepsJson" JSONB,
ADD COLUMN "workerUserId" INTEGER,
ADD COLUMN "workerSignedAt" TIMESTAMP(3),
ADD COLUMN "workerSignatureText" TEXT,
ADD COLUMN "supervisorUserId" INTEGER,
ADD COLUMN "supervisorApprovedAt" TIMESTAMP(3),
ADD COLUMN "supervisorSignatureText" TEXT;

ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_workerUserId_fkey" FOREIGN KEY ("workerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
