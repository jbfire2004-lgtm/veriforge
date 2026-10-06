import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventBusService } from '../api-platform/events/event-bus.service';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { AdoptionEventService } from './adoption-event.service';
import { ADOPTION_EVENT_TYPES } from './adoption-analytics.constants';

/**
 * Subscribes to domain events and forwards to the adoption analytics queue.
 */
@Injectable()
export class AdoptionTrackingBridge implements OnModuleInit {
  private readonly logger = new Logger(AdoptionTrackingBridge.name);

  constructor(
    private readonly adoption: AdoptionEventService,
    @Optional() private readonly bus?: EventBusService,
  ) {}

  onModuleInit(): void {
    if (!this.bus) return;
    this.bus.on('*', (payload: DomainEventPayload) => {
      try {
        this.handleDomainEvent(payload);
      } catch (err) {
        this.logger.debug('Adoption bridge skipped event', err);
      }
    });
  }

  private handleDomainEvent(payload: DomainEventPayload): void {
    if (!payload.companyId) return;
    const name = payload.name ?? '';
    if (name.includes('project') && name.includes('creat')) {
      this.adoption.track({
        companyId: payload.companyId,
        event: ADOPTION_EVENT_TYPES.PROJECT_CREATED,
        metadata: { projectId: payload.projectId },
      });
    }
  }
}
