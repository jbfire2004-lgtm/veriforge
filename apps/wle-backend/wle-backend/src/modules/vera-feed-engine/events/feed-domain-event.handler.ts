import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import {
  DomainEvent,
  type DomainEventPayload,
} from '../../api-platform/events/domain-events';
import { FeedRealtimeGateway } from '../feed-realtime.gateway';
import { VeraCoreFeedService } from '../vera-core-feed.service';

const FEED_EVENT_NAMES: string[] = [
  DomainEvent.TRAINING_UPLOADED,
  DomainEvent.TRAINING_VALIDATED,
  DomainEvent.PROJECT_ASSIGNED,
  DomainEvent.PROJECT_CLOSED,
  DomainEvent.EQUIPMENT_CREATED,
  DomainEvent.EQUIPMENT_UPDATED,
  DomainEvent.COMPLIANCE_RECALC,
];

@Injectable()
export class FeedDomainEventHandler implements OnModuleInit {
  private readonly logger = new Logger(FeedDomainEventHandler.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly veraCoreFeed: VeraCoreFeedService,
    private readonly realtime: FeedRealtimeGateway,
  ) {}

  onModuleInit(): void {
    for (const name of FEED_EVENT_NAMES) {
      this.bus.on(name, (payload) => {
        void this.onEvent(payload);
      });
    }
    this.logger.log(
      `Listening for Vera Core feed events: ${FEED_EVENT_NAMES.join(', ')}`,
    );
  }

  private async onEvent(payload: DomainEventPayload): Promise<void> {
    const feedItemId = await this.veraCoreFeed.handleDomainEvent(payload);
    if (feedItemId) {
      this.realtime.broadcastAll({
        type: 'feed.item.created',
        feedItemId,
        payload: {
          source: payload.name,
          entityType: payload.entityType,
          entityId: payload.entityId,
        },
      });
    }
  }
}
