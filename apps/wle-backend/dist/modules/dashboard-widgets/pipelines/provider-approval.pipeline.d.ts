import { PrismaService } from '../../../prisma/prisma.service';
import type { ProviderApprovalWidgetData } from '../dashboard-widgets.types';
export declare class ProviderApprovalPipeline {
    private readonly prisma;
    constructor(prisma: PrismaService);
    run(): Promise<ProviderApprovalWidgetData>;
}
