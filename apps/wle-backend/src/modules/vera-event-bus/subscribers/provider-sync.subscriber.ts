import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { VeraCoreFlowHandler } from '../vera-core-flow.handler';
import { runWithRetry } from './event-subscriber.base';

@Injectable()
export class ProviderSyncSubscriber implements OnModuleInit {
  private readonly logger = new Logger(ProviderSyncSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly flow: VeraCoreFlowHandler,
    @Optional() private readonly metrics?: EventBusMetricsService,
  ) {}

  onModuleInit(): void {
    for (const name of [
      DomainEvent.PROVIDER_SYNC_EVENT,
      DomainEvent.PROVIDER_SYNC_COMPLETED,
      DomainEvent.PROVIDER_SYNC_FAILED,
      DomainEvent.PROVIDER_COMPLETION_RECEIVED,
    ]) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'ProviderSyncSubscriber',
          event,
          async (e) => this.handle(e),
        );
      });
    }
  }

  private async handle(
    event: import('../../api-platform/events/domain-events').DomainEventPayload,
  ): Promise<void> {
    await this.flow.handle(event);
  }
}
