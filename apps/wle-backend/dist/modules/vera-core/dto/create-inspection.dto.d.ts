import { InspectionKind } from '@prisma/client';
export declare class CreateInspectionDto {
    equipmentId: number;
    siteId?: number;
    kind?: InspectionKind;
    checklist: Record<string, unknown>;
    passed: boolean;
    notes?: string;
    correctiveActions?: string;
    meterReading?: number;
    signature?: string;
}
