import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  eventDeadLetterDelegate,
  type EventOutboxRow,
} from './event-outbox.prisma';
import { EventBusMetricsService } from './event-bus-metrics.service';

@Injectable()
export class EventDlqService {
  private readonly logger = new Logger(EventDlqService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: EventBusMetricsService,
  ) {}

  async moveFromOutbox(
    row: EventOutboxRow,
    errorMessage: string,
    consumerGroup?: string,
  ): Promise<void> {
    await eventDeadLetterDelegate(this.prisma).create({
      data: {
        id: randomUUID(),
        outboxId: row.id,
        eventName: row.eventName,
        topic: row.topic,
        payload: row.payload,
        errorMessage,
        attempts: row.attempts,
        consumerGroup: consumerGroup ?? 'publisher',
      },
    });
    this.metrics.recordDlq();
    this.logger.warn(
      JSON.stringify({
        type: 'event_bus.dlq',
        outboxId: row.id,
        eventName: row.eventName,
        error: errorMessage,
      }),
    );
  }

  async listRecent(limit = 50) {
    return eventDeadLetterDelegate(this.prisma).findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
