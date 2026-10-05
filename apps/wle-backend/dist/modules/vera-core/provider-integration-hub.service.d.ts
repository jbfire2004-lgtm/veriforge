import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import type { ProviderIntegrationHubSummary } from './provider-integration-hub.types';
export declare class ProviderIntegrationHubService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventBusService);
    getSummary(companyId: number): Promise<ProviderIntegrationHubSummary>;
    private unionHallChannelHealth;
    private channelHealth;
}
