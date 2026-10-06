import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../modules/api-platform/events/event-bus.service';
import {
  DomainEvent,
  type DomainEventPayload,
} from '../../modules/api-platform/events/domain-events';
import { VsiDashboardRevisionService } from './vsi-dashboard-revision.service';

const VSI_EVENTS: string[] = [
  DomainEvent.CAIL_CREATED,
  DomainEvent.CAIL_ASSIGNED,
  DomainEvent.CAIL_RESOLVED,
  DomainEvent.CAIL_VERIFIED,
  DomainEvent.CAIL_OVERDUE,
  DomainEvent.LESSON_LEARNED_PUBLISHED,
  DomainEvent.VSI_DASHBOARD_INVALIDATE,
];

@Injectable()
export class VsiDomainEventHandler implements OnModuleInit {
  private readonly logger = new Logger(VsiDomainEventHandler.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly revisions: VsiDashboardRevisionService,
  ) {}

  onModuleInit() {
    for (const name of VSI_EVENTS) {
      this.bus.on(name, (payload) => this.onEvent(payload));
    }
    this.logger.log(
      `VSI dashboard revision listener: ${VSI_EVENTS.length} events`,
    );
  }

  private onEvent(payload: DomainEventPayload) {
    if (payload.projectId == null) return;
    const revision = this.revisions.bump(payload.projectId);
    this.logger.debug(
      `Dashboard revision ${revision} for project ${payload.projectId} (${payload.name})`,
    );
  }
}
