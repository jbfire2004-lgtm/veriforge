"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmEmergencyResponseModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const notifications_module_1 = require("../notifications/notifications.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_emergency_response_controller_1 = require("./pm-emergency-response.controller");
const pm_emergency_controller_1 = require("./pm-emergency.controller");
const pm_emergency_response_service_1 = require("./pm-emergency-response.service");
const pm_emergency_cail_intelligence_service_1 = require("./pm-emergency-cail-intelligence.service");
let PmEmergencyResponseModule = class PmEmergencyResponseModule {
};
exports.PmEmergencyResponseModule = PmEmergencyResponseModule;
exports.PmEmergencyResponseModule = PmEmergencyResponseModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule, pm_corrective_actions_module_1.PmCorrectiveActionsModule],
        controllers: [pm_emergency_response_controller_1.PmEmergencyResponseController, pm_emergency_controller_1.PmEmergencyController],
        providers: [pm_emergency_response_service_1.PmEmergencyResponseService, pm_emergency_cail_intelligence_service_1.PmEmergencyCailIntelligenceService],
        exports: [pm_emergency_response_service_1.PmEmergencyResponseService, pm_emergency_cail_intelligence_service_1.PmEmergencyCailIntelligenceService],
    })
], PmEmergencyResponseModule);
//# sourceMappingURL=pm-emergency-response.module.js.map