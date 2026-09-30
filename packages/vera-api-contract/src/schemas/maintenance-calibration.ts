import { z } from 'zod';
import { EquipmentMaintenanceTypeSchema } from './equipment';

export const MaintenanceCalibrationDashboardSchema = z.object({
  maintenanceRecordCount: z.number(),
  calibrationRecordCount: z.number(),
  maintenanceDueWithin14Days: z.number(),
  calibrationDueWithin14Days: z.number(),
  maintenanceOverdue: z.number(),
  calibrationOverdue: z.number(),
  recentMaintenance: z.array(z.unknown()),
  recentCalibration: z.array(z.unknown()),
});

export const CreateMaintenanceRecordBodySchema = z.object({
  equipmentId: z.number(),
  type: EquipmentMaintenanceTypeSchema,
  performedAt: z.string().datetime().optional(),
  nextDueAt: z.string().datetime().optional(),
  meterReading: z.number().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().url().optional(),
});

export const CreateCalibrationRecordBodySchema = z.object({
  equipmentId: z.number(),
  calibratedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  certificateNumber: z.string().optional(),
  passed: z.boolean().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().url().optional(),
});

export const EquipmentMaintenanceCalibrationSummarySchema = z.object({
  equipmentId: z.number(),
  maintenanceSchedules: z.array(z.unknown()),
  calibrationSchedules: z.array(z.unknown()),
  maintenanceRecords: z.array(z.unknown()),
  calibrationRecords: z.array(z.unknown()),
  nextMaintenanceDue: z.string().datetime().nullable(),
  nextCalibrationDue: z.string().datetime().nullable(),
  maintenanceOverdue: z.boolean(),
  calibrationOverdue: z.boolean(),
});

export const NotifyMaintenanceCalibrationDueSchema = z.object({
  notified: z.number(),
  equipmentCount: z.number(),
});
