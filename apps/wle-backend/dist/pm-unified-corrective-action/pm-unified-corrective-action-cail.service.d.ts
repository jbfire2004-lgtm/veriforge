import { PrismaService } from '../prisma/prisma.service';
export type UnifiedCapaInsight = {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    explanation: string;
    inputs: Record<string, unknown>;
    recommendation: string;
    correlatedModules: string[];
};
export declare class PmUnifiedCorrectiveActionCailService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overdueRiskScore(input: {
        openCount: number;
        overdueCount: number;
        avgDaysToDue: number;
        escalationLevelMax: number;
    }): number;
    companyCapaScore(metrics: {
        open: number;
        overdue: number;
        closureRate: number;
        criticalOpen: number;
    }): number;
    insights(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<UnifiedCapaInsight[]>;
    predictCapaGeneration(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        title: string;
        source: string;
        confidence: number;
    }>>;
    workerRiskScoring(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        workerId: number;
        openCount: number;
        overdueCount: number;
        riskScore: number;
    }>>;
    equipmentRiskScoring(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        equipmentId: number;
        openCount: number;
        riskScore: number;
    }>>;
    chronicDeficiencyDetection(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        sourceId: string;
        sourceModule: string;
        repeatCount: number;
    }>>;
    weakControlDetection(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        hazardId: string;
        controlId: string;
        effectivenessScore: number | null;
    }>>;
    projectCapaScore(projectId: number): Promise<number>;
}
