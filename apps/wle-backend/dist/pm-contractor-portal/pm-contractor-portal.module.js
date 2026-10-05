"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmContractorPortalModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const notifications_module_1 = require("../notifications/notifications.module");
const pm_inspections_module_1 = require("../pm-inspections/pm-inspections.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_contractor_portal_controller_1 = require("./pm-contractor-portal.controller");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
const pm_contractor_portal_inbox_service_1 = require("./pm-contractor-portal-inbox.service");
const pm_contractor_portal_findings_service_1 = require("./pm-contractor-portal-findings.service");
const pm_contractor_portal_compliance_service_1 = require("./pm-contractor-portal-compliance.service");
const pm_contractor_portal_messages_service_1 = require("./pm-contractor-portal-messages.service");
const contractor_compliance_engine_service_1 = require("./contractor-compliance-engine.service");
let PmContractorPortalModule = class PmContractorPortalModule {
};
exports.PmContractorPortalModule = PmContractorPortalModule;
exports.PmContractorPortalModule = PmContractorPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            notifications_module_1.NotificationsModule,
            pm_inspections_module_1.PmInspectionsModule,
            pm_corrective_actions_module_1.PmCorrectiveActionsModule,
        ],
        controllers: [pm_contractor_portal_controller_1.PmContractorPortalController],
        providers: [
            pm_contractor_portal_access_service_1.PmContractorPortalAccessService,
            pm_contractor_portal_inbox_service_1.PmContractorPortalInboxService,
            pm_contractor_portal_findings_service_1.PmContractorPortalFindingsService,
            pm_contractor_portal_compliance_service_1.PmContractorPortalComplianceService,
            pm_contractor_portal_messages_service_1.PmContractorPortalMessagesService,
            contractor_compliance_engine_service_1.ContractorComplianceEngineService,
        ],
        exports: [pm_contractor_portal_access_service_1.PmContractorPortalAccessService, contractor_compliance_engine_service_1.ContractorComplianceEngineService],
    })
], PmContractorPortalModule);
//# sourceMappingURL=pm-contractor-portal.module.js.map