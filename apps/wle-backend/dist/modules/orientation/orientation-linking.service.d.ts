import { PrismaService } from '../../prisma/prisma.service';
export declare class OrientationLinkingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    linkWorkersForPackage(packageId: string): Promise<number>;
    onCompanyLinkCreated(workerId: number, companyId: number): Promise<void>;
    onProjectAssignment(workerId: number, projectId: number): Promise<void>;
    private upsertWorkerProgress;
    private resolveEligibleWorkerIds;
}
