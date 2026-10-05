import type { Response } from 'express';
import { FitTestResult } from '@prisma/client';
import { AssessmentEnginesService } from './assessment-engines.service';
import { AssessmentExportService } from './assessment-export.service';
import { FitTestService } from '../fit-test/fit-test.service';
import type { SpceAssessmentInput } from '../safety-program-compliance/safety-program-compliance.types';
export declare class AssessmentEnginesController {
    private readonly engines;
    private readonly exportPdf;
    private readonly fitTests;
    constructor(engines: AssessmentEnginesService, exportPdf: AssessmentExportService, fitTests: FitTestService);
    runTraining(workerId: string, projectId: string | undefined, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        runId: string;
        result: import("../training-assessment/training-assessment.types").TaeAssessmentResult;
    }>;
    latestTraining(workerId: string): Promise<{
        runId: string;
        evaluatedAt: Date;
        overallScore: number;
        overallStatus: string;
        result: import(".prisma/client").Prisma.JsonValue;
    }>;
    runSpce(companyId: string, req: {
        user?: {
            userId?: number;
        };
    }, body?: Partial<SpceAssessmentInput>): Promise<{
        runId: string;
        result: import("../safety-program-compliance/safety-program-compliance.types").SpceAssessmentResult;
    }>;
    latestSpce(companyId: string): Promise<{
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
    spceHistory(companyId: string, limit?: string): Promise<{
        id: string;
        overallStatus: string;
        overallScore: number;
        evaluatedAt: Date;
    }[]>;
    runSmartGap(companyId: string, hiringClientId: string, projectId: string | undefined, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        runId: string;
        result: import("../smart-gap-analysis/smart-gap-analysis.types").SgaeAssessmentResult;
    }>;
    exportTraining(workerId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    exportSpce(companyId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    exportSmartGapPdf(companyId: string, projectId: string | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    latestSmartGap(companyId: string, projectId?: string): Promise<{
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
    smartGapHistory(companyId: string, limit?: string, projectId?: string): Promise<{
        id: string;
        overallStatus: string;
        overallScore: number;
        evaluatedAt: Date;
    }[]>;
    runFitTest(workerId: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        testType?: string;
        testMethod?: string;
        result: FitTestResult;
        performedAt?: string;
        expiresAt?: string | null;
        notes?: string;
        evidenceFilesJson?: unknown;
        validityYears?: number;
        tenantId?: number;
    }): Promise<{
        run: import("../fit-test/fit-test.service").FitTestRunDto;
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
    }>;
    latestFitTest(workerId: string): Promise<{
        latest: import("../fit-test/fit-test.service").FitTestRunDto;
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
        readinessScore: number;
    }>;
    fitTestHistory(workerId: string): Promise<import("../fit-test/fit-test.service").FitTestRunDto[]>;
    exportFitTestPdf(workerId: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
