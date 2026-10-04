import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { runWithRetry } from './event-subscriber.base';

@Injectable()
export class UnionHallSubscriber implements OnModuleInit {
  private readonly logger = new Logger(UnionHallSubscriber.name);

  constructor(
    private readonly bus: EventBusService,
    @Optional() private readonly metrics?: EventBusMetricsService,
  ) {}

  onModuleInit(): void {
    for (const name of [
      DomainEvent.UNION_HALL_ROSTER_UPDATE,
      DomainEvent.UNION_TRAINING_PUSHED,
      DomainEvent.UNION_DISPATCH,
    ]) {
      this.bus.on(name, (event) => {
        void runWithRetry(
          this.logger,
          this.metrics,
          'UnionHallSubscriber',
          event,
          async (e) => this.handle(e),
        );
      });
    }
  }

  private async handle(
    event: import('../../api-platform/events/domain-events').DomainEventPayload,
  ): Promise<void> {
    this.logger.log(
      JSON.stringify({
        type: 'flow.union_hall',
        event: event.name,
        unionHallId: event.data?.unionHallId,
        workerId: event.data?.workerId,
        trainingRecordId: event.data?.trainingRecordId,
      }),
    );
  }
}
