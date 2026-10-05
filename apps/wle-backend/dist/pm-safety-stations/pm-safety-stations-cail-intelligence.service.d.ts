import { PrismaService } from '../prisma/prisma.service';
export type StationCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
    entityType?: string;
    entityId?: string;
};
export declare class PmSafetyStationsCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    workerRiskScore(input: {
        denialCount7d: number;
        openCapa: number;
        missingTraining: number;
        chronicDenials: boolean;
    }): number;
    equipmentRiskScore(input: {
        lotoActive: boolean;
        failedInspection: boolean;
        openFailure: boolean;
    }): number;
    zoneRiskScore(zoneType: string, highRisk: boolean): number;
    predictAccessDenial(checks: Record<string, boolean>): {
        likelyDenied: boolean;
        probability: number;
        topFactors: string[];
    };
    projectInsights(projectId: number): Promise<StationCailInsight[]>;
    musterAnomalyDetection(projectId: number): Promise<StationCailInsight | null>;
    stationRiskBundle(projectId: number, workerId?: number): Promise<{
        workerRiskScore: number;
        zoneRiskScore: number;
        predictiveAccessDenial: number;
    }>;
    weakControlDetection(jhaControlCount: number, inspectionDeficiencies: number): StationCailInsight | null;
}
