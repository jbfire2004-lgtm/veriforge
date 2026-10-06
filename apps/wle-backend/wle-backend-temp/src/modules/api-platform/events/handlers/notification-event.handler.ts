import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { DomainEvent, type DomainEventPayload } from '../domain-events';

@Injectable()
export class NotificationEventHandler implements OnModuleInit {
  private readonly logger = new Logger(NotificationEventHandler.name);

  constructor(private readonly bus: EventBusService) {}

  onModuleInit() {
    this.bus.on(DomainEvent.INSPECTION_COMPLETED, (p) =>
      this.notify('Inspection completed', p),
    );
    this.bus.on(DomainEvent.TRAINING_UPLOADED, (p) =>
      this.notify('Training uploaded', p),
    );
    this.bus.on(DomainEvent.PROVIDER_APPROVED, (p) =>
      this.notify('Provider approved', p),
    );
  }

  private notify(title: string, payload: DomainEventPayload) {
    this.logger.log(`${title} — ${payload.entityType}:${payload.entityId}`);
    // NotificationEngine integration point
  }
}
