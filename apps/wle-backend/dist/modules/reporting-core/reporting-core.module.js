"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const verification_module_1 = require("../../verification/verification.module");
const competency_module_1 = require("../competency/competency.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const inspection_core_module_1 = require("../inspection-core/inspection-core.module");
const reporting_core_controller_1 = require("./reporting-core.controller");
const reporting_core_service_1 = require("./reporting-core.service");
let ReportingCoreModule = class ReportingCoreModule {
};
exports.ReportingCoreModule = ReportingCoreModule;
exports.ReportingCoreModule = ReportingCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            (0, common_1.forwardRef)(() => verification_module_1.VerificationModule),
            equipment_compliance_module_1.EquipmentComplianceModule,
            competency_module_1.CompetencyModule,
            (0, common_1.forwardRef)(() => inspection_core_module_1.InspectionCoreModule),
        ],
        controllers: [reporting_core_controller_1.ReportingCoreController],
        providers: [reporting_core_service_1.ReportingCoreService],
        exports: [reporting_core_service_1.ReportingCoreService],
    })
], ReportingCoreModule);
//# sourceMappingURL=reporting-core.module.js.map