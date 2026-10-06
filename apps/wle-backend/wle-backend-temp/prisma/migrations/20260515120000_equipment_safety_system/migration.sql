-- Vera Core: equipment safety catalog fields, inspections, competency, wallet, audit rows.

CREATE TYPE "EquipmentCatalogCategory" AS ENUM ('MOBILE_EQUIPMENT', 'SAFETY_CRITICAL', 'SERIALIZED_TOOLS', 'OTHER');

CREATE TYPE "InspectionKind" AS ENUM ('PRE_USE', 'FORMAL');

ALTER TABLE "Equipment" ADD COLUMN "catalogCategory" "EquipmentCatalogCategory",
ADD COLUMN "catalogTypeKey" TEXT,
ADD COLUMN "meterHours" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX "Equipment_catalogTypeKey_idx" ON "Equipment"("catalogTypeKey");

ALTER TABLE "Inspection" ADD COLUMN "kind" "InspectionKind" NOT NULL DEFAULT 'PRE_USE',
ADD COLUMN "checklist" JSONB,
ADD COLUMN "passed" BOOLEAN,
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "signature" TEXT,
ADD COLUMN "meterReading" DOUBLE PRECISION;

CREATE INDEX "Inspection_equipmentId_kind_createdAt_idx" ON "Inspection"("equipmentId", "kind", "createdAt");

CREATE TABLE "InspectionTemplate" (
    "id" SERIAL NOT NULL,
    "catalogTypeKey" TEXT NOT NULL,
    "catalogCategory" "EquipmentCatalogCategory" NOT NULL,
    "kind" "InspectionKind" NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InspectionTemplate_catalogTypeKey_kind_key" ON "InspectionTemplate"("catalogTypeKey", "kind");

CREATE INDEX "InspectionTemplate_catalogCategory_kind_idx" ON "InspectionTemplate"("catalogCategory", "kind");

CREATE TABLE "CompetencyEvaluation" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "evaluatorUserId" INTEGER,
    "equipmentTypeKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "evidenceNotes" TEXT,
    "evidencePhotos" JSONB,
    "workerSignature" TEXT,
    "evaluatorSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EquipmentCompetencyRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "minPassingScore" INTEGER NOT NULL DEFAULT 70,
    "certificationId" INTEGER,

    CONSTRAINT "EquipmentCompetencyRequirement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EquipmentCompetencyRequirement_equipmentId_key" ON "EquipmentCompetencyRequirement"("equipmentId");

CREATE TABLE "WorkerWalletItem" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "catalogTypeKey" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerWalletItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkerWalletItem_workerId_status_idx" ON "WorkerWalletItem"("workerId", "status");

CREATE INDEX "WorkerWalletItem_companyId_catalogTypeKey_idx" ON "WorkerWalletItem"("companyId", "catalogTypeKey");

CREATE TABLE "CompanyEquipmentAuditView" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "lastPreUseAt" TIMESTAMP(3),
    "lastFormalAt" TIMESTAMP(3),
    "preUseCompliant7d" BOOLEAN NOT NULL DEFAULT false,
    "formalCompliant" BOOLEAN NOT NULL DEFAULT false,
    "trainingOperatorsOk" INTEGER NOT NULL DEFAULT 0,
    "trainingOperatorsTotal" INTEGER NOT NULL DEFAULT 0,
    "competencyOperatorsOk" INTEGER NOT NULL DEFAULT 0,
    "competencyOperatorsTotal" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyEquipmentAuditView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyEquipmentAuditView_companyId_equipmentId_key" ON "CompanyEquipmentAuditView"("companyId", "equipmentId");

ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CompetencyEvaluation_workerId_equipmentId_createdAt_idx" ON "CompetencyEvaluation"("workerId", "equipmentId", "createdAt");

CREATE INDEX "CompetencyEvaluation_equipmentId_createdAt_idx" ON "CompetencyEvaluation"("equipmentId", "createdAt");

ALTER TABLE "EquipmentCompetencyRequirement" ADD CONSTRAINT "EquipmentCompetencyRequirement_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentCompetencyRequirement" ADD CONSTRAINT "EquipmentCompetencyRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CompanyEquipmentAuditView" ADD CONSTRAINT "CompanyEquipmentAuditView_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyEquipmentAuditView" ADD CONSTRAINT "CompanyEquipmentAuditView_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
