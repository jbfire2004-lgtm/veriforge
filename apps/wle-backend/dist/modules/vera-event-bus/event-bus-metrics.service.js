"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventBusMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusMetricsService = void 0;
const common_1 = require("@nestjs/common");
let EventBusMetricsService = EventBusMetricsService_1 = class EventBusMetricsService {
    constructor() {
        this.logger = new common_1.Logger(EventBusMetricsService_1.name);
        this.snapshot = {
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
    }
    recordEmit(eventName) {
        var _a;
        this.snapshot.emitted += 1;
        this.snapshot.byEvent[eventName] =
            ((_a = this.snapshot.byEvent[eventName]) !== null && _a !== void 0 ? _a : 0) + 1;
        this.touch();
    }
    recordEnqueued() {
        this.snapshot.enqueued += 1;
        this.touch();
    }
    recordPublished(count = 1) {
        this.snapshot.published += count;
        this.touch();
    }
    recordPublishFailed() {
        this.snapshot.publishFailed += 1;
        this.touch();
    }
    recordDlq() {
        this.snapshot.dlq += 1;
        this.touch();
    }
    recordConsumerError() {
        this.snapshot.consumerErrors += 1;
        this.touch();
    }
    getSnapshot() {
        return Object.assign(Object.assign({}, this.snapshot), { byEvent: Object.assign({}, this.snapshot.byEvent) });
    }
    emitMonitoringHeartbeat() {
        const s = this.getSnapshot();
        const deliveryRate = s.emitted > 0 ? s.published / s.emitted : 1;
        const failureRate = s.emitted > 0 ? s.publishFailed / s.emitted : 0;
        this.logger.log(JSON.stringify(Object.assign(Object.assign({ type: 'event_bus.metrics' }, s), { deliveryRate,
            failureRate, transports: {
                nats: Boolean(process.env.NATS_URL),
                kafka: Boolean(process.env.KAFKA_BROKERS),
            } })));
    }
    touch() {
        this.snapshot.updatedAt = new Date().toISOString();
    }
};
exports.EventBusMetricsService = EventBusMetricsService;
exports.EventBusMetricsService = EventBusMetricsService = EventBusMetricsService_1 = __decorate([
    (0, common_1.Injectable)()
], EventBusMetricsService);
//# sourceMappingURL=event-bus-metrics.service.js.map