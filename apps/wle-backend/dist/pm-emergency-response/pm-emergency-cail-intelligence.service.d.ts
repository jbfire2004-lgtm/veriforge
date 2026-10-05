import { PrismaService } from '../prisma/prisma.service';
export type EmergencyCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
};
export declare class PmEmergencyCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    projectInsights(projectId: number): Promise<EmergencyCailInsight[]>;
    musterComplianceScore(checkedIn: number, expected: number): number;
    responseQualityScore(input: {
        declareToMusterMinutes?: number;
        missingWorkerCount: number;
        equipmentReadinessAvg: number;
    }): number;
    predictEmergencyRisk(emergencyEventId: string): Promise<{
        emergencyEventId: string;
        score: number;
        predictiveEmergencyLikelihood?: undefined;
        musterComplianceScore?: undefined;
        responseQualityScore?: undefined;
        missingWorkerDetection?: undefined;
        missingWorkerIds?: undefined;
        hazardCorrelation?: undefined;
        explainability?: undefined;
    } | {
        emergencyEventId: string;
        predictiveEmergencyLikelihood: number;
        musterComplianceScore: number;
        responseQualityScore: number;
        missingWorkerDetection: boolean;
        missingWorkerIds: import(".prisma/client").Prisma.JsonArray;
        hazardCorrelation: {
            eventId: string;
            jha: string;
            inspections: string;
            incidents: string;
            correctiveActions: string;
        };
        explainability: {
            rule: string;
            detail: string;
        }[];
        score?: undefined;
    }>;
    predictProjectEmergencyLikelihood(projectId: number): Promise<{
        projectId: number;
        likelihood: number;
        predictiveEmergencyLikelihood?: undefined;
        factors?: undefined;
    } | {
        projectId: number;
        predictiveEmergencyLikelihood: number;
        factors: {
            lowEquipment: number;
            unackedPlans: number;
            recentIncidents: number;
        };
        likelihood?: undefined;
    }>;
    correlateEmergency(eventId: string): {
        eventId: string;
        jha: string;
        inspections: string;
        incidents: string;
        correctiveActions: string;
    };
}
