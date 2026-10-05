import type { DomainEventPayload } from './domain-events';
import type { EventOutboxService } from '../../vera-event-bus/event-outbox.service';
import type { EventBusMetricsService } from '../../vera-event-bus/event-bus-metrics.service';
export declare class EventBusService {
    private readonly emitter;
    private readonly logger;
    private outbox;
    private metrics;
    bindOutbox(outbox: EventOutboxService, metrics?: EventBusMetricsService): void;
    emit(event: DomainEventPayload): void;
    on(eventName: string, handler: (payload: DomainEventPayload) => void): void;
    off(eventName: string, handler: (payload: DomainEventPayload) => void): void;
}
