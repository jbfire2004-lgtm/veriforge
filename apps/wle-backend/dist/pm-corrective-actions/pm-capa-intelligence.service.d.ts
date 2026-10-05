import { PrismaService } from '../prisma/prisma.service';
export declare class PmCapaIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    projectForecast(projectId: number): Promise<{
        openCount: number;
        overdueRisk: number;
        averagePriority: number;
        predictedEscalations: number;
        crossFormCorrelation: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmCorrectiveActionGroupByOutputType, "sourceModule"[]> & {
            _count: number;
        })[];
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
}
