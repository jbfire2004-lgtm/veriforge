import { PrismaService } from '../../prisma/prisma.service';
import { PmWorkerSafetyProfileService } from '../../pm-worker-safety-profile/pm-worker-safety-profile.service';
export declare class WorkerSafetyProfileService {
    private readonly prisma;
    private readonly pmWorkerProfile?;
    constructor(prisma: PrismaService, pmWorkerProfile?: PmWorkerSafetyProfileService);
    getProfile(workerId: number, projectId?: number): Promise<{
        workerId: number;
        workerName: string;
        trainingCompliance: {
            courseCode: string;
            courseName: string;
            status: string;
            expiresAt: string;
        }[];
        openCailAssigned: number;
        incidentInvolvement12mo: number;
        bboAtRiskCount12mo: number;
        riskScore: number;
        safetyScore: number;
        riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
        lastFlhaDate: any;
        siteAccessStatus: "granted" | "denied";
        denialReasons: string[];
        cailInsights: import("../../pm-worker-safety-profile/pm-worker-safety-cail-intelligence.service").WorkerCailInsight[];
    } | {
        workerId: number;
        workerName: string;
        trainingCompliance: any[];
        openCailAssigned: number;
        incidentInvolvement12mo: number;
        bboAtRiskCount12mo: number;
        riskScore: number;
        lastFlhaDate: any;
        siteAccessStatus: "conditional";
        denialReasons: any[];
        safetyScore?: undefined;
        riskLevel?: undefined;
        cailInsights?: undefined;
    }>;
}
