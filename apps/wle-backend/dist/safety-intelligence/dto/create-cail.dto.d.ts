import { CailRiskCategory, CailSeverity, CailSourceType } from '@prisma/client';
export declare class CreateCailDto {
    projectId: number;
    ownerCompanyId: number;
    sourceType: CailSourceType;
    sourceId?: string;
    sourceItemId?: string;
    title: string;
    description?: string;
    severity?: CailSeverity;
    riskCategory?: CailRiskCategory;
    dueDate?: string;
    assignedUserId?: number;
    siteId?: number;
    locationNote?: string;
    equipmentId?: number;
    workerId?: number;
    tags?: string[];
}
