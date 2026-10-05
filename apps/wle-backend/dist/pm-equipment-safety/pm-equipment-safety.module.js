"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmEquipmentSafetyModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const equipment_compliance_module_1 = require("../modules/equipment-compliance/equipment-compliance.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_equipment_safety_controller_1 = require("./pm-equipment-safety.controller");
const pm_equipment_controller_1 = require("./pm-equipment.controller");
const pm_equipment_safety_service_1 = require("./pm-equipment-safety.service");
const pm_equipment_cail_intelligence_service_1 = require("./pm-equipment-cail-intelligence.service");
let PmEquipmentSafetyModule = class PmEquipmentSafetyModule {
};
exports.PmEquipmentSafetyModule = PmEquipmentSafetyModule;
exports.PmEquipmentSafetyModule = PmEquipmentSafetyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, equipment_compliance_module_1.EquipmentComplianceModule, pm_corrective_actions_module_1.PmCorrectiveActionsModule],
        controllers: [pm_equipment_safety_controller_1.PmEquipmentSafetyController, pm_equipment_controller_1.PmEquipmentController],
        providers: [pm_equipment_safety_service_1.PmEquipmentSafetyService, pm_equipment_cail_intelligence_service_1.PmEquipmentCailIntelligenceService],
        exports: [pm_equipment_safety_service_1.PmEquipmentSafetyService, pm_equipment_cail_intelligence_service_1.PmEquipmentCailIntelligenceService],
    })
], PmEquipmentSafetyModule);
//# sourceMappingURL=pm-equipment-safety.module.js.map