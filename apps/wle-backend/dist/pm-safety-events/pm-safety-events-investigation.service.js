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
exports.PmSafetyEventsInvestigationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rca_engine_1 = require("./rca.engine");
const pm_investigation_capa_integration_service_1 = require("./pm-investigation-capa-integration.service");
const safety_ecosystem_events_service_1 = require("../pm-safety-ecosystem/safety-ecosystem-events.service");
const sms_investigation_integration_service_1 = require("../pm-sms-core/sms-investigation-integration.service");
let PmSafetyEventsInvestigationService = class PmSafetyEventsInvestigationService {
    constructor(prisma, rca, capaIntegration, ecosystem, smsInvestigation) {
        this.prisma = prisma;
        this.rca = rca;
        this.capaIntegration = capaIntegration;
        this.ecosystem = ecosystem;
        this.smsInvestigation = smsInvestigation;
    }
    async getOrCreate(eventId, leadInvestigatorId) {
        const existing = await this.prisma.pmSafetyEventInvestigation.findUnique({
            where: { eventId },
            include: { leadInvestigator: { select: { id: true, username: true } } },
        });
        if (existing)
            return existing;
        return this.prisma.pmSafetyEventInvestigation.create({
            data: {
                eventId,
                status: 'evidence_gathering',
                currentStep: 0,
                leadInvestigatorId,
                startedAt: new Date(),
            },
            include: { leadInvestigator: { select: { id: true, username: true } } },
        });
    }
    async update(eventId, data) {
        var _a;
        await this.getOrCreate(eventId);
        const row = await this.prisma.pmSafetyEventInvestigation.update({
            where: { eventId },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.status !== undefined ? { status: data.status } : {})), (data.currentStep !== undefined
                ? { currentStep: data.currentStep }
                : {})), (data.narrative !== undefined ? { narrative: data.narrative } : {})), (data.immediateActions !== undefined
                ? { immediateActions: data.immediateActions }
                : {})), (data.executiveSummary !== undefined
                ? { executiveSummary: data.executiveSummary }
                : {})), (data.leadInvestigatorId !== undefined
                ? { leadInvestigatorId: data.leadInvestigatorId }
                : {})), (data.guidedAnswersJson !== undefined
                ? {
                    guidedAnswersJson: data.guidedAnswersJson,
                }
                : {})),
            include: { leadInvestigator: { select: { id: true, username: true } } },
        });
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            select: { companyId: true, projectId: true },
        });
        if (event) {
            (_a = this.ecosystem) === null || _a === void 0 ? void 0 : _a.emitInvestigationUpdated({
                eventId,
                companyId: event.companyId,
                projectId: event.projectId,
                status: row.status,
            });
        }
        return row;
    }
    async guidedQuestions(eventId) {
        var _a;
        if (this.smsInvestigation) {
            return this.smsInvestigation.guidedQuestionsWithSms(eventId);
        }
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const investigation = await this.getOrCreate(eventId);
        const questions = this.rca.guidedQuestions(event.eventType);
        const suggestedFactors = this.rca.suggestContributingFactors({
            eventType: event.eventType,
            description: (_a = event.description) !== null && _a !== void 0 ? _a : event.title,
            guidedAnswers: investigation.guidedAnswersJson,
        });
        return {
            eventType: event.eventType,
            currentStep: investigation.currentStep,
            pathways: this.rca.taprootPathways(),
            questions,
            suggestedContributingFactors: suggestedFactors,
        };
    }
    async saveGuidedAnswers(eventId, answers, actorId) {
        var _a;
        const investigation = await this.getOrCreate(eventId, actorId);
        const merged = Object.assign(Object.assign({}, investigation.guidedAnswersJson), answers);
        const event = await this.prisma.pmSafetyEvent.findUnique({
            where: { id: eventId },
        });
        const suggestedFactors = this.rca.suggestContributingFactors({
            eventType: event.eventType,
            description: (_a = event.description) !== null && _a !== void 0 ? _a : event.title,
            guidedAnswers: merged,
        });
        for (const factor of suggestedFactors.slice(0, 5)) {
            const exists = await this.prisma.pmSafetyEventContributingFactor.findFirst({
                where: { eventId, label: factor.label },
            });
            if (!exists) {
                await this.prisma.pmSafetyEventContributingFactor.create({
                    data: {
                        eventId,
                        label: factor.label,
                        category: factor.pathway,
                        notes: `Auto-suggested (${Math.round(factor.confidence * 100)}% confidence)`,
                    },
                });
            }
        }
        const step = Math.min(this.rca.guidedQuestions(event.eventType).length, investigation.currentStep + 1);
        return this.update(eventId, {
            guidedAnswersJson: merged,
            currentStep: step,
            status: step >= 3 ? 'analysis' : 'evidence_gathering',
        });
    }
    async regenerateCausalTree(eventId) {
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            include: {
                rootCauses: true,
                contributingFactors: true,
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const tree = this.rca.buildCausalTree({
            eventTitle: event.title,
            rootCauses: event.rootCauses.map((r) => {
                var _a;
                return ({
                    id: r.id,
                    description: r.description,
                    category: r.category,
                    pathway: (_a = r.taprootJson) === null || _a === void 0 ? void 0 : _a.pathway,
                });
            }),
            contributingFactors: event.contributingFactors,
        });
        await this.getOrCreate(eventId);
        return this.prisma.pmSafetyEventInvestigation.update({
            where: { eventId },
            data: {
                causalTreeJson: tree,
                status: 'root_cause',
            },
        });
    }
    async getCausalTree(eventId) {
        const inv = await this.getOrCreate(eventId);
        if (inv.causalTreeJson &&
            typeof inv.causalTreeJson === 'object' &&
            Object.keys(inv.causalTreeJson).length > 0) {
            return inv.causalTreeJson;
        }
        const updated = await this.regenerateCausalTree(eventId);
        return updated.causalTreeJson;
    }
    async suggestFactorsAndRca(eventId) {
        var _a, _b, _c, _d, _e, _f;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            include: { contributingFactors: true, investigation: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const lib = await this.prisma.pmRootCauseLibraryEntry.findMany({
            where: { companyId: event.companyId, active: true },
            take: 100,
        });
        const suggestions = this.rca.suggestRootCauses({
            description: (_a = event.description) !== null && _a !== void 0 ? _a : event.title,
            eventType: event.eventType,
            contributingFactors: event.contributingFactors.map((f) => f.label),
            guidedAnswers: ((_c = (_b = event.investigation) === null || _b === void 0 ? void 0 : _b.guidedAnswersJson) !== null && _c !== void 0 ? _c : {}),
            library: lib,
        });
        return {
            pathways: this.rca.taprootPathways(),
            rootCauseSuggestions: suggestions,
            contributingFactors: this.rca.suggestContributingFactors({
                eventType: event.eventType,
                description: (_d = event.description) !== null && _d !== void 0 ? _d : event.title,
                guidedAnswers: ((_f = (_e = event.investigation) === null || _e === void 0 ? void 0 : _e.guidedAnswersJson) !== null && _f !== void 0 ? _f : {}),
            }),
        };
    }
};
exports.PmSafetyEventsInvestigationService = PmSafetyEventsInvestigationService;
exports.PmSafetyEventsInvestigationService = PmSafetyEventsInvestigationService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rca_engine_1.RcaEngine,
        pm_investigation_capa_integration_service_1.PmInvestigationCapaIntegrationService,
        safety_ecosystem_events_service_1.SafetyEcosystemEventsService,
        sms_investigation_integration_service_1.SmsInvestigationIntegrationService])
], PmSafetyEventsInvestigationService);
//# sourceMappingURL=pm-safety-events-investigation.service.js.map