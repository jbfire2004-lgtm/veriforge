import { PrismaService } from '../prisma/prisma.service';
export type HcCailInsight = {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    explanation: string;
    inputs: Record<string, unknown>;
    recommendation: string;
    correlatedModules: string[];
};
export declare class PmUnifiedHazardControlCailService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    companyHazardScore(metrics: {
        publishedHazards: number;
        unmappedHazards: number;
        sifCount: number;
        chronicCount: number;
    }): number;
    insights(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<HcCailInsight[]>;
    predictHazardDetection(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        title: string;
        source: string;
        confidence: number;
    }>>;
    hazardIncidentCorrelation(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        hazardId: string;
        title: string;
        incidentCount: number;
    }>>;
    projectHazardScore(projectId: number): Promise<number>;
    companyHazardScoreFromDb(companyId: number, projectId?: number): Promise<number>;
    chronicHazardDetection(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<Array<{
        title: string;
        repeatCount: number;
    }>>;
}
