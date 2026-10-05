"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const competency_controller_1 = require("./competency.controller");
const competency_service_1 = require("./competency.service");
let CompetencyModule = class CompetencyModule {
};
exports.CompetencyModule = CompetencyModule;
exports.CompetencyModule = CompetencyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, equipment_compliance_module_1.EquipmentComplianceModule],
        controllers: [competency_controller_1.CompetencyController],
        providers: [competency_service_1.CompetencyService],
        exports: [competency_service_1.CompetencyService],
    })
], CompetencyModule);
//# sourceMappingURL=competency.module.js.map