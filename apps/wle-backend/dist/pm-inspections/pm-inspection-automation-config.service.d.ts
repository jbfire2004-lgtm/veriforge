import { PrismaService } from '../prisma/prisma.service';
export declare class PmInspectionAutomationConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    isAutoFailureMeetingEnabled(companyId: number): Promise<boolean>;
    private isTenantFeatureEnabled;
}
