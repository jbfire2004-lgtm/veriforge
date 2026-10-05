import { PrismaService } from '../prisma/prisma.service';
export type EquipmentCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
    equipmentId?: number;
};
export declare class PmEquipmentCailIntelligenceService {
    private readonly prisma;
    private readonly conditionEngine;
    constructor(prisma: PrismaService);
    projectInsights(projectId: number): Promise<EquipmentCailInsight[]>;
    equipmentRiskPrediction(equipmentId: number): Promise<{
        equipmentId: number;
        score: number;
        band: string;
        conditionScore?: undefined;
        riskBand?: undefined;
        predictiveFailureLikelihood?: undefined;
        recommendedActions?: undefined;
        explainability?: undefined;
    } | {
        equipmentId: number;
        conditionScore: number;
        riskBand: "medium" | "low" | "high" | "critical";
        predictiveFailureLikelihood: number;
        recommendedActions: string[];
        explainability: string[];
        score?: undefined;
        band?: undefined;
    }>;
    operatorRiskScore(workerId: number, projectId: number): Promise<{
        workerId: number;
        failureCount: number;
        openCapa: number;
        score: number;
        band: string;
    }>;
    correlateEquipment(equipmentId: number): {
        equipmentId: number;
        jha: string;
        inspections: string;
        incidents: string;
        correctiveActions: string;
        sds: string;
    };
}
