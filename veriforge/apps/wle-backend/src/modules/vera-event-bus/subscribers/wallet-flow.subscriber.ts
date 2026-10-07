import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { VeraCoreFlowHandler } from '../vera-core-flow.handler';
import { runWithRetry } from './event-subscriber.base';

@Injectable()
export class WalletFlowSubscriber implements OnModuleInit {
  private readonly logger = new Logger(WalletFlowSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly flow: VeraCoreFlowHandler,
    @Optional() private readonly metrics?: EventBusMetricsService,
  ) {}

  onModuleInit(): void {
    for (const name of [
      DomainEvent.WALLET_UPDATED,
      DomainEvent.WALLET_SYNCED,
      DomainEvent.WALLET_BUNDLE_SYNCED,
    ]) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'WalletFlowSubscriber',
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
