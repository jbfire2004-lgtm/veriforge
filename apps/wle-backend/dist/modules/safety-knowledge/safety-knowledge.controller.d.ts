import type { Response } from 'express';
import { SafetyKnowledgeService } from './safety-knowledge.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { SkeAssessmentResult } from './safety-knowledge.types';
export declare class SafetyKnowledgeController {
    private readonly safetyKnowledge;
    private readonly prisma;
    constructor(safetyKnowledge: SafetyKnowledgeService, prisma: PrismaService);
    evaluate(workerId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        runId: string;
        result: SkeAssessmentResult;
    }>;
    latest(workerId: string): Promise<{
        id: string;
        engine: import(".prisma/client").$Enums.VeraAssessmentEngine;
        companyId: number | null;
        projectId: number | null;
        workerId: number | null;
        hiringClientId: number | null;
        overallScore: number;
        overallStatus: string;
        resultJson: import(".prisma/client").Prisma.JsonValue;
        evaluatedAt: Date;
        createdByUserId: number | null;
        createdAt: Date;
    }>;
    history(workerId: string): Promise<{
        id: string;
        overallStatus: string;
        createdByUserId: number;
        overallScore: number;
        evaluatedAt: Date;
    }[]>;
    exportPdf(workerId: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
