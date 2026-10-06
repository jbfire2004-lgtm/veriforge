-- CreateEnum
CREATE TYPE "ObservationPolarity" AS ENUM ('safe', 'at_risk');

-- CreateEnum
CREATE TYPE "SafetyInspectionStatus" AS ENUM ('in_progress', 'completed');

-- CreateTable
CREATE TABLE "safety_inspection" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "siteId" INTEGER,
    "locationNote" VARCHAR(500),
    "status" "SafetyInspectionStatus" NOT NULL DEFAULT 'in_progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_inspection_item" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "polarity" "ObservationPolarity" NOT NULL,
    "photoStorageKey" TEXT,
    "photoDataUrl" TEXT,
    "caption" TEXT,
    "ownerCompanyId" INTEGER,
    "assignedUserId" INTEGER,
    "equipmentId" INTEGER,
    "riskCategory" "CailRiskCategory",
    "severity" "CailSeverity",
    "notes" TEXT,
    "cailEntryId" TEXT,
    "aiSuggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_inspection_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbo_observation" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "observedByUserId" INTEGER NOT NULL,
    "observerCompanyId" INTEGER,
    "polarity" "ObservationPolarity" NOT NULL,
    "behaviorDescription" TEXT NOT NULL,
    "locationNote" VARCHAR(500),
    "siteId" INTEGER,
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "ownerCompanyId" INTEGER,
    "assignedUserId" INTEGER,
    "severity" "CailSeverity",
    "riskCategory" "CailRiskCategory",
    "cailEntryId" TEXT,
    "aiAnalysis" JSONB,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bbo_observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_investigation" (
    "incidentId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "investigationStatus" TEXT NOT NULL DEFAULT 'open',
    "narrative" TEXT,
    "immediateActions" TEXT,
    "witnessStatements" JSONB NOT NULL DEFAULT '[]',
    "aiInvestigationPack" JSONB,
    "leadInvestigatorId" INTEGER,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_investigation_pkey" PRIMARY KEY ("incidentId")
);

-- CreateTable
CREATE TABLE "incident_corrective_action_plan" (
    "id" TEXT NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "cailEntryId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_corrective_action_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inspection_cail_link" (
    "inspectionId" INTEGER NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "cailEntryId" TEXT NOT NULL,

    CONSTRAINT "equipment_inspection_cail_link_pkey" PRIMARY KEY ("inspectionId","checklistItemId")
);

-- CreateTable
CREATE TABLE "safety_form_cail_link" (
    "safetyFormId" TEXT NOT NULL,
    "fieldId" TEXT,
    "cailEntryId" TEXT NOT NULL,

    CONSTRAINT "safety_form_cail_link_pkey" PRIMARY KEY ("safetyFormId","cailEntryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "safety_inspection_item_cailEntryId_key" ON "safety_inspection_item"("cailEntryId");

-- CreateIndex
CREATE INDEX "safety_inspection_projectId_status_idx" ON "safety_inspection"("projectId", "status");

-- CreateIndex
CREATE INDEX "safety_inspection_inspectorUserId_createdAt_idx" ON "safety_inspection"("inspectorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_inspection_item_inspectionId_idx" ON "safety_inspection_item"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "bbo_observation_cailEntryId_key" ON "bbo_observation"("cailEntryId");

-- CreateIndex
CREATE INDEX "bbo_observation_projectId_polarity_idx" ON "bbo_observation"("projectId", "polarity");

-- CreateIndex
CREATE INDEX "bbo_observation_observedByUserId_observedAt_idx" ON "bbo_observation"("observedByUserId", "observedAt");

-- CreateIndex
CREATE INDEX "incident_investigation_projectId_investigationStatus_idx" ON "incident_investigation"("projectId", "investigationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "incident_corrective_action_plan_cailEntryId_key" ON "incident_corrective_action_plan"("cailEntryId");

-- CreateIndex
CREATE INDEX "incident_corrective_action_plan_incidentId_idx" ON "incident_corrective_action_plan"("incidentId");

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "safety_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_observedByUserId_fkey" FOREIGN KEY ("observedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_observerCompanyId_fkey" FOREIGN KEY ("observerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_leadInvestigatorId_fkey" FOREIGN KEY ("leadInvestigatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_corrective_action_plan" ADD CONSTRAINT "incident_corrective_action_plan_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_corrective_action_plan" ADD CONSTRAINT "incident_corrective_action_plan_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspection_cail_link" ADD CONSTRAINT "equipment_inspection_cail_link_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspection_cail_link" ADD CONSTRAINT "equipment_inspection_cail_link_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_cail_link" ADD CONSTRAINT "safety_form_cail_link_safetyFormId_fkey" FOREIGN KEY ("safetyFormId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_cail_link" ADD CONSTRAINT "safety_form_cail_link_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
