import { PrismaService } from '../prisma/prisma.service';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
export declare class PmInspectionsCailIntelligenceService {
    private readonly prisma;
    private readonly scoring;
    private readonly deficiencyScoring;
    constructor(prisma: PrismaService, scoring: InspectionScoringEngine, deficiencyScoring: DeficiencyScoringEngine);
    predictFromAnswers(templateId: string, answers: Record<string, unknown>): Promise<{
        inspectionQualityScore: number;
        riskScore: number;
        scorePercent: number;
        passed: boolean;
        requiresSupervisorReview: boolean;
        predictedDeficiencyCount: number;
        predictedDeficiencies: {
            itemId: string;
            label: string;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            notes: string;
            requiredActions: string[];
        }[];
        weakControlDetection: string[];
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    projectInsights(projectId: number): Promise<{
        inspectionQualityScore: number;
        averageRiskScore: number;
        failureRate: number;
        openDeficiencies: number;
        hazardPatterns: {
            category: string;
            count: number;
            prediction: string;
        }[];
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    inspectorPerformance(inspectorUserId: number, projectId: number): Promise<{
        inspectorUserId: number;
        inspectionsCompleted: number;
        passRate: number;
        reviewEscalationRate: number;
        score: number;
    }>;
}
