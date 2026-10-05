import { PmCorrectiveActionType } from '@prisma/client';
export type GenerationTrigger = {
    sourceModule: string;
    sourceId: string;
    sourceItemId?: string;
    title: string;
    description?: string;
    actionType: PmCorrectiveActionType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    hazardId?: string;
    controlId?: string;
    equipmentId?: number;
    workerId?: number;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    verificationRole: string;
    linkTypes: Array<{
        linkType: string;
        linkedId: string;
    }>;
};
export declare class CapaGenerationEngine {
    classify(input: {
        severity: string;
        sifLinked?: boolean;
        equipmentUnsafe?: boolean;
        trainingExpired?: boolean;
        accessDenied?: boolean;
    }): {
        priority: string;
        verificationRole: string;
        escalationHint: number;
    };
    buildTrigger(partial: Partial<GenerationTrigger> & Pick<GenerationTrigger, 'sourceModule' | 'sourceId' | 'title'>): GenerationTrigger;
}
