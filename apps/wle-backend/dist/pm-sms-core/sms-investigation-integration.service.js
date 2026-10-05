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
exports.SmsInvestigationIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rca_engine_1 = require("../pm-safety-events/rca.engine");
const sms_energy_wheel_service_1 = require("./sms-energy-wheel.service");
const sms_risk_context_service_1 = require("./sms-risk-context.service");
const sms_notification_router_service_1 = require("./sms-notification-router.service");
let SmsInvestigationIntegrationService = class SmsInvestigationIntegrationService {
    constructor(prisma, rca, energyWheel, riskContext, notify) {
        this.prisma = prisma;
        this.rca = rca;
        this.energyWheel = energyWheel;
        this.riskContext = riskContext;
        this.notify = notify;
    }
    async classifyScl(eventId, input) {
        var _a, _b;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const mandatoryInvestigation = input.sclState === 'loss' ||
            input.sclState === 'conditional' ||
            event.severity === 'critical' ||
            event.severity === 'high';
        const updated = await this.prisma.pmSafetyEvent.update({
            where: { id: eventId },
            data: {
                sclState: input.sclState,
                sclTriggersJson: (_a = input.triggers) !== null && _a !== void 0 ? _a : [],
                sclPrecursorsJson: (_b = input.precursors) !== null && _b !== void 0 ? _b : [],
                sclPotentialSeverity: input.potentialSeverity,
                mandatoryInvestigation,
            },
        });
        const investigation = await this.prisma.pmSafetyEventInvestigation.findUnique({
            where: { eventId },
        });
        if (investigation) {
            await this.prisma.pmSafetyEventInvestigation.update({
                where: { eventId },
                data: {
                    sclClassificationJson: {
                        state: input.sclState,
                        triggers: input.triggers,
                        precursors: input.precursors,
                        potentialSeverity: input.potentialSeverity,
                        classifiedAt: new Date().toISOString(),
                        classifiedBy: input.actorId,
                    },
                },
            });
        }
        await this.riskContext.upsert({
            companyId: event.companyId,
            projectId: event.projectId,
            entityType: 'safety_event',
            entityId: eventId,
            sclState: input.sclState,
            sclTriggers: input.triggers,
            sclPrecursors: input.precursors,
            sclPotentialSeverity: input.potentialSeverity,
            requiresInvestigation: mandatoryInvestigation,
        });
        if (mandatoryInvestigation && this.notify) {
            await this.notify.dispatch({
                companyId: event.companyId,
                projectId: event.projectId,
                eventKey: 'investigation.mandatory',
                title: `Investigation required: ${event.title}`,
                body: `SCL classification (${input.sclState}) requires formal investigation.`,
                entityType: 'safety_event',
                entityId: eventId,
            });
        }
        return updated;
    }
    async saveEnergyWheel(eventId, entries) {
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const profile = this.energyWheel.buildProfile(entries);
        await this.prisma.pmSafetyEvent.update({
            where: { id: eventId },
            data: {
                energyProfileJson: profile,
            },
        });
        const investigation = await this.prisma.pmSafetyEventInvestigation.findUnique({
            where: { eventId },
        });
        if (investigation) {
            await this.prisma.pmSafetyEventInvestigation.update({
                where: { eventId },
                data: { energyWheelJson: profile },
            });
        }
        await this.riskContext.upsert({
            companyId: event.companyId,
            projectId: event.projectId,
            entityType: 'safety_event',
            entityId: eventId,
            energyTypes: entries.map((e) => e.energyType),
            energyControlState: entries.find((e) => e.controlState === 'uncontrolled')
                ? 'uncontrolled'
                : entries.find((e) => e.controlState === 'partially_controlled')
                    ? 'partially_controlled'
                    : 'controlled',
            highEnergyFlag: profile.highEnergy,
            missingControls: profile.systemicGaps,
        });
        return profile;
    }
    async saveHecaVerification(eventId, input) {
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const investigation = await this.prisma.pmSafetyEventInvestigation.upsert({
            where: { eventId },
            create: { eventId, status: 'evidence_gathering' },
            update: {},
        });
        await this.prisma.pmSafetyEventInvestigation.update({
            where: { eventId },
            data: {
                hecaVerificationJson: Object.assign(Object.assign({}, input), { verifiedAt: new Date().toISOString() }),
            },
        });
        if (input.hecaCategoryCode) {
            await this.prisma.pmSafetyEvent.update({
                where: { id: eventId },
                data: { hecaCategoryCode: input.hecaCategoryCode },
            });
        }
        await this.riskContext.upsert({
            companyId: event.companyId,
            projectId: event.projectId,
            entityType: 'investigation',
            entityId: investigation.id,
            hecaInvolved: input.hecaInvolved,
            hecaCategoryCode: input.hecaCategoryCode,
        });
        return investigation;
    }
    guidedQuestionsWithSms(eventId) {
        return this.prisma.pmSafetyEvent
            .findFirst({
            where: { id: eventId, deletedAt: null },
        })
            .then(async (event) => {
            var _a;
            if (!event)
                throw new common_1.NotFoundException('Event not found');
            const base = this.rca.guidedQuestions(event.eventType);
            const extra = [];
            if (event.sclState === 'conditional' || event.sclState === 'loss') {
                extra.push({
                    id: 'scl_barrier_failure',
                    prompt: 'Which barrier failed between conditional and loss state?',
                    pathway: 'management_systems',
                    required: true,
                });
            }
            if (event.hecaCategoryCode) {
                extra.push({
                    id: 'heca_control_verification',
                    prompt: 'Were all HECA-required controls verified before the task?',
                    pathway: 'procedures',
                    required: true,
                });
            }
            const energyProfile = event.energyProfileJson;
            if ((_a = energyProfile === null || energyProfile === void 0 ? void 0 : energyProfile.entries) === null || _a === void 0 ? void 0 : _a.length) {
                extra.push({
                    id: 'energy_control_gap',
                    prompt: 'Which energy controls were missing or failed?',
                    pathway: 'equipment_failure',
                });
            }
            return {
                eventType: event.eventType,
                sclState: event.sclState,
                hecaCategoryCode: event.hecaCategoryCode,
                pathways: this.rca.taprootPathways(),
                questions: [...base, ...extra],
                energyCatalog: this.energyWheel.catalog(),
            };
        });
    }
};
exports.SmsInvestigationIntegrationService = SmsInvestigationIntegrationService;
exports.SmsInvestigationIntegrationService = SmsInvestigationIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rca_engine_1.RcaEngine,
        sms_energy_wheel_service_1.SmsEnergyWheelService,
        sms_risk_context_service_1.SmsRiskContextService,
        sms_notification_router_service_1.SmsNotificationRouterService])
], SmsInvestigationIntegrationService);
//# sourceMappingURL=sms-investigation-integration.service.js.map