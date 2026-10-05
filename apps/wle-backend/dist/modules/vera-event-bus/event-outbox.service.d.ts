import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import { type EventOutboxRow } from './event-outbox.prisma';
import { EventBusMetricsService } from './event-bus-metrics.service';
export declare class EventOutboxService {
    private readonly prisma;
    private readonly metrics?;
    private readonly logger;
    constructor(prisma: PrismaService, metrics?: EventBusMetricsService);
    enqueue(event: DomainEventPayload, options?: {
        idempotencyKey?: string;
    }): Promise<EventOutboxRow | null>;
    claimBatch(limit?: number): Promise<EventOutboxRow[]>;
    markPublished(id: string): Promise<void>;
    markFailed(row: EventOutboxRow, error: string, nextRetryAt: Date | null): Promise<'retry' | 'dlq'>;
}
