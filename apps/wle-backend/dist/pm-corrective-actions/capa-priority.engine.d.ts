import { PmCorrectiveActionType } from '@prisma/client';
export declare class CapaPriorityEngine {
    score(input: {
        severity: string;
        actionType: PmCorrectiveActionType;
        sifLinked?: boolean;
        hecaLinked?: boolean;
        equipmentUnsafe?: boolean;
        overdue?: boolean;
    }): {
        severityScore: number;
        priorityScore: number;
        explainability: {
            rule: string;
            points: number;
        }[];
    };
}
