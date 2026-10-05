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
exports.PmInspectionIncidentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_events_service_1 = require("../pm-safety-events/pm-safety-events.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const pm_inspection_critical_findings_1 = require("./pm-inspection-critical-findings");
let PmInspectionIncidentService = class PmInspectionIncidentService {
    constructor(prisma, safetyEvents, eventBus) {
        this.prisma = prisma;
        this.safetyEvents = safetyEvents;
        this.eventBus = eventBus;
    }
    async hasCriticalMarkedFailedItems(inspectionId) {
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            include: { template: true, deficiencies: true },
        });
        if (!inspection)
            return false;
        const items = inspection.template.items;
        const failedItemIds = inspection.deficiencies.map((row) => row.itemId);
        return (0, pm_inspection_critical_findings_1.hasCriticalMarkedFailedItems)(items, failedItemIds);
    }
    async findExistingIncident(inspectionId) {
        return this.prisma.pmSafetyEvent.findFirst({
            where: { pmInspectionId: inspectionId, deletedAt: null },
        });
    }
    async createDraftIncidentFromInspection(inspection, actorId, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.safetyEvents) {
            throw new common_1.BadRequestException('Safety events service unavailable');
        }
        const existing = await this.findExistingIncident(inspection.id);
        if (existing) {
            return {
                inspectionId: inspection.id,
                eventId: existing.id,
                existing: true,
                event: existing,
            };
        }
        const items = inspection.template.items;
        const failedItemIds = inspection.deficiencies.map((row) => row.itemId);
        const criticalFailedIds = (0, pm_inspection_critical_findings_1.criticalMarkedFailedItemIds)(items, failedItemIds);
        const criticalDeficiencies = inspection.deficiencies.filter((row) => row.severity === 'critical' && criticalFailedIds.includes(row.itemId));
        const deficiencySummary = criticalDeficiencies
            .map((row) => `- ${row.title} (${row.severity})`)
            .join('\n');
        const title = (_a = options === null || options === void 0 ? void 0 : options.title) !== null && _a !== void 0 ? _a : ((options === null || options === void 0 ? void 0 : options.auto)
            ? `Auto-incident: critical finding — ${(_b = inspection.title) !== null && _b !== void 0 ? _b : inspection.template.name}`
            : `Inspection escalation: ${(_c = inspection.title) !== null && _c !== void 0 ? _c : inspection.template.name}`);
        const description = (_d = options === null || options === void 0 ? void 0 : options.description) !== null && _d !== void 0 ? _d : [
            `Created from inspection ${inspection.id}.`,
            inspection.passed === false ? 'Inspection result: FAILED.' : '',
            deficiencySummary
                ? `Critical flagged checklist failures:\n${deficiencySummary}`
                : '',
        ]
            .filter(Boolean)
            .join('\n\n');
        const event = await this.safetyEvents.createDraft({
            companyId: inspection.companyId,
            projectId: inspection.projectId,
            siteId: (_e = inspection.siteId) !== null && _e !== void 0 ? _e : undefined,
            createdByUserId: actorId,
            eventType: 'hazard_observation',
            title,
            description,
            pmInspectionId: inspection.id,
            severity: 'critical',
            mandatoryInvestigation: true,
        });
        if (inspection.equipmentId) {
            await this.safetyEvents.linkEquipment(event.id, inspection.equipmentId, 'Linked from inspection critical finding');
        }
        if (inspection.workerId) {
            await this.safetyEvents.addPerson(event.id, {
                workerId: inspection.workerId,
                role: 'subject',
            });
        }
        if (this.eventBus) {
            this.eventBus.emit({
                name: domain_events_1.DomainEvent.INCIDENT_CREATED_FROM_INSPECTION,
                occurredAt: new Date().toISOString(),
                actorId,
                companyId: inspection.companyId,
                projectId: inspection.projectId,
                entityType: 'pm_safety_event',
                entityId: event.id,
                data: {
                    inspectionId: inspection.id,
                    incidentId: event.id,
                    projectId: inspection.projectId,
                    equipmentId: (_f = inspection.equipmentId) !== null && _f !== void 0 ? _f : null,
                    workerId: (_g = inspection.workerId) !== null && _g !== void 0 ? _g : null,
                    status: 'draft',
                    auto: (_h = options === null || options === void 0 ? void 0 : options.auto) !== null && _h !== void 0 ? _h : false,
                    criticalFailedItemIds: criticalFailedIds,
                    criticalDeficiencyCount: criticalDeficiencies.length,
                },
            });
        }
        return {
            inspectionId: inspection.id,
            eventId: event.id,
            existing: false,
            event,
        };
    }
    async createDraftIfCriticalOnSubmit(inspectionId, actorId) {
        const hasCriticalFailed = await this.hasCriticalMarkedFailedItems(inspectionId);
        if (!hasCriticalFailed)
            return null;
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            include: { template: true, deficiencies: true },
        });
        if (!inspection)
            return null;
        return this.createDraftIncidentFromInspection(inspection, actorId, {
            auto: true,
        });
    }
};
exports.PmInspectionIncidentService = PmInspectionIncidentService;
exports.PmInspectionIncidentService = PmInspectionIncidentService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_safety_events_service_1.PmSafetyEventsService,
        event_bus_service_1.EventBusService])
], PmInspectionIncidentService);
//# sourceMappingURL=pm-inspection-incident.service.js.map