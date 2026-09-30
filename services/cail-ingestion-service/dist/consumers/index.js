"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainEventConsumer = void 0;
exports.registerEventConsumers = registerEventConsumers;
const domain_event_consumer_1 = require("./domain-event.consumer");
const ingest_service_1 = require("../services/ingest.service");
/** Wire all domain event subscriptions to the ingestion pipeline. */
function registerEventConsumers() {
    const handler = async (event) => {
        await ingest_service_1.ingestService.ingestEvent(event);
    };
    domain_event_consumer_1.domainEventConsumer.registerWildcard(handler);
}
var domain_event_consumer_2 = require("./domain-event.consumer");
Object.defineProperty(exports, "domainEventConsumer", { enumerable: true, get: function () { return domain_event_consumer_2.domainEventConsumer; } });
