import { Logger } from '@nestjs/common';
import type { DomainEventPayload } from '../../api-platform/events/domain-events';
import { EventBusMetricsService } from '../event-bus-metrics.service';
import { DEFAULT_CONSUMER_RETRY, nextRetryAt } from '../event-retry.policy';

export type SubscriberHandler = (event: DomainEventPayload) => Promise<void>;

export async function runWithRetry(
  logger: Logger,
  metrics: EventBusMetricsService | undefined,
  handlerName: string,
  event: DomainEventPayload,
  handler: SubscriberHandler,
): Promise<void> {
  let lastError: Error | null = null;
  for (
    let attempt = 1;
    attempt <= DEFAULT_CONSUMER_RETRY.maxAttempts;
    attempt++
  ) {
    try {
      await handler(event);
      return;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      metrics?.recordConsumerError();
      if (attempt < DEFAULT_CONSUMER_RETRY.maxAttempts) {
        const wait =
          nextRetryAt(attempt, DEFAULT_CONSUMER_RETRY).getTime() - Date.now();
        await new Promise((r) => setTimeout(r, Math.max(0, wait)));
      }
    }
  }
  logger.error(
    JSON.stringify({
      type: 'event_bus.subscriber.failed',
      handler: handlerName,
      event: event.name,
      entityId: event.entityId,
      error: lastError?.message,
    }),
  );
}
