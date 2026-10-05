import { EquipmentMaintenanceType } from '@prisma/client';
export declare class CreateMaintenanceRecordDto {
    equipmentId: number;
    type?: EquipmentMaintenanceType;
    performedAt?: string;
    performedBy?: number;
    notes?: string;
    nextDueAt?: string;
    meterHours?: number;
}
export declare class CreateCalibrationRecordDto {
    equipmentId: number;
    calibratedAt?: string;
    calibratedBy?: number;
    certificateNumber?: string;
    expiresAt?: string;
    passed?: boolean;
    notes?: string;
}
export declare class CreateMaintenanceScheduleDto {
    equipmentId: number;
    type?: EquipmentMaintenanceType;
    intervalDays?: number;
    intervalHours?: number;
    notes?: string;
}
export declare class CreateCalibrationScheduleDto {
    equipmentId: number;
    intervalDays?: number;
    notes?: string;
}
