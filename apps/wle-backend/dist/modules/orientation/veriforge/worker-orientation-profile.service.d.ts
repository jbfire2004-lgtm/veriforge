import { PrismaService } from '../../../prisma/prisma.service';
import { OrientationRequirementService } from './orientation-requirement.service';
import { OrientationCompletionService } from './orientation-completion.service';
import type { WorkerOrientationGatingStatus } from './orientation.types';
export declare class WorkerOrientationProfileService {
    private readonly prisma;
    private readonly requirements;
    private readonly completions;
    constructor(prisma: PrismaService, requirements: OrientationRequirementService, completions: OrientationCompletionService);
    getProfile(workerId: number, opts?: {
        companyId?: number;
        projectId?: number;
        siteId?: number;
        tradeId?: string;
        unionDispatchType?: string;
    }): Promise<{
        workerId: number;
        requiredOrientations: any[];
        completedOrientations: any[];
        missingOrientations: any[];
        gatingStatus: WorkerOrientationGatingStatus;
        reason: string;
        companyId?: undefined;
        projectId?: undefined;
    } | {
        workerId: number;
        companyId: number;
        projectId: number;
        requiredOrientations: {
            requirementId: string;
            orientationId: string;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            mustCompleteBefore: import(".prisma/client").$Enums.OrientationMustCompleteBefore;
            version: string;
        }[];
        completedOrientations: {
            completionId: string;
            orientationId: string;
            title: string;
            completedOn: Date;
            expiresOn: Date;
            score: number;
            status: import(".prisma/client").$Enums.OrientationCompletionStatus;
        }[];
        missingOrientations: {
            requirementId: string;
            orientationId: string;
            title: string;
            mustCompleteBefore: import(".prisma/client").$Enums.OrientationMustCompleteBefore;
        }[];
        gatingStatus: WorkerOrientationGatingStatus;
        reason?: undefined;
    }>;
}
