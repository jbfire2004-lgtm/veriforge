import { PmProjectSafetyPublishStatus } from '@prisma/client';
export type PublishTransition = {
    allowed: boolean;
    nextStatus: PmProjectSafetyPublishStatus;
    errors: string[];
};
export declare class PublishWorkflowEngine {
    profilePublish(current: PmProjectSafetyPublishStatus, hasRequiredFields: boolean): PublishTransition;
    hazardPublish(current: PmProjectSafetyPublishStatus, title: string, description: string): PublishTransition;
    controlPublish(current: PmProjectSafetyPublishStatus, title: string, description: string): PublishTransition;
    archive(current: PmProjectSafetyPublishStatus): PublishTransition;
    mapWorkflowState(status: PmProjectSafetyPublishStatus, profilePublished: boolean, enforcementActive: boolean): 'draft' | 'published' | 'enforced' | 'updated';
    validatePublishReadiness(input: {
        publishedHazardCount: number;
        hazardsWithoutControls: number;
        zoneRuleCount: number;
        equipmentRuleKeys: number;
        trainingRuleKeys: number;
        emergencyRuleKeys: number;
    }): {
        valid: boolean;
        errors: string[];
    };
}
