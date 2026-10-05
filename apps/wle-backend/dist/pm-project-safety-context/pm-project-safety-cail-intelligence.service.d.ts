import { PrismaService } from '../prisma/prisma.service';
export type ProjectSafetyCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
};
export declare class PmProjectSafetyCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    hazardRiskScore(severity: number, likelihood: number, sifPotential: boolean): number;
    profileCompletenessScore(profile: {
        requiredJhaTypes: unknown;
        requiredTraining: unknown;
        zoneRulesJson: unknown;
        status: string;
    }): number;
    projectInsights(projectId: number): Promise<ProjectSafetyCailInsight[]>;
    zoneRiskScore(zone: {
        highRisk?: boolean;
        requiresJha?: boolean;
        requiresFlhaHours?: number;
    }): number;
    equipmentRiskScore(rule: Record<string, unknown>): number;
    weakControlDetection(controls: Array<{
        title: string;
        controlType: string;
        status: string;
    }>): string[];
    suggestControlsForHazard(hazard: {
        category: string;
        sifPotential: boolean;
        severity: number;
    }): string[];
    generateProjectSafetyScore(projectId: number): Promise<{
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
        zoneScores: Array<{
            zoneCode: string;
            score: number;
        }>;
        equipmentScore: number;
        workerExposureScore: number;
        computedAt: string;
    }>;
    hazardForecast(projectId: number): Promise<Array<{
        title: string;
        confidence: number;
        source: string;
    }>>;
}
