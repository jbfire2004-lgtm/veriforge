import { PrismaService } from '../../prisma/prisma.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';
export declare class PredictiveRiskScheduler {
    private readonly prisma;
    private readonly predictive;
    private readonly logger;
    private running;
    constructor(prisma: PrismaService, predictive: PredictiveRiskService);
    computeProjectSnapshots(): Promise<void>;
}
