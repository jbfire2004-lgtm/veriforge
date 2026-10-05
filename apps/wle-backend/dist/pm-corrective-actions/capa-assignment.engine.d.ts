import { PmCapaAssigneeRole } from '@prisma/client';
export type AssigneeSuggestion = {
    userId?: number;
    workerId?: number;
    role: PmCapaAssigneeRole;
    reason: string;
};
export declare class CapaAssignmentEngine {
    suggest(input: {
        severity: string;
        sourceModule: string;
        assignedUserId?: number;
        equipmentOwnerUserId?: number;
        projectSafetyLeadId?: number;
        sifLinked?: boolean;
    }): AssigneeSuggestion[];
}
