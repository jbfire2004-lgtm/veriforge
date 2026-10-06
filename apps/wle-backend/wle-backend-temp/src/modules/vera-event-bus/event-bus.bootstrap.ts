import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { EventOutboxService } from './event-outbox.service';
import { EventBusMetricsService } from './event-bus-metrics.service';

@Injectable()
export class EventBusBootstrap implements OnModuleInit {
  constructor(
    private readonly bus: EventBusService,
    private readonly outbox: EventOutboxService,
    private readonly metrics: EventBusMetricsService,
  ) {}

  onModuleInit(): void {
    this.bus.bindOutbox(this.outbox, this.metrics);
  }
}
