import { PrismaService } from '../../prisma/prisma.service';
export type OrientationAccessResult = {
    allowed: boolean;
    blockingPackages: Array<{
        packageId: string;
        title: string;
        status: string;
        requiredVersion: number;
    }>;
};
export declare class OrientationAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertWorkerCanAccessProject(workerId: number, projectId: number): Promise<OrientationAccessResult>;
    assertWorkerCanBeAssigned(workerId: number, projectId: number): Promise<void>;
    evaluateWorker(workerId: number, scope: {
        companyId?: number;
        projectId?: number;
    }): Promise<OrientationAccessResult>;
    resolveWorkerIdForUser(userId: number): Promise<number | null>;
    private pendingForWorker;
    private publicStatus;
}
