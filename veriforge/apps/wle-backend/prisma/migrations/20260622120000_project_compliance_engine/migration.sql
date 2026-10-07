-- CreateEnum
CREATE TYPE "ProjectComplianceRuleType" AS ENUM ('ALL_WORKERS', 'ROLE', 'TRADE');

-- CreateEnum
CREATE TYPE "ProjectComplianceAlertType" AS ENUM ('MISSING', 'EXPIRED', 'EXPIRING_SOON');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "client" TEXT;

-- AlterTable
ALTER TABLE "ProjectAssignment" ADD COLUMN "role" TEXT;

-- CreateTable
CREATE TABLE "project_compliance_rules" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "ruleType" "ProjectComplianceRuleType" NOT NULL,
    "requiredCredentialTypeId" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_compliance_alerts" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "ruleId" INTEGER,
    "credentialId" INTEGER,
    "type" "ProjectComplianceAlertType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "project_compliance_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_project_compliance_rule_project_active" ON "project_compliance_rules"("projectId", "active");

-- CreateIndex
CREATE INDEX "idx_project_compliance_alert_project_resolved" ON "project_compliance_alerts"("projectId", "resolvedAt");

-- CreateIndex
CREATE INDEX "idx_project_compliance_alert_worker_resolved" ON "project_compliance_alerts"("workerId", "resolvedAt");

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_requiredCredentialTypeId_fkey" FOREIGN KEY ("requiredCredentialTypeId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "project_compliance_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
