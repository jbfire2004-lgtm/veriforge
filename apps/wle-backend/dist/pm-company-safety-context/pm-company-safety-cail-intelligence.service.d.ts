import { PrismaService } from '../prisma/prisma.service';
export type CompanyCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
};
export declare class PmCompanySafetyCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    workerRiskScore(denials30d: number, openCapa: number, missingTraining: number): number;
    equipmentRiskScore(lotoCount: number, failedInspections: number): number;
    hazardRiskScore(severity: number, likelihood: number, sifPotential: boolean): number;
    weakControlDetection(controlStrength: number, openDeficiencies: number): CompanyCailInsight | null;
    companyInsights(companyId: number): Promise<CompanyCailInsight[]>;
    predictCorporateRisk(incidentTrend: number, denialRate: number): {
        predictedLevel: string;
        score: number;
        factors: string[];
    };
    suggestControlsForHazard(hazard: {
        category: string;
        sifPotential: boolean;
        severity: number;
    }): string[];
    hazardForecast(companyId: number): Promise<Array<{
        title: string;
        confidence: number;
        source: string;
    }>>;
    generateCorporateSafetyScore(companyId: number): Promise<{
        score: number;
        maxScore: number;
        band: string;
        components: Array<{
            key: string;
            deduction: number;
            value: unknown;
        }>;
        predictedRisk: number;
        weakControls: string[];
        computedAt: string;
    }>;
}
