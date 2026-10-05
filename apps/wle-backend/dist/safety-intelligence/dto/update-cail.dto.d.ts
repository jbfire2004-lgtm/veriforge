import { CailRiskCategory, CailSeverity, CailStatus } from '@prisma/client';
export declare class UpdateCailDto {
    title?: string;
    description?: string;
    assignedUserId?: number;
    severity?: CailSeverity;
    riskCategory?: CailRiskCategory;
    dueDate?: string;
    status?: CailStatus;
    rootCauseCategory?: string;
    rootCauseNotes?: string;
    tags?: string[];
}
