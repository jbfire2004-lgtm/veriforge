import { Injectable, Logger } from '@nestjs/common';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { EventOutboxService } from './event-outbox.service';
import { EventDlqService } from './event-dlq.service';
import { NatsEventTransport } from './transport/nats.transport';
import { KafkaEventTransport } from './transport/kafka.transport';
import type { EventTransport } from './transport/event-transport.interface';
import { DEFAULT_PUBLISH_RETRY, nextRetryAt } from './event-retry.policy';
import { partitionKeyForEvent } from './topics';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private readonly transports: EventTransport[];

  constructor(
    private readonly outbox: EventOutboxService,
    private readonly dlq: EventDlqService,
    nats: NatsEventTransport,
    kafka: KafkaEventTransport,
  ) {
    this.transports = [nats, kafka].filter((t) => t.isEnabled());
  }

  async publishPendingBatch(): Promise<{
    published: number;
    failed: number;
    dlq: number;
  }> {
    const batch = await this.outbox.claimBatch();
    let published = 0;
    let failed = 0;
    let dlqCount = 0;

    for (const row of batch) {
      const event = row.payload as DomainEventPayload;
      try {
        if (this.transports.length === 0) {
          await this.outbox.markPublished(row.id);
          published += 1;
          continue;
        }

        for (const transport of this.transports) {
          await transport.publish({
            outboxId: row.id,
            topic: row.topic,
            natsSubject: row.natsSubject,
            partitionKey: row.partitionKey ?? partitionKeyForEvent(event),
            event,
          });
        }
        await this.outbox.markPublished(row.id);
        published += 1;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const retryAt = nextRetryAt(row.attempts + 1, DEFAULT_PUBLISH_RETRY);
        const outcome = await this.outbox.markFailed(row, msg, retryAt);
        if (outcome === 'dlq') {
          await this.dlq.moveFromOutbox(row, msg, 'publisher');
          dlqCount += 1;
        } else {
          failed += 1;
        }
        this.logger.warn(`Publish failed outbox=${row.id}: ${msg}`);
      }
    }

    return { published, failed, dlq: dlqCount };
  }
}
