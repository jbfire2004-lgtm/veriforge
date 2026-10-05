"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const inactivation_module_1 = require("../vera-core/inactivation.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const safety_intelligence_module_1 = require("../../safety-intelligence/safety-intelligence.module");
const inspection_core_controller_1 = require("./inspection-core.controller");
const inspection_core_service_1 = require("./inspection-core.service");
let InspectionCoreModule = class InspectionCoreModule {
};
exports.InspectionCoreModule = InspectionCoreModule;
exports.InspectionCoreModule = InspectionCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            inactivation_module_1.InactivationModule,
            equipment_compliance_module_1.EquipmentComplianceModule,
            (0, common_1.forwardRef)(() => safety_intelligence_module_1.SafetyIntelligenceModule),
        ],
        controllers: [inspection_core_controller_1.InspectionCoreController],
        providers: [inspection_core_service_1.InspectionCoreService],
        exports: [inspection_core_service_1.InspectionCoreService],
    })
], InspectionCoreModule);
//# sourceMappingURL=inspection-core.module.js.map