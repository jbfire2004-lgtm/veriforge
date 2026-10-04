-- CreateEnum
CREATE TYPE "SafetyFormType" AS ENUM ('JHA', 'FLHA', 'SIF', 'HECA', 'ENERGY_WHEEL', 'INSPECTION');

-- AlterTable
ALTER TABLE "safety_forms" ADD COLUMN "formType" "SafetyFormType",
ADD COLUMN "supervisorId" INTEGER;

-- CreateTable
CREATE TABLE "safety_form_templates" (
    "id" TEXT NOT NULL,
    "formType" "SafetyFormType" NOT NULL,
    "name" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "template" JSONB NOT NULL DEFAULT '{}',
    "companyId" INTEGER,
    "projectId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "safety_forms_formType_status_idx" ON "safety_forms"("formType", "status");

-- CreateIndex
CREATE INDEX "safety_form_templates_formType_active_idx" ON "safety_form_templates"("formType", "active");

-- CreateIndex
CREATE INDEX "safety_form_templates_companyId_projectId_idx" ON "safety_form_templates"("companyId", "projectId");

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_templates" ADD CONSTRAINT "safety_form_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_templates" ADD CONSTRAINT "safety_form_templates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
