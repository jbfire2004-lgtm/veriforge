import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { TaeAssessmentInput, TaeAssessmentResult } from '../training-assessment/training-assessment.types';
import { AuditLogService } from '../../audit/audit-log.service';
export declare class TrainingAssessmentRunnerService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    buildInput(workerId: number, options?: {
        projectId?: number;
        dateNow?: string;
    }): Promise<TaeAssessmentInput>;
    evaluateAndPersist(workerId: number, createdByUserId?: number, options?: {
        projectId?: number;
    }): Promise<{
        runId: string;
        result: TaeAssessmentResult;
    }>;
    getLatest(workerId: number): Promise<{
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
}
