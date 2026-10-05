import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';
export declare class ComplianceRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    trainingExpiryCounts(companyId?: number): Promise<{
        expired: number;
        expiring30: number;
    }>;
}
