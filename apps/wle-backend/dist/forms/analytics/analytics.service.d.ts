import { PrismaService } from '../../prisma/prisma.service';
export declare class SafetyFormAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dashboard(companyId?: number): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        byDefinition: {
            [k: string]: number;
        };
        sifCount: number;
        hecaCount: number;
        openCorrectiveActions: number;
    }>;
    leadingLagging(companyId?: number): Promise<{
        indicators: {
            submittedAt: Date;
            definitionId: string;
            formData: import(".prisma/client").Prisma.JsonValue;
        }[];
    }>;
}
