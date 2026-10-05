import { OrientationCompletionStatus, OrientationContentMode, OrientationCreatedByType, OrientationDefinitionType, OrientationMustCompleteBefore } from '@prisma/client';
export type OrientationContentBlockType = 'slide' | 'text' | 'video' | 'quiz' | 'policy_ack';
export type OrientationContentBlock = {
    id: string;
    type: OrientationContentBlockType;
    title?: string;
    body?: string;
    mediaUrl?: string;
    quiz?: {
        prompt: string;
        choices: string[];
        answerIndex: number;
    };
    policyId?: string;
    order: number;
    meta?: Record<string, unknown>;
};
export type OrientationExpiryRules = {
    durationDays?: number;
    conditions?: string[];
};
export type OrientationDefinitionMetadata = {
    aiGenerated?: boolean;
    sourceFileId?: string;
    tags?: string[];
    [key: string]: unknown;
};
export type CreateOrientationDefinitionInput = {
    companyId: number;
    title: string;
    type: OrientationDefinitionType;
    contentMode?: OrientationContentMode;
    contentBlocks?: OrientationContentBlock[];
    createdByUserId: number;
    createdByType?: OrientationCreatedByType;
    version?: string;
    isPublished?: boolean;
    expiryRules?: OrientationExpiryRules;
    metadata?: OrientationDefinitionMetadata;
    sourceFileKey?: string;
    sourceCoreFileId?: number;
};
export type UpdateOrientationDefinitionInput = {
    title?: string;
    type?: OrientationDefinitionType;
    contentMode?: OrientationContentMode;
    contentBlocks?: OrientationContentBlock[];
    isPublished?: boolean;
    expiryRules?: OrientationExpiryRules;
    metadata?: OrientationDefinitionMetadata;
    bumpVersion?: boolean;
};
export type CreateOrientationRequirementInput = {
    orientationId: string;
    companyId: number;
    projectId?: number;
    siteId?: number;
    tradeId?: string;
    unionDispatchType?: string;
    mustCompleteBefore: OrientationMustCompleteBefore;
    isActive?: boolean;
};
export type ResolveRequirementsInput = {
    workerId: number;
    companyId: number;
    projectId?: number;
    siteId?: number;
    tradeId?: string;
    unionDispatchType?: string;
};
export type CreateOrientationCompletionInput = {
    workerId: number;
    orientationId: string;
    companyId: number;
    projectId?: number;
    score?: number;
    status?: OrientationCompletionStatus;
    clientSyncId?: string;
    actorId?: number;
};
export type WorkerOrientationGatingStatus = 'allowed' | 'blocked' | 'warning';
export { OrientationCompletionStatus, OrientationContentMode, OrientationCreatedByType, OrientationDefinitionType, OrientationMustCompleteBefore, };
