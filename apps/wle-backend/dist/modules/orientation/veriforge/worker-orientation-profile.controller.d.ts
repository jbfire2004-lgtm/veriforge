import { WorkerOrientationProfileService } from './worker-orientation-profile.service';
export declare class WorkerOrientationProfileController {
    private readonly profiles;
    constructor(profiles: WorkerOrientationProfileService);
    getProfile(workerId: number, companyIdRaw?: string, projectIdRaw?: string, siteIdRaw?: string, tradeId?: string, unionDispatchType?: string): Promise<{
        workerId: number;
        requiredOrientations: any[];
        completedOrientations: any[];
        missingOrientations: any[];
        gatingStatus: import("./orientation.types").WorkerOrientationGatingStatus;
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
        gatingStatus: import("./orientation.types").WorkerOrientationGatingStatus;
        reason?: undefined;
    }>;
}
