import { PrismaService } from '../../prisma/prisma.service';
export type FieldOfflineBundle = {
    syncedAt: string;
    worker: unknown | null;
    projectAssignments: unknown[];
    projects: unknown[];
    safetyForms: unknown[];
    credentials: unknown[];
    safetyFormDefinitions: unknown[];
    safetyFormTemplates: unknown[];
};
export declare class FieldOfflineBundleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    fetchBundle(params: {
        companyId?: number;
        workerId?: number;
    }): Promise<FieldOfflineBundle>;
    private fetchCredentials;
}
