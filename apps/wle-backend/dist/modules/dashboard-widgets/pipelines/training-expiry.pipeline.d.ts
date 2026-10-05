import { PrismaService } from '../../../prisma/prisma.service';
import type { TrainingExpiryWidgetData } from '../dashboard-widgets.types';
export declare class TrainingExpiryPipeline {
    private readonly prisma;
    constructor(prisma: PrismaService);
    run(companyId?: number): Promise<TrainingExpiryWidgetData>;
}
