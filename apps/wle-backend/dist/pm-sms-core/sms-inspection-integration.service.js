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
exports.SmsInspectionIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sms_risk_escalation_engine_1 = require("./sms-risk-escalation.engine");
const sms_risk_context_service_1 = require("./sms-risk-context.service");
const sms_energy_wheel_service_1 = require("./sms-energy-wheel.service");
const sms_notification_router_service_1 = require("./sms-notification-router.service");
const capa_due_date_engine_1 = require("../pm-corrective-actions/capa-due-date.engine");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
let SmsInspectionIntegrationService = class SmsInspectionIntegrationService {
    constructor(prisma, escalation, riskContext, energyWheel, dueDate, capa, notify) {
        this.prisma = prisma;
        this.escalation = escalation;
        this.riskContext = riskContext;
        this.energyWheel = energyWheel;
        this.dueDate = dueDate;
        this.capa = capa;
        this.notify = notify;
    }
    async applyTagsToPhotoFinding(findingId, companyId, projectId, baseSeverity, tags) {
        var _a, _b, _c, _d, _e;
        const inferredEnergy = ((_a = tags.energyTypes) === null || _a === void 0 ? void 0 : _a.length)
            ? tags.energyTypes
            : this.energyWheel.inferFromText('');
        const evalResult = this.escalation.evaluate(baseSeverity, {
            sclState: tags.sclState,
            hecaInvolved: tags.hecaInvolved,
            energyTypes: inferredEnergy,
            energyControlState: tags.energyControlState,
            highEnergyFlag: tags.highEnergyFlag,
        });
        const finding = await this.prisma.pmInspectionPhotoFinding.update({
            where: { id: findingId },
            data: {
                sclState: (_b = tags.sclState) !== null && _b !== void 0 ? _b : undefined,
                hecaInvolved: (_c = tags.hecaInvolved) !== null && _c !== void 0 ? _c : false,
                hecaType: tags.hecaType,
                hecaCategoryCode: tags.hecaCategoryCode,
                energyTypesJson: inferredEnergy,
                energyControlState: (_d = tags.energyControlState) !== null && _d !== void 0 ? _d : undefined,
                highEnergyFlag: (_e = tags.highEnergyFlag) !== null && _e !== void 0 ? _e : evalResult.factors.includes('high_energy'),
                requiresInvestigation: evalResult.requiresInvestigation,
                escalatedSeverity: evalResult.escalated,
                severity: evalResult.severity,
            },
        });
        await this.riskContext.upsert({
            companyId,
            projectId,
            entityType: 'inspection_finding',
            entityId: findingId,
            sclState: tags.sclState,
            hecaInvolved: tags.hecaInvolved,
            hecaType: tags.hecaType,
            hecaCategoryCode: tags.hecaCategoryCode,
            energyTypes: inferredEnergy,
            energyControlState: tags.energyControlState,
            highEnergyFlag: finding.highEnergyFlag,
            metadata: { factors: evalResult.factors },
        });
        if (finding.correctiveActionId && this.capa) {
            await this.adjustCapaForEscalation(finding.correctiveActionId, companyId, evalResult.severity, evalResult.dueDateMultiplier);
        }
        if (evalResult.requiresInvestigation && this.notify) {
            await this.notify.dispatch({
                companyId,
                projectId,
                eventKey: 'investigation.mandatory',
                title: 'Mandatory investigation required',
                body: `Inspection finding "${finding.title}" requires investigation (SCL/HECA/Energy escalation).`,
                entityType: 'inspection_finding',
                entityId: findingId,
                hecaEscalation: tags.hecaInvolved && finding.highEnergyFlag,
            });
        }
        return { finding, escalation: evalResult };
    }
    async autoTagFromAnalysis(findingId, companyId, projectId, baseSeverity, analysisText) {
        const energyTypes = this.energyWheel.inferFromText(analysisText);
        const highEnergy = energyTypes.some((t) => ['gravity', 'electrical', 'pressure', 'chemical', 'radiation'].includes(t));
        let sclState;
        const lower = analysisText.toLowerCase();
        if (/injury|fatality|loss|damage occurred/.test(lower))
            sclState = 'loss';
        else if (/near miss|almost|could have|potential/.test(lower))
            sclState = 'conditional';
        else if (/safe|compliant|no hazard/.test(lower))
            sclState = 'safe';
        const hecaInvolved = /critical|heca|energized|confined|crane lift/i.test(analysisText);
        return this.applyTagsToPhotoFinding(findingId, companyId, projectId, baseSeverity, {
            sclState,
            hecaInvolved,
            hecaType: hecaInvolved ? 'critical_task' : undefined,
            energyTypes,
            energyControlState: highEnergy ? 'partially_controlled' : 'controlled',
            highEnergyFlag: highEnergy,
        });
    }
    async adjustCapaForEscalation(capaId, companyId, severity, multiplier) {
        const severityCail = severity === 'critical'
            ? 'critical'
            : severity === 'high'
                ? 'high'
                : severity === 'low'
                    ? 'low'
                    : 'medium';
        const config = await this.capa.getCompanyConfig(companyId);
        let dueAt = this.dueDate.computeDueAt(severityCail, config);
        if (multiplier < 1 && dueAt) {
            const ms = dueAt.getTime() - Date.now();
            dueAt = new Date(Date.now() + ms * multiplier);
        }
        await this.prisma.pmCorrectiveAction.update({
            where: { id: capaId },
            data: {
                severityLevel: severityCail,
                dueAt,
                priorityScore: { critical: 95, high: 75, medium: 50, low: 25 }[severityCail],
            },
        });
    }
};
exports.SmsInspectionIntegrationService = SmsInspectionIntegrationService;
exports.SmsInspectionIntegrationService = SmsInspectionIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_risk_escalation_engine_1.SmsRiskEscalationEngine,
        sms_risk_context_service_1.SmsRiskContextService,
        sms_energy_wheel_service_1.SmsEnergyWheelService,
        capa_due_date_engine_1.CapaDueDateEngine,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        sms_notification_router_service_1.SmsNotificationRouterService])
], SmsInspectionIntegrationService);
//# sourceMappingURL=sms-inspection-integration.service.js.map