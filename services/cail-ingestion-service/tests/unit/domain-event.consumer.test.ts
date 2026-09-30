import { describe, it, expect, beforeEach } from 'vitest';
import { domainEventConsumer } from '../../src/consumers/domain-event.consumer';
import { DomainEvent } from '../../src/config/domain-events';

describe('domain event consumer', () => {
  beforeEach(() => {
    domainEventConsumer.resetEventCounts();
  });

  it('dispatches subscribed events to handlers', async () => {
    let handled = false;
    domainEventConsumer.register(DomainEvent.WORKER_CREATED, async () => {
      handled = true;
    });

    const result = await domainEventConsumer.dispatch({
      name: DomainEvent.WORKER_CREATED,
      occurredAt: new Date().toISOString(),
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      entityType: 'worker',
      entityId: 'w-1',
      data: { status: 'active' },
    });

    expect(result.accepted).toBe(true);
    expect(handled).toBe(true);
    expect(domainEventConsumer.getEventCounts()[DomainEvent.WORKER_CREATED]).toBe(1);
  });

  it('rejects unknown events', async () => {
    const result = await domainEventConsumer.dispatch({
      name: 'unknown.event',
      occurredAt: new Date().toISOString(),
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    });

    expect(result.accepted).toBe(false);
  });
});
