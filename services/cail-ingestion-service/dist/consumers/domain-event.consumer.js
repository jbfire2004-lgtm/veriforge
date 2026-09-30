"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainEventConsumer = void 0;
const domain_events_1 = require("../config/domain-events");
const logger_1 = require("../utils/logger");
const handlers = new Map();
const eventCounts = new Map();
exports.domainEventConsumer = {
    subscribedEvents: domain_events_1.SUBSCRIBED_EVENTS,
    register(eventName, handler) {
        const list = handlers.get(eventName) ?? [];
        list.push(handler);
        handlers.set(eventName, list);
    },
    registerWildcard(handler) {
        exports.domainEventConsumer.register('*', handler);
    },
    async dispatch(event) {
        if (!domain_events_1.SUBSCRIBED_EVENTS.includes(event.name)) {
            logger_1.logger.debug('event not subscribed', { name: event.name });
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
    getEventCounts() {
        return Object.fromEntries(eventCounts.entries());
    },
    resetEventCounts() {
        eventCounts.clear();
    },
};
