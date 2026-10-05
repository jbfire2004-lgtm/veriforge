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
var ComplianceEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceEventHandler = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../event-bus.service");
const domain_events_1 = require("../domain-events");
const common_2 = require("@nestjs/common");
let ComplianceEventHandler = ComplianceEventHandler_1 = class ComplianceEventHandler {
    constructor(bus) {
        this.bus = bus;
        this.logger = new common_2.Logger(ComplianceEventHandler_1.name);
    }
    onModuleInit() {
        const triggers = [
            domain_events_1.DomainEvent.WORKER_LINKED,
            domain_events_1.DomainEvent.TRAINING_UPLOADED,
            domain_events_1.DomainEvent.INSPECTION_COMPLETED,
            domain_events_1.DomainEvent.PROJECT_ASSIGNED,
        ];
        for (const name of triggers) {
            this.bus.on(name, (payload) => this.scheduleRecalc(payload));
        }
    }
    scheduleRecalc(payload) {
        this.logger.log(`Compliance recalc queued for ${payload.entityType}:${payload.entityId}`);
        this.bus.emit({
            name: domain_events_1.DomainEvent.COMPLIANCE_RECALC,
            occurredAt: new Date().toISOString(),
            companyId: payload.companyId,
            projectId: payload.projectId,
            entityType: payload.entityType,
            entityId: payload.entityId,
            data: payload.data,
        });
    }
};
exports.ComplianceEventHandler = ComplianceEventHandler;
exports.ComplianceEventHandler = ComplianceEventHandler = ComplianceEventHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], ComplianceEventHandler);
//# sourceMappingURL=compliance-event.handler.js.map