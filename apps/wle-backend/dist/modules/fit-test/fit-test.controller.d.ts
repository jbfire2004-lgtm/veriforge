import type { Response } from 'express';
import { FitTestResult } from '@prisma/client';
import { FitTestService } from './fit-test.service';
export declare class FitTestController {
    private readonly fitTests;
    constructor(fitTests: FitTestService);
    evaluate(body: {
        result?: FitTestResult;
        outcome?: FitTestResult;
        performedAt?: string;
        testedAt?: string;
        expiresAt?: string | null;
        nextDueAt?: string | null;
        validityYears?: number;
    }): {
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
        validityYears: number;
    };
    list(workerId: string): Promise<import("./fit-test.service").FitTestRunDto[]>;
    latest(workerId: string): Promise<{
        latest: import("./fit-test.service").FitTestRunDto;
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
    exportPdf(workerId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    companySummary(companyId: string): Promise<{
        totalWorkers: number;
        current: number;
        expired: number;
        expiring30: number;
        missing: number;
        failed: number;
        complianceRate: number;
    }>;
    record(workerId: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        testType?: string;
        respiratorType?: string;
        testMethod?: string;
        result?: FitTestResult;
        outcome?: FitTestResult;
        performedAt?: string;
        testedAt?: string;
        expiresAt?: string | null;
        nextDueAt?: string | null;
        notes?: string;
        evidenceNotes?: string;
        evidenceFilesJson?: unknown;
        validityYears?: number;
        tenantId?: number;
        companyId?: number;
    }): Promise<{
        run: import("./fit-test.service").FitTestRunDto;
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
    }>;
}
