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
var SafetyEcosystemEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyEcosystemEventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
let SafetyEcosystemEventsService = SafetyEcosystemEventsService_1 = class SafetyEcosystemEventsService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(SafetyEcosystemEventsService_1.name);
    }
    emit(payload) {
        if (!this.eventBus)
            return;
        this.eventBus.emit(payload);
        this.logger.debug(`Ecosystem event ${payload.name} company=${payload.companyId}`);
    }
    invalidateHub(companyId, projectId, data) {
        this.emit({
            name: domain_events_1.DomainEvent.SAFETY_HUB_INVALIDATE,
            occurredAt: new Date().toISOString(),
            companyId,
            projectId,
            data,
        });
    }
    emitInvestigationUpdated(input) {
        this.emit({
            name: domain_events_1.DomainEvent.INVESTIGATION_UPDATED,
            occurredAt: new Date().toISOString(),
            companyId: input.companyId,
            projectId: input.projectId,
            entityType: 'investigation',
            entityId: input.eventId,
            actorId: input.actorId,
            data: { status: input.status, domain: client_1.PmSafetyHubDomain.investigation },
        });
    }
    emitCapaCreated(input) {
        this.emit({
            name: domain_events_1.DomainEvent.CAPA_CREATED,
            occurredAt: new Date().toISOString(),
            companyId: input.companyId,
            projectId: input.projectId,
            entityType: 'corrective_action',
            entityId: input.actionId,
            actorId: input.actorId,
            data: {
                title: input.title,
                sourceModule: input.sourceModule,
                domain: client_1.PmSafetyHubDomain.corrective_action,
            },
        });
    }
    emitCapaStatusChanged(input) {
        this.emit({
            name: domain_events_1.DomainEvent.CAPA_STATUS_CHANGED,
            occurredAt: new Date().toISOString(),
            companyId: input.companyId,
            projectId: input.projectId,
            entityType: 'corrective_action',
            entityId: input.actionId,
            actorId: input.actorId,
            data: {
                status: input.status,
                domain: client_1.PmSafetyHubDomain.corrective_action,
            },
        });
    }
    emitSubstanceTestCompleted(input) {
        this.emit({
            name: domain_events_1.DomainEvent.SUBSTANCE_TEST_COMPLETED,
            occurredAt: new Date().toISOString(),
            companyId: input.companyId,
            projectId: input.projectId,
            entityType: 'substance_test',
            entityId: input.testEventId,
            actorId: input.actorId,
            data: {
                outcome: input.outcome,
                workerId: input.workerId,
                domain: client_1.PmSafetyHubDomain.substance_testing,
            },
        });
    }
    emitEvidenceIndexed(input) {
        this.emit({
            name: domain_events_1.DomainEvent.SAFETY_EVIDENCE_INDEXED,
            occurredAt: new Date().toISOString(),
            companyId: input.companyId,
            projectId: input.projectId,
            actorId: input.actorId,
            entityType: input.sourceType,
            entityId: input.sourceId,
            data: {
                domain: input.domain,
                attachmentId: input.attachmentId,
                fileName: input.fileName,
                sourceType: input.sourceType,
                sourceId: input.sourceId,
            },
        });
    }
    emitContractorPortalActivity(input) {
        this.invalidateHub(input.companyId, input.projectId, {
            activity: input.activity,
            dispatchId: input.dispatchId,
            deficiencyId: input.deficiencyId,
        });
    }
};
exports.SafetyEcosystemEventsService = SafetyEcosystemEventsService;
exports.SafetyEcosystemEventsService = SafetyEcosystemEventsService = SafetyEcosystemEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], SafetyEcosystemEventsService);
//# sourceMappingURL=safety-ecosystem-events.service.js.map