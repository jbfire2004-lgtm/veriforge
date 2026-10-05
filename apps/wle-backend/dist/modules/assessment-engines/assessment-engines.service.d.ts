import { Prisma, VeraAssessmentEngine } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SpceAssessmentInput, SpceAssessmentResult } from '../safety-program-compliance/safety-program-compliance.types';
import type { SgaeAssessmentResult } from '../smart-gap-analysis/smart-gap-analysis.types';
import { TrainingAssessmentRunnerService } from './training-assessment-runner.service';
import { AuditLogService } from '../../audit/audit-log.service';
export declare class AssessmentEnginesService {
    private readonly prisma;
    private readonly trainingRunner;
    private readonly auditLog;
    constructor(prisma: PrismaService, trainingRunner: TrainingAssessmentRunnerService, auditLog: AuditLogService);
    runTrainingAssessment(workerId: number, createdByUserId?: number, projectId?: number): Promise<{
        runId: string;
        result: import("../training-assessment/training-assessment.types").TaeAssessmentResult;
    }>;
    getLatestTrainingAssessment(workerId: number): Promise<{
        runId: string;
        evaluatedAt: Date;
        overallScore: number;
        overallStatus: string;
        result: Prisma.JsonValue;
    }>;
    buildSpceInput(companyId: number, overrides?: Partial<SpceAssessmentInput>): Promise<SpceAssessmentInput>;
    runSafetyProgramCompliance(companyId: number, createdByUserId?: number, inputOverride?: Partial<SpceAssessmentInput>): Promise<{
        runId: string;
        result: SpceAssessmentResult;
    }>;
    runSmartGapAnalysis(companyId: number, hiringClientId: number, createdByUserId?: number, projectId?: number): Promise<{
        runId: string;
        result: SgaeAssessmentResult;
    }>;
    getLatestByEngine(engine: VeraAssessmentEngine, filters: {
        companyId?: number;
        workerId?: number;
        projectId?: number;
    }): Promise<{
        id: string;
        engine: import(".prisma/client").$Enums.VeraAssessmentEngine;
        companyId: number | null;
        projectId: number | null;
        workerId: number | null;
        hiringClientId: number | null;
        overallScore: number;
        overallStatus: string;
        resultJson: Prisma.JsonValue;
        evaluatedAt: Date;
        createdByUserId: number | null;
        createdAt: Date;
    }>;
    listHistoryByEngine(engine: VeraAssessmentEngine, filters: {
        companyId: number;
        projectId?: number;
    }, limit?: number): Promise<{
        id: string;
        overallStatus: string;
        overallScore: number;
        evaluatedAt: Date;
    }[]>;
    private resolveWorkerIds;
    private buildFieldDataSummary;
}
