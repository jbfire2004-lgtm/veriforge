import { PmCorrectiveActionStatus } from '@prisma/client';
export type PublishInput = {
    status: PmCorrectiveActionStatus;
    title: string;
    hasPrimaryAssignee: boolean;
    verificationRequirements: Record<string, unknown>;
};
export type PublishResult = {
    canPublish: boolean;
    violations: string[];
    nextStatus: PmCorrectiveActionStatus;
};
export declare class CapaPublishEngine {
    evaluate(input: PublishInput): PublishResult;
}
