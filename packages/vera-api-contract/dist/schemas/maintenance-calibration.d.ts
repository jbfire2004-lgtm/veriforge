import { z } from 'zod';
export declare const MaintenanceCalibrationDashboardSchema: z.ZodObject<{
    maintenanceRecordCount: z.ZodNumber;
    calibrationRecordCount: z.ZodNumber;
    maintenanceDueWithin14Days: z.ZodNumber;
    calibrationDueWithin14Days: z.ZodNumber;
    maintenanceOverdue: z.ZodNumber;
    calibrationOverdue: z.ZodNumber;
    recentMaintenance: z.ZodArray<z.ZodUnknown, "many">;
    recentCalibration: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    maintenanceRecordCount: number;
    calibrationRecordCount: number;
    maintenanceDueWithin14Days: number;
    calibrationDueWithin14Days: number;
    maintenanceOverdue: number;
    calibrationOverdue: number;
    recentMaintenance: unknown[];
    recentCalibration: unknown[];
}, {
    maintenanceRecordCount: number;
    calibrationRecordCount: number;
    maintenanceDueWithin14Days: number;
    calibrationDueWithin14Days: number;
    maintenanceOverdue: number;
    calibrationOverdue: number;
    recentMaintenance: unknown[];
    recentCalibration: unknown[];
}>;
export declare const CreateMaintenanceRecordBodySchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    type: z.ZodEnum<["PREVENTIVE", "CORRECTIVE", "SCHEDULED", "EMERGENCY"]>;
    performedAt: z.ZodOptional<z.ZodString>;
    nextDueAt: z.ZodOptional<z.ZodString>;
    meterReading: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    documentUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SCHEDULED" | "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY";
    equipmentId: number;
    notes?: string | undefined;
    meterReading?: number | undefined;
    performedAt?: string | undefined;
    nextDueAt?: string | undefined;
    documentUrl?: string | undefined;
}, {
    type: "SCHEDULED" | "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY";
    equipmentId: number;
    notes?: string | undefined;
    meterReading?: number | undefined;
    performedAt?: string | undefined;
    nextDueAt?: string | undefined;
    documentUrl?: string | undefined;
}>;
export declare const CreateCalibrationRecordBodySchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    calibratedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    passed: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    documentUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    passed?: boolean | undefined;
    notes?: string | undefined;
    expiresAt?: string | undefined;
    calibratedAt?: string | undefined;
    certificateNumber?: string | undefined;
    documentUrl?: string | undefined;
}, {
    equipmentId: number;
    passed?: boolean | undefined;
    notes?: string | undefined;
    expiresAt?: string | undefined;
    calibratedAt?: string | undefined;
    certificateNumber?: string | undefined;
    documentUrl?: string | undefined;
}>;
export declare const EquipmentMaintenanceCalibrationSummarySchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    maintenanceSchedules: z.ZodArray<z.ZodUnknown, "many">;
    calibrationSchedules: z.ZodArray<z.ZodUnknown, "many">;
    maintenanceRecords: z.ZodArray<z.ZodUnknown, "many">;
    calibrationRecords: z.ZodArray<z.ZodUnknown, "many">;
    nextMaintenanceDue: z.ZodNullable<z.ZodString>;
    nextCalibrationDue: z.ZodNullable<z.ZodString>;
    maintenanceOverdue: z.ZodBoolean;
    calibrationOverdue: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    maintenanceOverdue: boolean;
    calibrationOverdue: boolean;
    maintenanceSchedules: unknown[];
    calibrationSchedules: unknown[];
    maintenanceRecords: unknown[];
    calibrationRecords: unknown[];
    nextMaintenanceDue: string | null;
    nextCalibrationDue: string | null;
}, {
    equipmentId: number;
    maintenanceOverdue: boolean;
    calibrationOverdue: boolean;
    maintenanceSchedules: unknown[];
    calibrationSchedules: unknown[];
    maintenanceRecords: unknown[];
    calibrationRecords: unknown[];
    nextMaintenanceDue: string | null;
    nextCalibrationDue: string | null;
}>;
export declare const NotifyMaintenanceCalibrationDueSchema: z.ZodObject<{
    notified: z.ZodNumber;
    equipmentCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    notified: number;
    equipmentCount: number;
}, {
    notified: number;
    equipmentCount: number;
}>;
