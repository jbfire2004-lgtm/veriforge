import { InspectionKind, InspectionType } from '@prisma/client';
export declare class CreateInspectionDto {
    equipmentId: number;
    workerId?: number;
    siteId?: number;
    checklistId?: number;
    inspectionType?: InspectionType;
    kind?: InspectionKind;
    checklist: Record<string, unknown>;
    passed: boolean;
    photos?: string[];
    correctiveActions?: string;
    notes?: string;
    meterReading?: number;
    signature?: string;
}
export declare class UnlockAfterInspectionDto {
    notes?: string;
}
