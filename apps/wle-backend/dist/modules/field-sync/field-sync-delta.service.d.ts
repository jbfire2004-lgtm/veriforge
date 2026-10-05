import { PrismaService } from '../../prisma/prisma.service';
export type FieldDeltaTombstone = {
    type: 'task' | 'workPackage';
    id: string;
    deletedAt: string;
};
export type WorkerWalletSnapshot = {
    workerId: number;
    verifiedCount: number;
    expiringSoon: number;
    expired: number;
    readinessScore: number | null;
    lastSyncedAt: string;
};
export type FieldDeltaBundle = {
    syncedAt: string;
    since: string | null;
    workers: unknown[];
    equipment: unknown[];
    projects: unknown[];
    trainingRecords: unknown[];
    inspections: unknown[];
    safetyForms: unknown[];
    workPackages: unknown[];
    tasks: unknown[];
    safetyFormDefinitions: unknown[];
    workerWalletSnapshots: WorkerWalletSnapshot[];
    deleted: FieldDeltaTombstone[];
    versions: Record<string, number>;
};
export declare class FieldSyncDeltaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    fetchDelta(params: {
        companyId?: number;
        since?: Date;
    }): Promise<FieldDeltaBundle>;
    private buildWalletSnapshots;
    private fetchWorkers;
}
