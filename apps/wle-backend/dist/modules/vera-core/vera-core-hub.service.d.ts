import { PrismaService } from '../../prisma/prisma.service';
import { CoreReadinessService } from './core-readiness.service';
import { EventBusMetricsService } from '../vera-event-bus/event-bus-metrics.service';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';
export type VeraCoreHubMetrics = {
    generatedAt: string;
    companyId: number | null;
    workers: number;
    verifiedTraining30d: number;
    openVerifications: number;
    readinessScore: number;
    readinessState: string;
    providerChannelsHealthy: number;
    providerChannelsTotal: number;
    eventBus: {
        emitted: number;
        published: number;
        dlq: number;
    };
};
export declare class VeraCoreHubService {
    private readonly prisma;
    private readonly readiness;
    private readonly eventMetrics;
    private readonly providerHub;
    constructor(prisma: PrismaService, readiness: CoreReadinessService, eventMetrics: EventBusMetricsService, providerHub: ProviderIntegrationHubService);
    getHubMetrics(companyId?: number, userId?: number): Promise<VeraCoreHubMetrics>;
    private extractReadinessScore;
    private extractReadinessState;
}
