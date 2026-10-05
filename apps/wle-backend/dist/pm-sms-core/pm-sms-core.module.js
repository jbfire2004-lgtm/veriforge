"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSmsCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const notifications_module_1 = require("../notifications/notifications.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_safety_ecosystem_module_1 = require("../pm-safety-ecosystem/pm-safety-ecosystem.module");
const jha_flha_module_1 = require("../jha-flha/jha-flha.module");
const pm_inspections_module_1 = require("../pm-inspections/pm-inspections.module");
const pm_safety_events_module_1 = require("../pm-safety-events/pm-safety-events.module");
const pm_sms_core_controller_1 = require("./pm-sms-core.controller");
const sms_workflow_controller_1 = require("./sms-workflow/sms-workflow.controller");
const sms_workflow_service_1 = require("./sms-workflow/sms-workflow.service");
const sms_risk_escalation_engine_1 = require("./sms-risk-escalation.engine");
const sms_risk_context_service_1 = require("./sms-risk-context.service");
const sms_heca_library_service_1 = require("./sms-heca-library.service");
const sms_energy_wheel_service_1 = require("./sms-energy-wheel.service");
const sms_notification_router_service_1 = require("./sms-notification-router.service");
const sms_inspection_integration_service_1 = require("./sms-inspection-integration.service");
const sms_investigation_integration_service_1 = require("./sms-investigation-integration.service");
const sms_analytics_service_1 = require("./sms-analytics.service");
const rca_engine_1 = require("../pm-safety-events/rca.engine");
let PmSmsCoreModule = class PmSmsCoreModule {
};
exports.PmSmsCoreModule = PmSmsCoreModule;
exports.PmSmsCoreModule = PmSmsCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            notifications_module_1.NotificationsModule,
            (0, common_1.forwardRef)(() => pm_corrective_actions_module_1.PmCorrectiveActionsModule),
            pm_safety_ecosystem_module_1.PmSafetyEcosystemModule,
            (0, common_1.forwardRef)(() => jha_flha_module_1.JhaFlhaModule),
            (0, common_1.forwardRef)(() => pm_inspections_module_1.PmInspectionsModule),
            (0, common_1.forwardRef)(() => pm_safety_events_module_1.PmSafetyEventsModule),
        ],
        controllers: [pm_sms_core_controller_1.PmSmsCoreController, sms_workflow_controller_1.SmsWorkflowController],
        providers: [
            sms_workflow_service_1.SmsWorkflowService,
            sms_risk_escalation_engine_1.SmsRiskEscalationEngine,
            sms_risk_context_service_1.SmsRiskContextService,
            sms_heca_library_service_1.SmsHecaLibraryService,
            sms_energy_wheel_service_1.SmsEnergyWheelService,
            sms_notification_router_service_1.SmsNotificationRouterService,
            sms_inspection_integration_service_1.SmsInspectionIntegrationService,
            sms_investigation_integration_service_1.SmsInvestigationIntegrationService,
            sms_analytics_service_1.SmsAnalyticsService,
            rca_engine_1.RcaEngine,
        ],
        exports: [
            sms_workflow_service_1.SmsWorkflowService,
            sms_risk_escalation_engine_1.SmsRiskEscalationEngine,
            sms_risk_context_service_1.SmsRiskContextService,
            sms_heca_library_service_1.SmsHecaLibraryService,
            sms_energy_wheel_service_1.SmsEnergyWheelService,
            sms_notification_router_service_1.SmsNotificationRouterService,
            sms_inspection_integration_service_1.SmsInspectionIntegrationService,
            sms_investigation_integration_service_1.SmsInvestigationIntegrationService,
            sms_analytics_service_1.SmsAnalyticsService,
        ],
    })
], PmSmsCoreModule);
//# sourceMappingURL=pm-sms-core.module.js.map