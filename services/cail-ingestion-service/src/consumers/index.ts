import { domainEventConsumer } from './domain-event.consumer';
import { ingestService } from '../services/ingest.service';

/** Wire all domain event subscriptions to the ingestion pipeline. */
export function registerEventConsumers(): void {
  const handler = async (event: Parameters<typeof ingestService.ingestEvent>[0]) => {
    await ingestService.ingestEvent(event);
  };

  domainEventConsumer.registerWildcard(handler);
}

export { domainEventConsumer } from './domain-event.consumer';
