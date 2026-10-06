-- CreateEnum
CREATE TYPE "ProjectSafetyRoleType" AS ENUM ('prime_admin', 'company_safety_manager', 'supervisor', 'worker', 'client_readonly');

-- CreateTable
CREATE TABLE "project_safety_role" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "role" "ProjectSafetyRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_safety_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_safety_risk_snapshot" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "predictedLevel" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "precursors" JSONB NOT NULL DEFAULT '[]',
    "interventions" JSONB NOT NULL DEFAULT '[]',
    "companyHotspots" JSONB NOT NULL DEFAULT '[]',
    "engine" TEXT NOT NULL DEFAULT 'vase',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_safety_risk_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_safety_role_projectId_userId_key" ON "project_safety_role"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_safety_role_projectId_role_idx" ON "project_safety_role"("projectId", "role");

-- CreateIndex
CREATE INDEX "project_safety_risk_snapshot_projectId_computedAt_idx" ON "project_safety_risk_snapshot"("projectId", "computedAt");

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_risk_snapshot" ADD CONSTRAINT "project_safety_risk_snapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
