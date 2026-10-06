import { Injectable, Logger } from '@nestjs/common';

export type EventBusMetricSnapshot = {
  emitted: number;
  enqueued: number;
  published: number;
  publishFailed: number;
  dlq: number;
  consumerErrors: number;
  byEvent: Record<string, number>;
  startedAt: string;
  updatedAt: string;
};

@Injectable()
export class EventBusMetricsService {
  private readonly logger = new Logger(EventBusMetricsService.name);
  private snapshot: EventBusMetricSnapshot = {
    emitted: 0,
    enqueued: 0,
    published: 0,
    publishFailed: 0,
    dlq: 0,
    consumerErrors: 0,
    byEvent: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  recordEmit(eventName: string): void {
    this.snapshot.emitted += 1;
    this.snapshot.byEvent[eventName] =
      (this.snapshot.byEvent[eventName] ?? 0) + 1;
    this.touch();
  }

  recordEnqueued(): void {
    this.snapshot.enqueued += 1;
    this.touch();
  }

  recordPublished(count = 1): void {
    this.snapshot.published += count;
    this.touch();
  }

  recordPublishFailed(): void {
    this.snapshot.publishFailed += 1;
    this.touch();
  }

  recordDlq(): void {
    this.snapshot.dlq += 1;
    this.touch();
  }

  recordConsumerError(): void {
    this.snapshot.consumerErrors += 1;
    this.touch();
  }

  getSnapshot(): EventBusMetricSnapshot {
    return {
      ...this.snapshot,
      byEvent: { ...this.snapshot.byEvent },
    };
  }

  /** Hook for external monitoring (Datadog, Prometheus sidecar, etc.). */
  emitMonitoringHeartbeat(): void {
    const s = this.getSnapshot();
    const deliveryRate = s.emitted > 0 ? s.published / s.emitted : 1;
    const failureRate = s.emitted > 0 ? s.publishFailed / s.emitted : 0;
    this.logger.log(
      JSON.stringify({
        type: 'event_bus.metrics',
        ...s,
        deliveryRate,
        failureRate,
        transports: {
          nats: Boolean(process.env.NATS_URL),
          kafka: Boolean(process.env.KAFKA_BROKERS),
        },
      }),
    );
  }

  private touch() {
    this.snapshot.updatedAt = new Date().toISOString();
  }
}
