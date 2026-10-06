import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import type { DomainEventPayload } from '../../api-platform/events/domain-events';
import { DomainEvent } from '../../api-platform/events/domain-events';

@Injectable()
export class VisionEventHandler implements OnModuleInit {
  private readonly logger = new Logger(VisionEventHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit(): void {
    this.eventBus.on(DomainEvent.TRAINING_UPLOADED, (p) =>
      this.onDocument(p, 'training_certificate'),
    );
    this.eventBus.on(DomainEvent.INSPECTION_COMPLETED, (p) =>
      this.onDocument(p, 'inspection_form'),
    );
  }

  private onDocument(payload: DomainEventPayload, type: string): void {
    this.logger.debug(`Vision queue: ${type} entity=${payload.entityId}`);
    // Hook for async OCR jobs when upload pipeline emits text/metadata in payload.data
  }
}
