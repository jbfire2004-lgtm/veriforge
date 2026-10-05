"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyStationsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_site_access_control_module_1 = require("../pm-site-access-control/pm-site-access-control.module");
const pm_equipment_safety_module_1 = require("../pm-equipment-safety/pm-equipment-safety.module");
const pm_emergency_response_module_1 = require("../pm-emergency-response/pm-emergency-response.module");
const pm_document_control_module_1 = require("../pm-document-control/pm-document-control.module");
const pm_safety_stations_controller_1 = require("./pm-safety-stations.controller");
const pm_station_controller_1 = require("./pm-station.controller");
const pm_safety_stations_service_1 = require("./pm-safety-stations.service");
const pm_safety_stations_cail_intelligence_service_1 = require("./pm-safety-stations-cail-intelligence.service");
let PmSafetyStationsModule = class PmSafetyStationsModule {
};
exports.PmSafetyStationsModule = PmSafetyStationsModule;
exports.PmSafetyStationsModule = PmSafetyStationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            pm_site_access_control_module_1.PmSiteAccessControlModule,
            pm_equipment_safety_module_1.PmEquipmentSafetyModule,
            pm_emergency_response_module_1.PmEmergencyResponseModule,
            pm_document_control_module_1.PmDocumentControlModule,
        ],
        controllers: [pm_safety_stations_controller_1.PmSafetyStationsController, pm_station_controller_1.PmStationController],
        providers: [pm_safety_stations_service_1.PmSafetyStationsService, pm_safety_stations_cail_intelligence_service_1.PmSafetyStationsCailIntelligenceService],
        exports: [pm_safety_stations_service_1.PmSafetyStationsService, pm_safety_stations_cail_intelligence_service_1.PmSafetyStationsCailIntelligenceService],
    })
], PmSafetyStationsModule);
//# sourceMappingURL=pm-safety-stations.module.js.map