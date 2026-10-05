import { EquipmentMaintenanceType } from '@prisma/client';
export declare class CreateMaintenanceDto {
    type?: EquipmentMaintenanceType;
    performedAt?: string;
    performedBy?: number;
    notes?: string;
    nextDueAt?: string;
    meterHours?: number;
}
