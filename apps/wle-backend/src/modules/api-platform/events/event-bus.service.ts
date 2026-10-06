import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { DomainEventPayload } from './domain-events';
import type { EventOutboxService } from '../../vera-event-bus/event-outbox.service';
import type { EventBusMetricsService } from '../../vera-event-bus/event-bus-metrics.service';

@Injectable()
export class EventBusService {
  private readonly emitter = new EventEmitter();
  private readonly logger = new Logger(EventBusService.name);
  private outbox: EventOutboxService | null = null;
  private metrics: EventBusMetricsService | null = null;

  /** Late-bound by VeraEventBusModule to avoid circular DI. */
  bindOutbox(
    outbox: EventOutboxService,
    metrics?: EventBusMetricsService,
  ): void {
    this.outbox = outbox;
    this.metrics = metrics ?? null;
  }

  emit(event: DomainEventPayload): void {
    this.metrics?.recordEmit(event.name);
    this.logger.debug(
      JSON.stringify({
        type: 'event_bus.emit',
        name: event.name,
        entityType: event.entityType,
        entityId: event.entityId,
        companyId: event.companyId,
      }),
    );

    if (process.env.VERA_EVENT_OUTBOX !== '0' && this.outbox) {
      const idempotencyKey =
        typeof event.data?.idempotencyKey === 'string'
          ? event.data.idempotencyKey
          : undefined;
      void this.outbox.enqueue(event, { idempotencyKey });
    }

    this.emitter.emit(event.name, event);
    this.emitter.emit('*', event);
  }

  on(eventName: string, handler: (payload: DomainEventPayload) => void): void {
    this.emitter.on(eventName, handler);
  }

  off(eventName: string, handler: (payload: DomainEventPayload) => void): void {
    this.emitter.off(eventName, handler);
  }
}
