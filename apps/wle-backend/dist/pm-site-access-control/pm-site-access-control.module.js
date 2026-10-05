"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSiteAccessControlModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const pm_inspections_module_1 = require("../pm-inspections/pm-inspections.module");
const pm_safety_events_module_1 = require("../pm-safety-events/pm-safety-events.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_document_control_module_1 = require("../pm-document-control/pm-document-control.module");
const pm_equipment_safety_module_1 = require("../pm-equipment-safety/pm-equipment-safety.module");
const pm_emergency_response_module_1 = require("../pm-emergency-response/pm-emergency-response.module");
const pm_project_safety_context_module_1 = require("../pm-project-safety-context/pm-project-safety-context.module");
const pm_company_safety_context_module_1 = require("../pm-company-safety-context/pm-company-safety-context.module");
const pm_site_access_control_controller_1 = require("./pm-site-access-control.controller");
const pm_access_controller_1 = require("./pm-access.controller");
const pm_site_access_control_service_1 = require("./pm-site-access-control.service");
const pm_site_access_cail_intelligence_service_1 = require("./pm-site-access-cail-intelligence.service");
let PmSiteAccessControlModule = class PmSiteAccessControlModule {
};
exports.PmSiteAccessControlModule = PmSiteAccessControlModule;
exports.PmSiteAccessControlModule = PmSiteAccessControlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            sif_heca_module_1.SifHecaModule,
            (0, common_1.forwardRef)(() => pm_inspections_module_1.PmInspectionsModule),
            (0, common_1.forwardRef)(() => pm_safety_events_module_1.PmSafetyEventsModule),
            pm_corrective_actions_module_1.PmCorrectiveActionsModule,
            pm_document_control_module_1.PmDocumentControlModule,
            pm_equipment_safety_module_1.PmEquipmentSafetyModule,
            pm_emergency_response_module_1.PmEmergencyResponseModule,
            pm_project_safety_context_module_1.PmProjectSafetyContextModule,
            pm_company_safety_context_module_1.PmCompanySafetyContextModule,
        ],
        controllers: [pm_site_access_control_controller_1.PmSiteAccessControlController, pm_access_controller_1.PmAccessController],
        providers: [pm_site_access_control_service_1.PmSiteAccessControlService, pm_site_access_cail_intelligence_service_1.PmSiteAccessCailIntelligenceService],
        exports: [pm_site_access_control_service_1.PmSiteAccessControlService, pm_site_access_cail_intelligence_service_1.PmSiteAccessCailIntelligenceService],
    })
], PmSiteAccessControlModule);
//# sourceMappingURL=pm-site-access-control.module.js.map