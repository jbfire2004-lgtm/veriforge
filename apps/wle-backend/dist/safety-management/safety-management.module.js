"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyManagementModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const pm_inspections_module_1 = require("../pm-inspections/pm-inspections.module");
const pm_safety_events_module_1 = require("../pm-safety-events/pm-safety-events.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_document_control_module_1 = require("../pm-document-control/pm-document-control.module");
const pm_equipment_safety_module_1 = require("../pm-equipment-safety/pm-equipment-safety.module");
const pm_emergency_response_module_1 = require("../pm-emergency-response/pm-emergency-response.module");
const pm_site_access_control_module_1 = require("../pm-site-access-control/pm-site-access-control.module");
const pm_safety_stations_module_1 = require("../pm-safety-stations/pm-safety-stations.module");
const pm_project_safety_context_module_1 = require("../pm-project-safety-context/pm-project-safety-context.module");
const pm_worker_safety_profile_module_1 = require("../pm-worker-safety-profile/pm-worker-safety-profile.module");
const site_access_controller_1 = require("./site-access/site-access.controller");
const site_access_service_1 = require("./site-access/site-access.service");
const sds_controller_1 = require("./sds/sds.controller");
const sds_service_1 = require("./sds/sds.service");
const emergency_controller_1 = require("./emergency/emergency.controller");
const emergency_service_1 = require("./emergency/emergency.service");
const safety_context_controller_1 = require("./context/safety-context.controller");
const project_safety_context_service_1 = require("./context/project-safety-context.service");
const worker_safety_profile_service_1 = require("./context/worker-safety-profile.service");
const station_heartbeat_controller_1 = require("./stations/station-heartbeat.controller");
const station_heartbeat_service_1 = require("./stations/station-heartbeat.service");
let SafetyManagementModule = class SafetyManagementModule {
};
exports.SafetyManagementModule = SafetyManagementModule;
exports.SafetyManagementModule = SafetyManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            sif_heca_module_1.SifHecaModule,
            pm_inspections_module_1.PmInspectionsModule,
            pm_safety_events_module_1.PmSafetyEventsModule,
            pm_corrective_actions_module_1.PmCorrectiveActionsModule,
            pm_document_control_module_1.PmDocumentControlModule,
            pm_equipment_safety_module_1.PmEquipmentSafetyModule,
            pm_emergency_response_module_1.PmEmergencyResponseModule,
            pm_site_access_control_module_1.PmSiteAccessControlModule,
            pm_safety_stations_module_1.PmSafetyStationsModule,
            pm_project_safety_context_module_1.PmProjectSafetyContextModule,
            pm_worker_safety_profile_module_1.PmWorkerSafetyProfileModule,
        ],
        controllers: [
            site_access_controller_1.SiteAccessController,
            sds_controller_1.SdsController,
            emergency_controller_1.EmergencyController,
            safety_context_controller_1.SafetyContextController,
            station_heartbeat_controller_1.StationHeartbeatController,
        ],
        providers: [
            site_access_service_1.SiteAccessService,
            sds_service_1.SdsService,
            emergency_service_1.EmergencyService,
            project_safety_context_service_1.ProjectSafetyContextService,
            worker_safety_profile_service_1.WorkerSafetyProfileService,
            station_heartbeat_service_1.StationHeartbeatService,
        ],
        exports: [
            site_access_service_1.SiteAccessService,
            project_safety_context_service_1.ProjectSafetyContextService,
            worker_safety_profile_service_1.WorkerSafetyProfileService,
            emergency_service_1.EmergencyService,
        ],
    })
], SafetyManagementModule);
//# sourceMappingURL=safety-management.module.js.map