"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyMaintenanceCalibrationDueSchema = exports.EquipmentMaintenanceCalibrationSummarySchema = exports.CreateCalibrationRecordBodySchema = exports.CreateMaintenanceRecordBodySchema = exports.MaintenanceCalibrationDashboardSchema = void 0;
const zod_1 = require("zod");
const equipment_1 = require("./equipment");
exports.MaintenanceCalibrationDashboardSchema = zod_1.z.object({
    maintenanceRecordCount: zod_1.z.number(),
    calibrationRecordCount: zod_1.z.number(),
    maintenanceDueWithin14Days: zod_1.z.number(),
    calibrationDueWithin14Days: zod_1.z.number(),
    maintenanceOverdue: zod_1.z.number(),
    calibrationOverdue: zod_1.z.number(),
    recentMaintenance: zod_1.z.array(zod_1.z.unknown()),
    recentCalibration: zod_1.z.array(zod_1.z.unknown()),
});
exports.CreateMaintenanceRecordBodySchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    type: equipment_1.EquipmentMaintenanceTypeSchema,
    performedAt: zod_1.z.string().datetime().optional(),
    nextDueAt: zod_1.z.string().datetime().optional(),
    meterReading: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
    documentUrl: zod_1.z.string().url().optional(),
});
exports.CreateCalibrationRecordBodySchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    calibratedAt: zod_1.z.string().datetime().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    certificateNumber: zod_1.z.string().optional(),
    passed: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
    documentUrl: zod_1.z.string().url().optional(),
});
exports.EquipmentMaintenanceCalibrationSummarySchema = zod_1.z.object({
    equipmentId: zod_1.z.number(),
    maintenanceSchedules: zod_1.z.array(zod_1.z.unknown()),
    calibrationSchedules: zod_1.z.array(zod_1.z.unknown()),
    maintenanceRecords: zod_1.z.array(zod_1.z.unknown()),
    calibrationRecords: zod_1.z.array(zod_1.z.unknown()),
    nextMaintenanceDue: zod_1.z.string().datetime().nullable(),
    nextCalibrationDue: zod_1.z.string().datetime().nullable(),
    maintenanceOverdue: zod_1.z.boolean(),
    calibrationOverdue: zod_1.z.boolean(),
});
exports.NotifyMaintenanceCalibrationDueSchema = zod_1.z.object({
    notified: zod_1.z.number(),
    equipmentCount: zod_1.z.number(),
});
