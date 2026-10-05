import { BboBehaviorCategory, CailRiskCategory, CailSeverity, ObservationPolarity } from '@prisma/client';
export declare class CreateBboDto {
    projectId: number;
    polarity: ObservationPolarity;
    behaviorDescription: string;
    locationNote?: string;
    workActivity?: string;
    workersObservedCount?: number;
    behaviorCategory?: BboBehaviorCategory;
    safeBehaviors?: string;
    atRiskBehaviors?: string;
    antecedents?: string[];
    feedbackGiven?: boolean;
    feedbackNotes?: string;
    workerResponse?: string;
    actionAgreed?: string;
    actionOwnerUserId?: number;
    actionDueAt?: string;
    steeringEscalate?: boolean;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    ownerCompanyId?: number;
    assignedUserId?: number;
    severity?: CailSeverity;
    riskCategory?: CailRiskCategory;
    observedAt?: string;
}
