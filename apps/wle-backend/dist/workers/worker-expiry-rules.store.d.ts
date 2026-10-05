import { PrismaService } from '../prisma/prisma.service';
export type WorkerExpiryRules = {
    orientationExpiryDays: number;
    certificationExpiryDays: number;
    notSeenDays: number;
    autoDeactivate: boolean;
    autoNotify: boolean;
};
export declare const DEFAULT_WORKER_EXPIRY_RULES: WorkerExpiryRules;
export declare class WorkerExpiryRulesStore {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRules(companyId: number): Promise<WorkerExpiryRules>;
    saveRules(companyId: number, patch: Partial<WorkerExpiryRules>): Promise<WorkerExpiryRules>;
}
