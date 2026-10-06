import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { VeraCoreFlowHandler } from '../vera-core-flow.handler';
import { runWithRetry } from './event-subscriber.base';

/**
 * Training verification flow — mirrors canonical events for downstream systems.
 */
@Injectable()
export class TrainingFlowSubscriber implements OnModuleInit {
  private readonly logger = new Logger(TrainingFlowSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly flow: VeraCoreFlowHandler,
    @Optional() private readonly metrics?: EventBusMetricsService,
  ) {}

  onModuleInit(): void {
    const events = [
      DomainEvent.WORKER_TRAINING_COMPLETED,
      DomainEvent.TRAINING_VERIFIED,
      DomainEvent.TRAINING_CREDENTIAL_MINTED,
      DomainEvent.TRAINING_VERIFICATION_RUN,
    ];

    for (const name of events) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'TrainingFlowSubscriber',
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
