import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusMetricsService } from '../modules/vera-event-bus/event-bus-metrics.service';

export type HealthCheckResult = {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: Record<string, { status: 'ok' | 'fail'; detail?: string }>;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventMetrics: EventBusMetricsService,
  ) {}

  liveness(): Omit<HealthCheckResult, 'checks'> & {
    checks: Record<string, never>;
  } {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.1',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks: {},
    };
  }

  async readiness(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      checks.database = { status: 'fail', detail: msg };
      this.logger.error(`Health DB check failed: ${msg}`);
    }

    const bus = this.eventMetrics.getSnapshot();
    checks.eventBus = {
      status: 'ok',
      detail: `emitted=${bus.emitted} published=${bus.published} dlq=${bus.dlq}`,
    };

    checks.nats = {
      status: process.env.NATS_URL ? 'ok' : 'ok',
      detail: process.env.NATS_URL ? 'configured' : 'not_configured',
    };

    checks.kafka = {
      status: 'ok',
      detail: process.env.KAFKA_BROKERS ? 'configured' : 'not_configured',
    };

    const failed = Object.values(checks).filter((c) => c.status === 'fail');
    return {
      status: failed.length > 0 ? 'down' : 'ok',
      version: process.env.npm_package_version ?? '0.0.1',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
