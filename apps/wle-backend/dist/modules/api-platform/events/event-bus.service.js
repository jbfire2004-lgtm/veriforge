"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
let EventBusService = EventBusService_1 = class EventBusService {
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.logger = new common_1.Logger(EventBusService_1.name);
        this.outbox = null;
        this.metrics = null;
    }
    bindOutbox(outbox, metrics) {
        this.outbox = outbox;
        this.metrics = metrics !== null && metrics !== void 0 ? metrics : null;
    }
    emit(event) {
        var _a, _b;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.recordEmit(event.name);
        this.logger.debug(JSON.stringify({
            type: 'event_bus.emit',
            name: event.name,
            entityType: event.entityType,
            entityId: event.entityId,
            companyId: event.companyId,
        }));
        if (process.env.VERA_EVENT_OUTBOX !== '0' && this.outbox) {
            const idempotencyKey = typeof ((_b = event.data) === null || _b === void 0 ? void 0 : _b.idempotencyKey) === 'string'
                ? event.data.idempotencyKey
                : undefined;
            void this.outbox.enqueue(event, { idempotencyKey });
        }
        this.emitter.emit(event.name, event);
        this.emitter.emit('*', event);
    }
    on(eventName, handler) {
        this.emitter.on(eventName, handler);
    }
    off(eventName, handler) {
        this.emitter.off(eventName, handler);
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)()
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map