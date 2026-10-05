import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { EventBusMetricsService } from './event-bus-metrics.service';
import { EventDlqService } from './event-dlq.service';
import { DOMAIN_EVENT_TOPIC_MAP, VeraEventTopic } from './topics';
import { DomainEvent } from '../api-platform/events/domain-events';

@Controller(`${API_V1_PREFIX}/event-bus`)
export class EventBusController {
  constructor(
    private readonly metrics: EventBusMetricsService,
    private readonly dlq: EventDlqService,
  ) {}

  @Get('health')
  health() {
    return {
      ok: true,
      transports: {
        nats: Boolean(process.env.NATS_URL),
        kafka: Boolean(process.env.KAFKA_BROKERS),
      },
      outboxEnabled: process.env.VERA_EVENT_OUTBOX !== '0',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('metrics')
  metricsSnapshot() {
    return this.metrics.getSnapshot();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('topics')
  topics() {
    return {
      topics: VeraEventTopic,
      map: DOMAIN_EVENT_TOPIC_MAP,
      events: DomainEvent,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('dlq')
  async deadLetters() {
    const rows = await this.dlq.listRecent(100);
    return { count: rows.length, rows };
  }
}
