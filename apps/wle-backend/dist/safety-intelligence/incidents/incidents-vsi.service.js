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
exports.IncidentsVsiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
const cail_copilot_enrichment_service_1 = require("../cail/cail-copilot-enrichment.service");
const safety_intelligence_ai_service_1 = require("../ai/safety-intelligence-ai.service");
let IncidentsVsiService = class IncidentsVsiService {
    constructor(prisma, emitter, ai, copilotEnrich) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.ai = ai;
        this.copilotEnrich = copilotEnrich;
    }
    async openInvestigation(incidentId, dto, actor) {
        var _a, _b, _c;
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
        });
        if (!incident)
            throw new common_1.NotFoundException('Incident not found');
        return this.prisma.vsiIncidentInvestigation.upsert({
            where: { incidentId },
            create: {
                incidentId,
                projectId: dto.projectId,
                narrative: (_b = (_a = dto.narrative) !== null && _a !== void 0 ? _a : incident.description) !== null && _b !== void 0 ? _b : undefined,
                immediateActions: dto.immediateActions,
                leadInvestigatorId: (_c = dto.leadInvestigatorId) !== null && _c !== void 0 ? _c : actor.id,
            },
            update: {
                projectId: dto.projectId,
                narrative: dto.narrative,
                immediateActions: dto.immediateActions,
                leadInvestigatorId: dto.leadInvestigatorId,
            },
        });
    }
    async getInvestigation(incidentId) {
        const row = await this.prisma.vsiIncidentInvestigation.findUnique({
            where: { incidentId },
            include: {
                incident: {
                    select: { id: true, title: true, severity: true, status: true },
                },
                project: { select: { id: true, name: true } },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Investigation not found');
        return row;
    }
    async updateInvestigation(incidentId, dto) {
        await this.getInvestigation(incidentId);
        return this.prisma.vsiIncidentInvestigation.update({
            where: { incidentId },
            data: {
                narrative: dto.narrative,
                immediateActions: dto.immediateActions,
                investigationStatus: dto.investigationStatus,
                closedAt: dto.investigationStatus === 'closed' ? new Date() : undefined,
            },
        });
    }
    async generateAiPack(incidentId) {
        var _a, _b, _c;
        const investigation = await this.getInvestigation(incidentId);
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
            include: { site: true, company: true },
        });
        if (!incident)
            throw new common_1.NotFoundException('Incident not found');
        const relatedCail = await this.prisma.cailEntry.findMany({
            where: {
                projectId: investigation.projectId,
                OR: [
                    { siteId: (_a = incident.siteId) !== null && _a !== void 0 ? _a : undefined },
                    { equipmentId: (_b = incident.equipmentId) !== null && _b !== void 0 ? _b : undefined },
                ],
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
        const [openCailCount, trainingGaps] = await Promise.all([
            this.prisma.cailEntry.count({
                where: {
                    projectId: investigation.projectId,
                    status: { in: ['open', 'in_progress', 'overdue'] },
                },
            }),
            incident.companyId
                ? this.prisma.trainingRecord.count({
                    where: {
                        companyId: incident.companyId,
                        expiresAt: { lt: new Date() },
                    },
                })
                : Promise.resolve(0),
        ]);
        const pack = await this.ai.buildInvestigationPack({
            title: incident.title,
            description: incident.description,
            narrative: investigation.narrative,
            severity: incident.severity,
            relatedCailTitles: relatedCail.map((c) => c.title),
            companyId: (_c = incident.companyId) !== null && _c !== void 0 ? _c : undefined,
            projectId: investigation.projectId,
            trainingGaps,
            inspectionFailures: incident.equipmentId ? 1 : 0,
            openCailCount,
        });
        return this.prisma.vsiIncidentInvestigation.update({
            where: { incidentId },
            data: { aiInvestigationPack: pack },
        });
    }
    async bulkCreateCapa(incidentId, dto, actor) {
        var _a;
        const investigation = await this.getInvestigation(incidentId);
        const created = [];
        for (const item of dto.items) {
            const cail = await this.emitter.emit({
                projectId: investigation.projectId,
                ownerCompanyId: item.ownerCompanyId,
                sourceType: 'incident',
                sourceId: String(incidentId),
                sourceItemId: item.title.slice(0, 64),
                title: item.title,
                description: item.description,
                assignedUserId: item.assignedUserId,
                createdByUserId: actor.id,
            });
            const plan = await this.prisma.incidentCorrectiveActionPlan.create({
                data: {
                    incidentId,
                    cailEntryId: cail.id,
                    actionType: (_a = item.actionType) !== null && _a !== void 0 ? _a : 'corrective',
                },
            });
            this.copilotEnrich.scheduleCailAnalyzeEnrich(cail.id, {
                title: item.title,
                description: item.description,
                sourceType: 'incident',
                projectId: investigation.projectId,
                companyId: item.ownerCompanyId,
            });
            created.push({ cail, plan });
        }
        return created;
    }
    async listCailForIncident(incidentId) {
        return this.prisma.cailEntry.findMany({
            where: { sourceType: 'incident', sourceId: String(incidentId) },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listIncidents(filters) {
        var _a;
        const rows = await this.prisma.incident.findMany({
            where: {
                companyId: filters.companyId,
                siteId: filters.siteId,
                status: filters.status,
            },
            orderBy: { createdAt: 'desc' },
            take: (_a = filters.limit) !== null && _a !== void 0 ? _a : 50,
            select: {
                id: true,
                title: true,
                severity: true,
                status: true,
                category: true,
                createdAt: true,
                companyId: true,
                siteId: true,
                vsiInvestigation: {
                    select: {
                        investigationStatus: true,
                        projectId: true,
                    },
                },
            },
        });
        return rows.map((r) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, r), { hasInvestigation: Boolean(r.vsiInvestigation), projectId: (_b = (_a = r.vsiInvestigation) === null || _a === void 0 ? void 0 : _a.projectId) !== null && _b !== void 0 ? _b : null }));
        });
    }
};
exports.IncidentsVsiService = IncidentsVsiService;
exports.IncidentsVsiService = IncidentsVsiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService,
        safety_intelligence_ai_service_1.SafetyIntelligenceAiService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService])
], IncidentsVsiService);
//# sourceMappingURL=incidents-vsi.service.js.map