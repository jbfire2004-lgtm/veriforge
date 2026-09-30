-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('active', 'maintenance', 'locked_out', 'retired', 'out_of_service');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('pass', 'fail', 'conditional', 'pending');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "type" TEXT NOT NULL,
    "model" TEXT,
    "serial_number" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'active',
    "condition_score" INTEGER NOT NULL DEFAULT 100,
    "last_inspection_date" TIMESTAMP(3),
    "next_inspection_due" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inspections" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "inspector_id" UUID NOT NULL,
    "template_id" UUID,
    "status" "InspectionStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_certifications" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "certification_type" TEXT NOT NULL,
    "issued_by" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_authorizations" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "authorized_by" UUID NOT NULL,
    "status" "AuthorizationStatus" NOT NULL DEFAULT 'active',
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_lockouts" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "locked_by" UUID NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocked_by" UUID,
    "unlocked_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipment_lockouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_company_id_serial_number_key" ON "equipment"("company_id", "serial_number");
CREATE INDEX "equipment_company_id_idx" ON "equipment"("company_id");
CREATE INDEX "equipment_company_id_project_id_idx" ON "equipment"("company_id", "project_id");
CREATE INDEX "equipment_status_idx" ON "equipment"("status");
CREATE INDEX "equipment_inspections_equipment_id_idx" ON "equipment_inspections"("equipment_id");
CREATE INDEX "equipment_inspections_equipment_id_created_at_idx" ON "equipment_inspections"("equipment_id", "created_at");
CREATE INDEX "equipment_certifications_equipment_id_idx" ON "equipment_certifications"("equipment_id");
CREATE INDEX "equipment_certifications_equipment_id_expiry_date_idx" ON "equipment_certifications"("equipment_id", "expiry_date");
CREATE UNIQUE INDEX "equipment_authorizations_equipment_id_worker_id_key" ON "equipment_authorizations"("equipment_id", "worker_id");
CREATE INDEX "equipment_authorizations_equipment_id_idx" ON "equipment_authorizations"("equipment_id");
CREATE INDEX "equipment_authorizations_worker_id_idx" ON "equipment_authorizations"("worker_id");
CREATE INDEX "equipment_lockouts_equipment_id_active_idx" ON "equipment_lockouts"("equipment_id", "active");

-- AddForeignKey
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_certifications" ADD CONSTRAINT "equipment_certifications_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_authorizations" ADD CONSTRAINT "equipment_authorizations_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_lockouts" ADD CONSTRAINT "equipment_lockouts_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
