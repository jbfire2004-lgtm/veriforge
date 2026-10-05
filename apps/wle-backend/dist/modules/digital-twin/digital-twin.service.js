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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwinService = void 0;
const common_1 = require("@nestjs/common");
const digital_twin_1 = require("@vera/digital-twin");
const prisma_service_1 = require("../../prisma/prisma.service");
const reporting_core_service_1 = require("../reporting-core/reporting-core.service");
const dashboard_widgets_service_1 = require("../dashboard-widgets/dashboard-widgets.service");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
let DigitalTwinService = class DigitalTwinService {
    constructor(prisma, reporting, widgets, eventBus) {
        this.prisma = prisma;
        this.reporting = reporting;
        this.widgets = widgets;
        this.eventBus = eventBus;
        this.vdte = new digital_twin_1.VeraDigitalTwinEngine();
    }
    onModuleInit() {
        this.registerEventHandlers();
    }
    async hydrateCompany(companyId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true },
        });
        if (!company)
            return [];
        const widgetBundle = await this.widgets.getBundle({
            companyId,
            includeWorkerCompliance: true,
            includeEquipmentCompliance: true,
            includeProjectReadiness: true,
            includeUnionDispatch: true,
        });
        this.vdte.createCompany({
            id: String(company.id),
            name: company.name,
            complianceRate: (_b = (_a = widgetBundle.workerCompliance) === null || _a === void 0 ? void 0 : _a.complianceRate) !== null && _b !== void 0 ? _b : 0,
            workerCount: (_d = (_c = widgetBundle.workerCompliance) === null || _c === void 0 ? void 0 : _c.totalWorkers) !== null && _d !== void 0 ? _d : 0,
            equipmentCount: (_f = (_e = widgetBundle.equipmentCompliance) === null || _e === void 0 ? void 0 : _e.total) !== null && _f !== void 0 ? _f : 0,
            projectCount: (_h = (_g = widgetBundle.projectReadiness) === null || _g === void 0 ? void 0 : _g.totalProjects) !== null && _h !== void 0 ? _h : 0,
        });
        const workers = await this.prisma.worker.findMany({
            where: { companyId },
            take: 100,
            select: { id: true, firstName: true, lastName: true, companyId: true },
        });
        const report = await this.reporting.workerCompliance(companyId, 200);
        const reportMap = new Map(report.rows.map((r) => [r.workerId, r]));
        for (const w of workers) {
            const row = reportMap.get(w.id);
            this.vdte.createWorker({
                id: String(w.id),
                name: `${w.firstName} ${w.lastName}`.trim(),
                companyId: String(companyId),
                isCompliant: (_j = row === null || row === void 0 ? void 0 : row.isCompliant) !== null && _j !== void 0 ? _j : false,
                expiringSoon: (_k = row === null || row === void 0 ? void 0 : row.expiringSoon) !== null && _k !== void 0 ? _k : false,
                expiredCount: (row === null || row === void 0 ? void 0 : row.isCompliant) ? 0 : 1,
            });
        }
        const equipment = await this.prisma.equipment.findMany({
            where: { companyId },
            take: 100,
            select: { id: true, name: true, lockedOutAt: true, companyId: true },
        });
        for (const e of equipment) {
            this.vdte.createEquipment({
                id: String(e.id),
                name: e.name,
                companyId: String(companyId),
                lockedOut: !!e.lockedOutAt,
                overdueInspection: false,
            });
        }
        const projects = await this.prisma.project.findMany({
            where: { companyId },
            take: 30,
            select: { id: true, name: true, companyId: true },
        });
        const pr = widgetBundle.projectReadiness;
        for (const p of projects) {
            this.vdte.createProject({
                id: String(p.id),
                name: p.name,
                companyId: String(companyId),
                readiness: (_l = pr === null || pr === void 0 ? void 0 : pr.averageReadiness) !== null && _l !== void 0 ? _l : 0,
                missingWorkers: (_m = pr === null || pr === void 0 ? void 0 : pr.missingWorkers) !== null && _m !== void 0 ? _m : 0,
                missingEquipment: (_o = pr === null || pr === void 0 ? void 0 : pr.missingEquipment) !== null && _o !== void 0 ? _o : 0,
                missingTraining: (_p = pr === null || pr === void 0 ? void 0 : pr.missingTraining) !== null && _p !== void 0 ? _p : 0,
            });
        }
        return this.vdte.list();
    }
    getTwin(type, id) {
        return this.vdte.get(type, id);
    }
    getTimeline(type, id) {
        return this.vdte.getTimeline(type, id);
    }
    getHistory(type, id) {
        return this.vdte.getHistory(type, id);
    }
    getDashboard() {
        return this.vdte.getDashboard();
    }
    applyEvent(event) {
        return this.vdte.applyEvent(event);
    }
    applyOfflineEvent(event, clientVersion) {
        this.vdte.applyEventOffline(event, clientVersion);
    }
    syncTwin(type, id) {
        return this.vdte.syncOffline(type, id);
    }
    registerEventHandlers() {
        const map = {
            [domain_events_1.DomainEvent.WORKER_LINKED]: 'worker.linked',
            [domain_events_1.DomainEvent.WORKER_UNLINKED]: 'worker.unlinked',
            [domain_events_1.DomainEvent.TRAINING_UPLOADED]: 'training.uploaded',
            [domain_events_1.DomainEvent.TRAINING_VALIDATED]: 'training.validated',
            [domain_events_1.DomainEvent.INSPECTION_COMPLETED]: 'inspection.completed',
            [domain_events_1.DomainEvent.PROJECT_ASSIGNED]: 'project.assigned',
            [domain_events_1.DomainEvent.PROJECT_CLOSED]: 'project.closed',
            [domain_events_1.DomainEvent.PROVIDER_APPROVED]: 'provider.approved',
            [domain_events_1.DomainEvent.COMPLIANCE_RECALC]: 'compliance.recalc',
            [domain_events_1.DomainEvent.SYNC_BATCH]: 'sync.batch',
        };
        for (const [domainEvent, twinEvent] of Object.entries(map)) {
            this.eventBus.on(domainEvent, (payload) => {
                const entityType = entityTypeFromPayload(payload);
                if (!entityType || payload.entityId == null)
                    return;
                this.vdte.applyEvent({
                    name: twinEvent,
                    entityType,
                    entityId: String(payload.entityId),
                    occurredAt: payload.occurredAt,
                    companyId: payload.companyId ? String(payload.companyId) : undefined,
                    projectId: payload.projectId ? String(payload.projectId) : undefined,
                    data: payload.data,
                });
            });
        }
    }
};
exports.DigitalTwinService = DigitalTwinService;
exports.DigitalTwinService = DigitalTwinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reporting_core_service_1.ReportingCoreService,
        dashboard_widgets_service_1.DashboardWidgetsService,
        event_bus_service_1.EventBusService])
], DigitalTwinService);
function entityTypeFromPayload(payload) {
    var _a;
    const t = (_a = payload.entityType) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (t === 'worker')
        return 'worker';
    if (t === 'equipment')
        return 'equipment';
    if (t === 'project')
        return 'project';
    if (t === 'company')
        return 'company';
    if (t === 'provider' || t === 'trainingprovider')
        return 'provider';
    if (t === 'unionhall')
        return 'unionHall';
    if (payload.name.includes('worker'))
        return 'worker';
    if (payload.name.includes('equipment'))
        return 'equipment';
    if (payload.name.includes('project'))
        return 'project';
    if (payload.name.includes('provider'))
        return 'provider';
    return null;
}
//# sourceMappingURL=digital-twin.service.js.map