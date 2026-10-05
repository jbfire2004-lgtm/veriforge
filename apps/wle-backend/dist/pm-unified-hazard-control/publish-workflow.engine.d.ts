import { PmUnifiedHcPublishStatus } from '@prisma/client';
export type PublishInput = {
    status: PmUnifiedHcPublishStatus;
    mappingComplete: boolean;
    sifPotential: boolean;
    supervisorReviewRequired: boolean;
    linkedControlCount: number;
};
export type PublishResult = {
    canPublish: boolean;
    violations: string[];
    nextStatus: PmUnifiedHcPublishStatus;
};
export declare class PublishWorkflowEngine {
    evaluateHazard(input: PublishInput): PublishResult;
    evaluateControl(input: {
        status: PmUnifiedHcPublishStatus;
        verificationStepCount: number;
    }): PublishResult;
}
