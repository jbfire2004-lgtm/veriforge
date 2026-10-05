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
var VsiDomainEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiDomainEventHandler = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../../modules/api-platform/events/domain-events");
const vsi_dashboard_revision_service_1 = require("./vsi-dashboard-revision.service");
const VSI_EVENTS = [
    domain_events_1.DomainEvent.CAIL_CREATED,
    domain_events_1.DomainEvent.CAIL_ASSIGNED,
    domain_events_1.DomainEvent.CAIL_RESOLVED,
    domain_events_1.DomainEvent.CAIL_VERIFIED,
    domain_events_1.DomainEvent.CAIL_OVERDUE,
    domain_events_1.DomainEvent.LESSON_LEARNED_PUBLISHED,
    domain_events_1.DomainEvent.VSI_DASHBOARD_INVALIDATE,
];
let VsiDomainEventHandler = VsiDomainEventHandler_1 = class VsiDomainEventHandler {
    constructor(bus, revisions) {
        this.bus = bus;
        this.revisions = revisions;
        this.logger = new common_1.Logger(VsiDomainEventHandler_1.name);
    }
    onModuleInit() {
        for (const name of VSI_EVENTS) {
            this.bus.on(name, (payload) => this.onEvent(payload));
        }
        this.logger.log(`VSI dashboard revision listener: ${VSI_EVENTS.length} events`);
    }
    onEvent(payload) {
        if (payload.projectId == null)
            return;
        const revision = this.revisions.bump(payload.projectId);
        this.logger.debug(`Dashboard revision ${revision} for project ${payload.projectId} (${payload.name})`);
    }
};
exports.VsiDomainEventHandler = VsiDomainEventHandler;
exports.VsiDomainEventHandler = VsiDomainEventHandler = VsiDomainEventHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        vsi_dashboard_revision_service_1.VsiDashboardRevisionService])
], VsiDomainEventHandler);
//# sourceMappingURL=vsi-domain-event.handler.js.map