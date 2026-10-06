-- Tools & PPE module

CREATE TYPE "ToolStatus" AS ENUM ('ACTIVE', 'INSPECTION_DUE', 'RETIRED', 'LOST');
CREATE TYPE "PpeStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RETIRED');
CREATE TYPE "PpeType" AS ENUM (
  'HARD_HAT',
  'SAFETY_GLASSES',
  'GLOVES',
  'HARNESS',
  'FOOTWEAR',
  'HEARING',
  'RESPIRATOR',
  'COVERALL',
  'OTHER'
);
CREATE TYPE "ToolsPpeAssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED');

CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "assetTag" TEXT,
    "category" TEXT,
    "status" "ToolStatus" NOT NULL DEFAULT 'ACTIVE',
    "inspectionIntervalDays" INTEGER NOT NULL DEFAULT 90,
    "lastInspectionAt" TIMESTAMP(3),
    "nextInspectionAt" TIMESTAMP(3),
    "qrToken" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tool_qrToken_key" ON "Tool"("qrToken");
CREATE INDEX "Tool_companyId_status_idx" ON "Tool"("companyId", "status");
CREATE INDEX "Tool_nextInspectionAt_idx" ON "Tool"("nextInspectionAt");
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PPE" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ppeType" "PpeType" NOT NULL DEFAULT 'OTHER',
    "serialNumber" TEXT,
    "status" "PpeStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "condition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPE_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PPE_companyId_status_idx" ON "PPE"("companyId", "status");
CREATE INDEX "PPE_expiresAt_idx" ON "PPE"("expiresAt");
CREATE INDEX "PPE_ppeType_idx" ON "PPE"("ppeType");
ALTER TABLE "PPE" ADD CONSTRAINT "PPE_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ToolInspection" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER,
    "workerId" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "checklist" JSONB,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextInspectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ToolInspection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ToolInspection_toolId_completedAt_idx" ON "ToolInspection"("toolId", "completedAt");
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PPEInspection" (
    "id" SERIAL NOT NULL,
    "ppeId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER,
    "workerId" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "checklist" JSONB,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extendedExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPEInspection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PPEInspection_ppeId_completedAt_idx" ON "PPEInspection"("ppeId", "completedAt");
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_ppeId_fkey" FOREIGN KEY ("ppeId") REFERENCES "PPE"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ToolAssignment" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "projectId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "status" "ToolsPpeAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    CONSTRAINT "ToolAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ToolAssignment_toolId_status_idx" ON "ToolAssignment"("toolId", "status");
CREATE INDEX "ToolAssignment_workerId_status_idx" ON "ToolAssignment"("workerId", "status");
CREATE INDEX "ToolAssignment_projectId_status_idx" ON "ToolAssignment"("projectId", "status");
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PPEAssignment" (
    "id" SERIAL NOT NULL,
    "ppeId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "status" "ToolsPpeAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    CONSTRAINT "PPEAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PPEAssignment_ppeId_status_idx" ON "PPEAssignment"("ppeId", "status");
CREATE INDEX "PPEAssignment_workerId_status_idx" ON "PPEAssignment"("workerId", "status");
CREATE INDEX "PPEAssignment_projectId_status_idx" ON "PPEAssignment"("projectId", "status");
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_ppeId_fkey" FOREIGN KEY ("ppeId") REFERENCES "PPE"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
