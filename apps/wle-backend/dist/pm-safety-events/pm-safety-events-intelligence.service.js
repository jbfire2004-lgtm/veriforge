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
exports.PmSafetyEventsIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_heca_service_1 = require("../sif-heca/sif-heca.service");
const event_classification_engine_1 = require("./event-classification.engine");
const severity_risk_engine_1 = require("./severity-risk.engine");
const rca_engine_1 = require("./rca.engine");
let PmSafetyEventsIntelligenceService = class PmSafetyEventsIntelligenceService {
    constructor(prisma, classifier, riskEngine, rca, sifHeca) {
        this.prisma = prisma;
        this.classifier = classifier;
        this.riskEngine = riskEngine;
        this.rca = rca;
        this.sifHeca = sifHeca;
    }
    async getEventScore(eventId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            include: { injuries: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.sifEventId && this.sifHeca) {
            const sif = await this.sifHeca.getEvent(event.sifEventId);
            return {
                source: 'sif_heca',
                sifEventId: event.sifEventId,
                sif_score: (_b = (_a = sif.sifScore) === null || _a === void 0 ? void 0 : _a.sifScore) !== null && _b !== void 0 ? _b : null,
                sif_category: (_d = (_c = sif.sifScore) === null || _c === void 0 ? void 0 : _c.sifCategory) !== null && _d !== void 0 ? _d : null,
                heca_category: (_f = (_e = sif.hecaScore) === null || _e === void 0 ? void 0 : _e.hecaCategoryCode) !== null && _f !== void 0 ? _f : event.hecaCategoryCode,
                heca_category_label: (_h = (_g = sif.hecaScore) === null || _g === void 0 ? void 0 : _g.hecaCategoryLabel) !== null && _h !== void 0 ? _h : null,
                risk_score: event.riskScore,
                requires_supervisor_review: event.requiresSupervisorReview,
            };
        }
        if (this.sifHeca) {
            const hasMedical = event.injuries.some((i) => i.medicalAid || i.lostTime);
            const energyTypes = [
                this.classifier.suggestHecaCategory((_j = event.description) !== null && _j !== void 0 ? _j : event.title, (_k = event.hecaCategoryCode) !== null && _k !== void 0 ? _k : undefined),
            ];
            const dry = await this.sifHeca.evaluateDryRun({
                title: event.title,
                description: (_l = event.description) !== null && _l !== void 0 ? _l : undefined,
                companyId: event.companyId,
                projectId: event.projectId,
                scoringInput: {
                    hazardSeverity: event.severity === 'critical'
                        ? 5
                        : event.severity === 'high'
                            ? 4
                            : event.severity === 'medium'
                                ? 3
                                : 2,
                    hazardLikelihood: hasMedical ? 5 : event.likelihood,
                    energyTypes,
                    controls: [],
                },
            });
            return Object.assign(Object.assign({ source: 'dry_run', sifEventId: null }, dry), { risk_score: event.riskScore });
        }
        return {
            source: 'event_risk',
            sif_score: null,
            heca_category: event.hecaCategoryCode,
            risk_score: event.riskScore,
            requires_supervisor_review: event.requiresSupervisorReview,
        };
    }
    async predictFromEvent(eventId) {
        var _a, _b;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            include: {
                injuries: true,
                equipmentLinks: true,
                people: true,
                contributingFactors: true,
                rootCauses: true,
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const score = await this.getEventScore(eventId);
        const lib = await this.prisma.pmRootCauseLibraryEntry.findMany({
            where: { companyId: event.companyId, active: true },
        });
        const rootCauseSuggestions = this.rca.suggestRootCauses({
            description: (_a = event.description) !== null && _a !== void 0 ? _a : event.title,
            eventType: event.eventType,
            contributingFactors: event.contributingFactors.map((f) => f.label),
            library: lib,
        });
        const workerIds = [
            ...event.people
                .map((p) => p.workerId)
                .filter((w) => w != null),
            ...event.injuries
                .map((i) => i.workerId)
                .filter((w) => w != null),
        ];
        const workerImpacts = await Promise.all([...new Set(workerIds)].map((id) => this.workerRiskProfile(id, event.projectId)));
        const equipmentCount = event.equipmentLinks.length;
        const recurrenceLikelihood = Math.min(100, ((_b = score.sif_score) !== null && _b !== void 0 ? _b : event.riskScore) +
            event.rootCauses.length * 5 +
            (event.severity === 'critical' ? 20 : 0));
        return {
            sif_score: score.sif_score,
            heca_category: score.heca_category,
            root_cause_suggestions: rootCauseSuggestions,
            recommended_corrective_actions: rootCauseSuggestions
                .slice(0, 3)
                .map((r) => ({
                title: `Address: ${r.label}`,
                priority: r.score >= 3 ? 'high' : 'medium',
            })),
            predictive_recurrence_likelihood: recurrenceLikelihood,
            worker_risk_impacts: workerImpacts,
            equipment_risk_impact: {
                equipmentInvolved: equipmentCount,
                lockoutsApplied: event.equipmentLinks.filter((e) => e.lockoutApplied)
                    .length,
            },
            requires_safety_review: event.requiresSupervisorReview ||
                (typeof score.sif_score === 'number' && score.sif_score >= 70),
            explainability: [
                {
                    rule: 'recurrence',
                    detail: `risk + RCA depth + severity → ${recurrenceLikelihood}%`,
                },
            ],
        };
    }
    async projectAnalytics(projectId) {
        var _a, _b, _c, _d, _e, _f;
        const since90 = new Date(Date.now() - 90 * 86400000);
        const events = await this.prisma.pmSafetyEvent.findMany({
            where: { projectId, deletedAt: null },
            select: {
                eventType: true,
                severity: true,
                status: true,
                createdAt: true,
                sifEventId: true,
                hecaCategoryCode: true,
            },
        });
        const byType = {};
        const bySeverity = {};
        for (const e of events) {
            byType[e.eventType] = ((_a = byType[e.eventType]) !== null && _a !== void 0 ? _a : 0) + 1;
            bySeverity[e.severity] = ((_b = bySeverity[e.severity]) !== null && _b !== void 0 ? _b : 0) + 1;
        }
        const rootCauses = await this.prisma.pmSafetyEventRootCause.groupBy({
            by: ['category'],
            where: { event: { projectId, deletedAt: null } },
            _count: true,
        });
        const recent90 = events.filter((e) => e.createdAt >= since90);
        const nearMiss = (_c = byType.near_miss) !== null && _c !== void 0 ? _c : 0;
        const injuries = (_d = byType.incident_injury) !== null && _d !== void 0 ? _d : 0;
        const projectIncidentScore = Math.max(0, 100 - injuries * 15 - ((_e = bySeverity.critical) !== null && _e !== void 0 ? _e : 0) * 20 - nearMiss * 2);
        const [peopleInvolved, equipmentInvolved, sifLinked] = await Promise.all([
            this.prisma.pmSafetyEventPerson.groupBy({
                by: ['role'],
                where: { event: { projectId, deletedAt: null } },
                _count: true,
            }),
            this.prisma.pmSafetyEventEquipment.count({
                where: { event: { projectId, deletedAt: null } },
            }),
            this.prisma.pmSafetyEvent.count({
                where: { projectId, deletedAt: null, sifEventId: { not: null } },
            }),
        ]);
        const hecaTrend = {};
        for (const e of events) {
            if (e.hecaCategoryCode) {
                hecaTrend[e.hecaCategoryCode] =
                    ((_f = hecaTrend[e.hecaCategoryCode]) !== null && _f !== void 0 ? _f : 0) + 1;
            }
        }
        return {
            totalEvents: events.length,
            byType,
            bySeverity,
            rootCauseDistribution: rootCauses,
            nearMissTrend: nearMiss,
            injuryCount: injuries,
            projectIncidentScore,
            complianceLeadingIndicator: projectIncidentScore,
            trends: {
                events90d: recent90.length,
                injuryRate90d: recent90.length > 0
                    ? Math.round((recent90.filter((e) => e.eventType === 'incident_injury')
                        .length /
                        recent90.length) *
                        100)
                    : 0,
            },
            workerInvolvementByRole: peopleInvolved,
            equipmentInvolvementCount: equipmentInvolved,
            sifHecaLinkedCount: sifLinked,
            hecaCategoryTrend: hecaTrend,
            explainability: [
                {
                    rule: 'project_incident_score',
                    detail: `100 - injuries*15 - critical*20 - nearMiss*2`,
                },
            ],
        };
    }
    async workerRiskProfile(workerId, projectId) {
        const involved = await this.prisma.pmSafetyEventPerson.count({
            where: { workerId, event: { projectId, deletedAt: null } },
        });
        const injuries = await this.prisma.pmSafetyEventInjury.count({
            where: { workerId, event: { projectId, deletedAt: null } },
        });
        return {
            workerId,
            eventsInvolved: involved,
            injuryRecords: injuries,
            riskScore: Math.min(100, involved * 10 + injuries * 25),
        };
    }
};
exports.PmSafetyEventsIntelligenceService = PmSafetyEventsIntelligenceService;
exports.PmSafetyEventsIntelligenceService = PmSafetyEventsIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_classification_engine_1.EventClassificationEngine,
        severity_risk_engine_1.SeverityRiskEngine,
        rca_engine_1.RcaEngine,
        sif_heca_service_1.SifHecaService])
], PmSafetyEventsIntelligenceService);
//# sourceMappingURL=pm-safety-events-intelligence.service.js.map