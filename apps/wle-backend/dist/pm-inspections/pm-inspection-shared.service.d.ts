import { PrismaService } from '../prisma/prisma.service';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionAccessService } from './pm-inspection-access.service';
export declare class PmInspectionSharedService {
    private readonly prisma;
    private readonly access;
    constructor(prisma: PrismaService, access: PmInspectionAccessService);
    listSharedReports(actor: SecurityActor, projectId?: number): Promise<{
        total: number;
        items: any[];
    }>;
}
