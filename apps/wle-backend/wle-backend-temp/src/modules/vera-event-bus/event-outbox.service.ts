import { Injectable, Logger, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import {
  eventOutboxDelegate,
  type EventOutboxRow,
} from './event-outbox.prisma';
import {
  natsSubjectForEvent,
  partitionKeyForEvent,
  topicForEvent,
} from './topics';
import { DEFAULT_PUBLISH_RETRY } from './event-retry.policy';
import { EventBusMetricsService } from './event-bus-metrics.service';

@Injectable()
export class EventOutboxService {
  private readonly logger = new Logger(EventOutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly metrics?: EventBusMetricsService,
  ) {}

  async enqueue(
    event: DomainEventPayload,
    options?: { idempotencyKey?: string },
  ): Promise<EventOutboxRow | null> {
    try {
      const row = await eventOutboxDelegate(this.prisma).create({
        data: {
          id: randomUUID(),
          eventName: event.name,
          topic: topicForEvent(event.name),
          natsSubject: natsSubjectForEvent(event.name),
          partitionKey: partitionKeyForEvent(event),
          payload: event,
          status: 'PENDING',
          attempts: 0,
          maxAttempts: DEFAULT_PUBLISH_RETRY.maxAttempts,
          idempotencyKey: options?.idempotencyKey ?? null,
        },
      });
      this.metrics?.recordEnqueued();
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Unique constraint') && options?.idempotencyKey) {
        this.logger.debug(`Outbox dedupe skip: ${options.idempotencyKey}`);
        return null;
      }
      this.logger.warn(`Outbox enqueue failed: ${msg}`);
      return null;
    }
  }

  async claimBatch(limit = 50): Promise<EventOutboxRow[]> {
    const due = await eventOutboxDelegate(this.prisma).findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    if (due.length === 0) return [];

    await eventOutboxDelegate(this.prisma).updateMany({
      where: {
        id: { in: due.map((r) => r.id) },
        status: { in: ['PENDING', 'FAILED'] },
      },
      data: { status: 'PUBLISHING' },
    });

    return due;
  }

  async markPublished(id: string): Promise<void> {
    await eventOutboxDelegate(this.prisma).update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        lastError: null,
      },
    });
    this.metrics?.recordPublished();
  }

  async markFailed(
    row: EventOutboxRow,
    error: string,
    nextRetryAt: Date | null,
  ): Promise<'retry' | 'dlq'> {
    const attempts = row.attempts + 1;
    if (attempts >= row.maxAttempts || nextRetryAt == null) {
      await eventOutboxDelegate(this.prisma).update({
        where: { id: row.id },
        data: {
          status: 'DLQ',
          attempts,
          lastError: error,
        },
      });
      this.metrics?.recordPublishFailed();
      return 'dlq';
    }

    await eventOutboxDelegate(this.prisma).update({
      where: { id: row.id },
      data: {
        status: 'FAILED',
        attempts,
        lastError: error,
        nextRetryAt,
      },
    });
    this.metrics?.recordPublishFailed();
    return 'retry';
  }
}
