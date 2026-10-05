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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiEventService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../../modules/api-platform/events/domain-events");
let VsiEventService = class VsiEventService {
    constructor(bus) {
        this.bus = bus;
    }
    emit(name, payload) {
        var _a;
        if (!this.bus)
            return;
        const event = {
            name,
            occurredAt: (_a = payload.occurredAt) !== null && _a !== void 0 ? _a : new Date().toISOString(),
            actorId: payload.actorId,
            companyId: payload.companyId,
            projectId: payload.projectId,
            entityType: payload.entityType,
            entityId: payload.entityId,
            data: payload.data,
        };
        this.bus.emit(event);
        if (name !== domain_events_1.DomainEvent.VSI_DASHBOARD_INVALIDATE) {
            this.bus.emit(Object.assign(Object.assign({}, event), { name: domain_events_1.DomainEvent.VSI_DASHBOARD_INVALIDATE }));
        }
    }
    cailCreated(cail) {
        this.emit(domain_events_1.DomainEvent.CAIL_CREATED, {
            projectId: cail.projectId,
            companyId: cail.ownerCompanyId,
            entityType: 'CailEntry',
            entityId: cail.id,
            actorId: cail.actorId,
            data: { sourceType: cail.sourceType },
        });
    }
    cailAssigned(cail) {
        this.emit(domain_events_1.DomainEvent.CAIL_ASSIGNED, {
            projectId: cail.projectId,
            companyId: cail.ownerCompanyId,
            entityType: 'CailEntry',
            entityId: cail.id,
            actorId: cail.actorId,
            data: { assignedUserId: cail.assignedUserId },
        });
    }
    cailResolved(cail) {
        this.emit(domain_events_1.DomainEvent.CAIL_RESOLVED, {
            projectId: cail.projectId,
            companyId: cail.ownerCompanyId,
            entityType: 'CailEntry',
            entityId: cail.id,
            actorId: cail.actorId,
        });
    }
    cailVerified(cail) {
        this.emit(domain_events_1.DomainEvent.CAIL_VERIFIED, {
            projectId: cail.projectId,
            companyId: cail.ownerCompanyId,
            entityType: 'CailEntry',
            entityId: cail.id,
            actorId: cail.actorId,
        });
    }
    lessonPublished(lesson) {
        this.emit(domain_events_1.DomainEvent.LESSON_LEARNED_PUBLISHED, {
            projectId: lesson.projectId,
            companyId: lesson.companyId,
            entityType: 'LessonsLearnedEntry',
            entityId: lesson.id,
            data: { cailId: lesson.cailId },
        });
    }
};
exports.VsiEventService = VsiEventService;
exports.VsiEventService = VsiEventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], VsiEventService);
//# sourceMappingURL=vsi-event.service.js.map