import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SkeAssessmentResult } from './safety-knowledge.types';
import { AuditLogService } from '../../audit/audit-log.service';
export declare class SafetyKnowledgeService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    buildInput(workerId: number): Promise<{
        context: {
            dateNow: string;
            jurisdiction: string;
        };
        worker: {
            id: string;
            name: string;
            companyId: string;
        };
        requiredCourses: {
            code: string;
            name: string;
        }[];
        trainingRecords: {
            courseCode: string;
            verified: boolean;
            expired: boolean;
            expiringSoon: boolean;
        }[];
        orientationComplete: boolean;
        policyAcknowledgments: {
            required: number;
            completed: number;
        };
        fieldActivity: {
            flhaCount90d: number;
            bboCount90d: number;
            inspections90d: number;
        };
    }>;
    evaluateAndPersist(workerId: number, createdByUserId?: number): Promise<{
        runId: string;
        result: SkeAssessmentResult;
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
    listHistory(workerId: number, limit?: number): Promise<{
        id: string;
        overallStatus: string;
        createdByUserId: number;
        overallScore: number;
        evaluatedAt: Date;
    }[]>;
    buildPdf(result: SkeAssessmentResult, workerName: string): Buffer;
}
