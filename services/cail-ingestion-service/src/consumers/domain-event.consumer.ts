import { SUBSCRIBED_EVENTS } from '../config/domain-events';
import type { DomainEventPayload } from '../types';
import { logger } from '../utils/logger';

type EventHandler = (event: DomainEventPayload) => Promise<void>;

const handlers = new Map<string, EventHandler[]>();
const eventCounts = new Map<string, number>();

export const domainEventConsumer = {
  subscribedEvents: SUBSCRIBED_EVENTS,

  register(eventName: string, handler: EventHandler) {
    const list = handlers.get(eventName) ?? [];
    list.push(handler);
    handlers.set(eventName, list);
  },

  registerWildcard(handler: EventHandler) {
    domainEventConsumer.register('*', handler);
  },

  async dispatch(event: DomainEventPayload): Promise<{ accepted: boolean; handlersRun: number }> {
    if (!(SUBSCRIBED_EVENTS as readonly string[]).includes(event.name)) {
      logger.debug('event not subscribed', { name: event.name });
      return { accepted: false, handlersRun: 0 };
    }

    eventCounts.set(event.name, (eventCounts.get(event.name) ?? 0) + 1);

    const specific = handlers.get(event.name) ?? [];
    const wildcard = handlers.get('*') ?? [];
    const toRun = [...specific, ...wildcard];

    for (const handler of toRun) {
      await handler(event);
    }

    return { accepted: true, handlersRun: toRun.length };
  },

  getEventCounts(): Record<string, number> {
    return Object.fromEntries(eventCounts.entries());
  },

  resetEventCounts() {
    eventCounts.clear();
  },
};
