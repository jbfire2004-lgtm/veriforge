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
exports.BboService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
const cail_copilot_enrichment_service_1 = require("../cail/cail-copilot-enrichment.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
let BboService = class BboService {
    constructor(prisma, emitter, scope, copilotEnrich) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.scope = scope;
        this.copilotEnrich = copilotEnrich;
    }
    async list(actor, filters) {
        const where = {};
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.polarity) {
            where.polarity = filters.polarity;
        }
        if (filters.behaviorCategory) {
            where.behaviorCategory = filters.behaviorCategory;
        }
        if (!this.scope.isPrime(actor) && actor.companyId) {
            where.OR = [
                { observerCompanyId: actor.companyId },
                { ownerCompanyId: actor.companyId },
            ];
        }
        return this.prisma.bboObservation.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                observedBy: { select: { id: true, username: true } },
                cailEntry: { select: { id: true, status: true } },
            },
            orderBy: { observedAt: 'desc' },
            take: 100,
        });
    }
    async create(dto, actor) {
        var _a, _b, _c, _d, _e, _f, _g;
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (dto.polarity === client_1.ObservationPolarity.at_risk && !dto.ownerCompanyId) {
            throw new common_1.BadRequestException('ownerCompanyId is required for at-risk BBO');
        }
        const bbo = await this.prisma.bboObservation.create({
            data: {
                projectId: dto.projectId,
                observedByUserId: actor.id,
                observerCompanyId: (_a = actor.companyId) !== null && _a !== void 0 ? _a : project.companyId,
                polarity: dto.polarity,
                behaviorDescription: dto.behaviorDescription,
                locationNote: dto.locationNote,
                workActivity: dto.workActivity,
                workersObservedCount: dto.workersObservedCount,
                behaviorCategory: dto.behaviorCategory,
                safeBehaviors: dto.safeBehaviors,
                atRiskBehaviors: dto.atRiskBehaviors,
                antecedents: (_b = dto.antecedents) !== null && _b !== void 0 ? _b : undefined,
                feedbackGiven: (_c = dto.feedbackGiven) !== null && _c !== void 0 ? _c : false,
                feedbackNotes: dto.feedbackNotes,
                workerResponse: dto.workerResponse,
                actionAgreed: dto.actionAgreed,
                actionOwnerUserId: dto.actionOwnerUserId,
                actionDueAt: dto.actionDueAt ? new Date(dto.actionDueAt) : undefined,
                steeringEscalate: (_d = dto.steeringEscalate) !== null && _d !== void 0 ? _d : false,
                siteId: dto.siteId,
                equipmentId: dto.equipmentId,
                workerId: dto.workerId,
                ownerCompanyId: dto.ownerCompanyId,
                assignedUserId: dto.assignedUserId,
                severity: dto.severity,
                riskCategory: dto.riskCategory,
                observedAt: dto.observedAt ? new Date(dto.observedAt) : new Date(),
            },
        });
        const enrichPayload = {
            behaviorDescription: dto.behaviorDescription,
            polarity: dto.polarity,
            severity: dto.severity,
            riskCategory: dto.riskCategory,
            locationNote: dto.locationNote,
            projectId: dto.projectId,
            companyId: (_e = dto.ownerCompanyId) !== null && _e !== void 0 ? _e : actor.companyId,
            workActivity: dto.workActivity,
            behaviorCategory: dto.behaviorCategory,
            antecedents: dto.antecedents,
            feedbackGiven: dto.feedbackGiven,
            actionAgreed: dto.actionAgreed,
            steeringEscalate: dto.steeringEscalate,
        };
        if (dto.polarity === client_1.ObservationPolarity.at_risk && dto.ownerCompanyId) {
            const titleParts = [
                dto.behaviorCategory ? `[${dto.behaviorCategory}]` : null,
                dto.behaviorDescription.slice(0, 450),
            ].filter(Boolean);
            const cail = await this.emitter.emit({
                projectId: dto.projectId,
                ownerCompanyId: dto.ownerCompanyId,
                sourceType: 'bbo',
                sourceId: bbo.id,
                title: titleParts.join(' '),
                description: [
                    dto.behaviorDescription,
                    dto.atRiskBehaviors
                        ? `At-risk behaviours:\n${dto.atRiskBehaviors}`
                        : null,
                    ((_f = dto.antecedents) === null || _f === void 0 ? void 0 : _f.length)
                        ? `Antecedents: ${dto.antecedents.join(', ')}`
                        : null,
                    dto.actionAgreed ? `Action agreed: ${dto.actionAgreed}` : null,
                    dto.steeringEscalate ? 'Steering committee escalation requested.' : null,
                ]
                    .filter(Boolean)
                    .join('\n\n'),
                severity: dto.severity,
                riskCategory: dto.riskCategory,
                assignedUserId: (_g = dto.assignedUserId) !== null && _g !== void 0 ? _g : dto.actionOwnerUserId,
                createdByUserId: actor.id,
                siteId: dto.siteId,
                locationNote: dto.locationNote,
                equipmentId: dto.equipmentId,
                workerId: dto.workerId,
            });
            const updated = await this.prisma.bboObservation.update({
                where: { id: bbo.id },
                data: { cailEntryId: cail.id },
                include: {
                    cailEntry: { select: { id: true, status: true, title: true } },
                },
            });
            this.copilotEnrich.scheduleBboEnrich(bbo.id, cail.id, enrichPayload);
            return updated;
        }
        this.copilotEnrich.scheduleBboEnrich(bbo.id, undefined, enrichPayload);
        return bbo;
    }
    async getMetrics(projectId) {
        const [total, safe, atRisk, categoryGroups] = await Promise.all([
            this.prisma.bboObservation.count({ where: { projectId } }),
            this.prisma.bboObservation.count({
                where: { projectId, polarity: 'safe' },
            }),
            this.prisma.bboObservation.count({
                where: { projectId, polarity: 'at_risk' },
            }),
            this.prisma.bboObservation.groupBy({
                by: ['behaviorCategory'],
                where: {
                    projectId,
                    polarity: 'at_risk',
                    behaviorCategory: { not: null },
                },
                _count: { _all: true },
                orderBy: { _count: { behaviorCategory: 'desc' } },
                take: 7,
            }),
        ]);
        return {
            projectId,
            total,
            safe,
            atRisk,
            positiveRatio: total > 0 ? safe / total : 0,
            atRiskByCategory: categoryGroups.map((g) => ({
                category: g.behaviorCategory,
                count: g._count._all,
            })),
        };
    }
};
exports.BboService = BboService;
exports.BboService = BboService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService,
        cail_scope_service_1.CailScopeService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService])
], BboService);
//# sourceMappingURL=bbo.service.js.map