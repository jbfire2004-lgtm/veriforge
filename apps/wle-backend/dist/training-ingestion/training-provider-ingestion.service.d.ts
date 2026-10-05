import { PrismaService } from '../prisma/prisma.service';
import type { ProviderIngestResult } from './pipeline/types';
import { TrainingIngestionService } from './training-ingestion.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
export declare class TrainingProviderIngestionService {
    private readonly prisma;
    private readonly ingestion;
    private readonly monitoring;
    private readonly logger;
    constructor(prisma: PrismaService, ingestion: TrainingIngestionService, monitoring: Phase1MonitoringService);
    assertHmacSignature(secret: string, rawBody: string, signatureHeader?: string): void;
    ingestFromProvider(providerId: number, body: unknown, options?: {
        signature?: string;
        rawBody?: string;
    }): Promise<ProviderIngestResult>;
    private mapCompletionsToRows;
    private resolveWorkerId;
}
