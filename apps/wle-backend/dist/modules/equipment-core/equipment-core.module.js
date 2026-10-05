"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const vera_core_module_1 = require("../vera-core/vera-core.module");
const competency_module_1 = require("../competency/competency.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const equipment_core_controller_1 = require("./equipment-core.controller");
const equipment_core_service_1 = require("./equipment-core.service");
let EquipmentCoreModule = class EquipmentCoreModule {
};
exports.EquipmentCoreModule = EquipmentCoreModule;
exports.EquipmentCoreModule = EquipmentCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            competency_module_1.CompetencyModule,
            equipment_compliance_module_1.EquipmentComplianceModule,
        ],
        controllers: [equipment_core_controller_1.EquipmentCoreController],
        providers: [equipment_core_service_1.EquipmentCoreService],
        exports: [equipment_core_service_1.EquipmentCoreService],
    })
], EquipmentCoreModule);
//# sourceMappingURL=equipment-core.module.js.map