-- CreateEnum
CREATE TYPE "PmSafetyWorkflowKind" AS ENUM ('PERMIT_TO_WORK', 'JOB_SAFETY_ANALYSIS');

-- CreateEnum
CREATE TYPE "PmSafetyWorkflowStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PmSafetyWorkflow" (
    "id" SERIAL NOT NULL,
    "kind" "PmSafetyWorkflowKind" NOT NULL DEFAULT 'PERMIT_TO_WORK',
    "title" TEXT NOT NULL,
    "status" "PmSafetyWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" INTEGER,
    "siteId" INTEGER,
    "workDescription" TEXT,
    "hazardSummary" TEXT,
    "controlMeasures" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmSafetyWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmSafetyWorkflowEvent" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PmSafetyWorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_companyId_status_idx" ON "PmSafetyWorkflow"("companyId", "status");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_siteId_status_idx" ON "PmSafetyWorkflow"("siteId", "status");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflowEvent_workflowId_createdAt_idx" ON "PmSafetyWorkflowEvent"("workflowId", "createdAt");

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflowEvent" ADD CONSTRAINT "PmSafetyWorkflowEvent_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "PmSafetyWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
