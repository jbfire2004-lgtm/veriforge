import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import { OrientationAccessService } from '../modules/orientation/orientation-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerTrainingHydrationService } from './worker-training-hydration.service';
import type { WorkerProjectReadinessResult } from './worker-project-readiness.types';
export declare class WorkerProjectReadinessService {
    private readonly prisma;
    private readonly trainingHydration;
    private readonly orientationAccess;
    private readonly contractorCompliance;
    constructor(prisma: PrismaService, trainingHydration: WorkerTrainingHydrationService, orientationAccess: OrientationAccessService, contractorCompliance: ContractorComplianceEngineService);
    evaluate(workerId: number, projectId: number): Promise<WorkerProjectReadinessResult>;
    private resolveRoleType;
    private resolveRequiredTrainingCodes;
    private evaluateOrientation;
    private evaluateContractorPrequalification;
    private findOptionalTrainingGaps;
    private decideStatus;
    private buildSupervisorMessage;
}
