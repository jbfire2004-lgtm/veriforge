-- Maintenance & calibration schedules

CREATE TABLE "MaintenanceSchedule" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentMaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
    "intervalDays" INTEGER NOT NULL DEFAULT 90,
    "intervalHours" DOUBLE PRECISION,
    "nextDueAt" TIMESTAMP(3),
    "lastPerformedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MaintenanceSchedule_equipmentId_active_idx" ON "MaintenanceSchedule"("equipmentId", "active");
CREATE INDEX "MaintenanceSchedule_nextDueAt_idx" ON "MaintenanceSchedule"("nextDueAt");
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CalibrationSchedule" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "intervalDays" INTEGER NOT NULL DEFAULT 365,
    "nextDueAt" TIMESTAMP(3),
    "lastCalibratedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalibrationSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CalibrationSchedule_equipmentId_active_idx" ON "CalibrationSchedule"("equipmentId", "active");
CREATE INDEX "CalibrationSchedule_nextDueAt_idx" ON "CalibrationSchedule"("nextDueAt");
ALTER TABLE "CalibrationSchedule" ADD CONSTRAINT "CalibrationSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
