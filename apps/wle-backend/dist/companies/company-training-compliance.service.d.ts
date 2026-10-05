import { TrainingValidationOutcome } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CompanyActor } from './companies.service';
export type TrainingComplianceBucket = 'verified' | 'pending' | 'rejected' | 'expiring';
export type WorkerComplianceFlag = 'NON_COMPLIANT' | 'EXPIRING_TRAINING' | 'INVALID_TRAINING';
export type TrainingComplianceRow = {
    trainingRecordId: number;
    workerId: number;
    workerName: string;
    courseName: string;
    providerName: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
    validationOutcome: TrainingValidationOutcome | null;
    projectId: number | null;
    projectName: string | null;
};
export type FlaggedWorkerRow = {
    workerId: number;
    firstName: string;
    lastName: string;
    flags: WorkerComplianceFlag[];
};
export type TrainingComplianceCounts = {
    verified: number;
    pending: number;
    rejected: number;
    expiring: number;
};
export type ProjectTrainingComplianceSummary = {
    projectId: number;
    projectName: string;
    counts: TrainingComplianceCounts;
    flaggedWorkerCount: number;
};
export type CompanyTrainingComplianceDashboard = {
    companyId: number;
    companyName: string;
    updatedAt: string;
    counts: TrainingComplianceCounts;
    records: Record<TrainingComplianceBucket, TrainingComplianceRow[]>;
    flaggedWorkers: FlaggedWorkerRow[];
    projects: ProjectTrainingComplianceSummary[];
    status: 'COMPLIANT' | 'NON_COMPLIANT';
};
export declare class CompanyTrainingComplianceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    refreshAfterTrainingRecord(trainingRecordId: number): Promise<void>;
    getCompanyDashboard(companyId: number, actor?: CompanyActor): Promise<CompanyTrainingComplianceDashboard>;
    getProjectDashboard(companyId: number, projectId: number, actor?: CompanyActor): Promise<{
        projectId: number;
        projectName: string;
        companyId: number;
        updatedAt: string;
        counts: TrainingComplianceCounts;
        records: Record<TrainingComplianceBucket, TrainingComplianceRow[]>;
        flaggedWorkers: FlaggedWorkerRow[];
    }>;
    private refreshCompanyWorkerFlags;
    private loadCompanyTrainingRecords;
    private latestValidationsByRecord;
    private bucketRecords;
    private buildFlaggedWorkers;
    private buildProjectSummaries;
    private toRow;
    private assertCompanyAccess;
}
