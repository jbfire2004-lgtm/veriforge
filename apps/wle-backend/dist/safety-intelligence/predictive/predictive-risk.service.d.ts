import { PrismaService } from '../../prisma/prisma.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
export type PredictiveRiskReport = {
    projectId: number;
    predictedLevel: string;
    score: number;
    precursors: string[];
    interventions: Array<{
        type: string;
        message: string;
        urgency?: string;
    }>;
    companyHotspots: Array<{
        companyId: number;
        count: number;
        topCategory: string | null;
    }>;
    engine: string;
    computedAt: string;
};
export declare class PredictiveRiskService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: SafetyIntelligenceAiService);
    latestSnapshot(projectId: number): Promise<PredictiveRiskReport | null>;
    computeAndStore(projectId: number): Promise<PredictiveRiskReport>;
    compute(projectId: number): Promise<PredictiveRiskReport>;
    private toReport;
}
