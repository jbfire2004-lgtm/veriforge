import { CailRiskCategory, CailSeverity, ObservationPolarity } from '@prisma/client';
export declare class CreateInspectionItemDto {
    polarity: ObservationPolarity;
    photoStorageKey?: string;
    photoDataUrl?: string;
    coreFileId?: number;
    ocrText?: string;
    caption?: string;
    ownerCompanyId?: number;
    assignedUserId?: number;
    equipmentId?: number;
    riskCategory?: CailRiskCategory;
    severity?: CailSeverity;
    notes?: string;
}
