import { PrismaService } from '../prisma/prisma.service';
export type WorkerCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
};
export declare class PmWorkerSafetyCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    predictIncidentLikelihood(score: number, sifExposures: number, denials30d: number): {
        probability: number;
        level: string;
        factors: string[];
    };
    workerInsights(workerId: number, projectId?: number): Promise<WorkerCailInsight[]>;
    predictTrainingNeeds(workerId: number): Promise<Array<{
        trainingCode: string;
        reason: string;
        priority: string;
    }>>;
    predictAuthorizationNeeds(workerId: number): Promise<Array<{
        authType: string;
        reason: string;
    }>>;
    chronicHazardExposure(exposures: Array<{
        sifPotential: boolean;
        severity: number;
        exposedAt: Date;
    }>, windowDays?: number): {
        chronic: boolean;
        count: number;
        highSeverityCount: number;
    };
    weakControlSignals(openCapa: number, overdueCapa: number, denials30d: number): string[];
}
