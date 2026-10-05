import { PrismaService } from '../prisma/prisma.service';
import { TrainingProviderCertificateService } from '../modules/training-provider-core/training-provider-certificate.service';
import type { QrIngestResult } from './pipeline/types';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
export declare class TrainingQrIngestionService {
    private readonly prisma;
    private readonly certificates;
    private readonly monitoring;
    private readonly logger;
    constructor(prisma: PrismaService, certificates: TrainingProviderCertificateService, monitoring: Phase1MonitoringService);
    ingestFromQr(companyId: number, workerId: number, qrPayload: string): Promise<QrIngestResult>;
    private logStep;
}
