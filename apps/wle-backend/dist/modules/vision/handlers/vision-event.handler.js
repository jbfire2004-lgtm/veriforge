"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VisionEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionEventHandler = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../api-platform/events/event-bus.service");
const domain_events_1 = require("../../api-platform/events/domain-events");
let VisionEventHandler = VisionEventHandler_1 = class VisionEventHandler {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(VisionEventHandler_1.name);
    }
    onModuleInit() {
        this.eventBus.on(domain_events_1.DomainEvent.TRAINING_UPLOADED, (p) => this.onDocument(p, 'training_certificate'));
        this.eventBus.on(domain_events_1.DomainEvent.INSPECTION_COMPLETED, (p) => this.onDocument(p, 'inspection_form'));
    }
    onDocument(payload, type) {
        this.logger.debug(`Vision queue: ${type} entity=${payload.entityId}`);
    }
};
exports.VisionEventHandler = VisionEventHandler;
exports.VisionEventHandler = VisionEventHandler = VisionEventHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], VisionEventHandler);
//# sourceMappingURL=vision-event.handler.js.map