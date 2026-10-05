import { FitTestResult, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FIT_TEST_DEFAULT_VALIDITY_YEARS } from './fit-test.engine';
import { AuditLogService } from '../../audit/audit-log.service';
export type FitTestRunDto = {
    id: number;
    workerId: number;
    tenantId: number | null;
    testType: string | null;
    testMethod: string | null;
    result: FitTestResult;
    performedAt: string;
    expiresAt: string | null;
    notes: string | null;
    evidenceFilesJson: unknown;
    createdById: number | null;
};
export declare class FitTestService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    evaluate(input: {
        result: FitTestResult;
        performedAt?: Date | string;
        expiresAt?: Date | string | null;
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
    listHistory(workerId: number): Promise<FitTestRunDto[]>;
    listForWorker(workerId: number): Promise<FitTestRunDto[]>;
    getLatest(workerId: number): Promise<{
        id: number;
        workerId: number;
        tenantId: number | null;
        testType: string | null;
        testMethod: string | null;
        result: import(".prisma/client").$Enums.FitTestResult;
        performedAt: Date;
        expiresAt: Date | null;
        notes: string | null;
        evidenceFilesJson: Prisma.JsonValue | null;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    run(workerId: number, data: {
        tenantId?: number;
        testType?: string;
        testMethod?: string;
        result: FitTestResult;
        performedAt?: Date;
        expiresAt?: Date | null;
        notes?: string;
        evidenceFilesJson?: Prisma.InputJsonValue;
        validityYears?: number;
        createdById?: number;
    }): Promise<{
        run: FitTestRunDto;
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
    }>;
    record(workerId: number, data: {
        companyId?: number;
        tenantId?: number;
        respiratorType?: string;
        testType?: string;
        testMethod?: string;
        outcome?: FitTestResult;
        result?: FitTestResult;
        testedAt?: Date;
        performedAt?: Date;
        nextDueAt?: Date | null;
        expiresAt?: Date | null;
        evidenceNotes?: string;
        notes?: string;
        evidenceFilesJson?: Prisma.InputJsonValue;
        validityYears?: number;
        createdByUserId?: number;
        createdById?: number;
    }): Promise<{
        record: FitTestRunDto;
        evaluation: {
            expiresAt: string;
            pass: boolean;
            statusLabel: "PASS" | "FAIL" | "CONDITIONAL" | "EXPIRED";
            daysUntilExpiry: number | null;
            expired: boolean;
            expiringSoon: boolean;
        };
    }>;
    summary(workerId: number): Promise<{
        latest: FitTestRunDto;
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
    companySummary(companyId: number): Promise<{
        totalWorkers: number;
        current: number;
        expired: number;
        expiring30: number;
        missing: number;
        failed: number;
        complianceRate: number;
    }>;
    exportPdf(workerId: number): Promise<Buffer>;
    private toDto;
}
export { FIT_TEST_DEFAULT_VALIDITY_YEARS };
