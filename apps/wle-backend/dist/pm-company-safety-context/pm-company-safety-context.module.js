"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmCompanySafetyContextModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_project_safety_context_module_1 = require("../pm-project-safety-context/pm-project-safety-context.module");
const pm_company_safety_context_controller_1 = require("./pm-company-safety-context.controller");
const pm_company_safety_controller_1 = require("./pm-company-safety.controller");
const pm_company_safety_context_service_1 = require("./pm-company-safety-context.service");
const pm_company_safety_cail_intelligence_service_1 = require("./pm-company-safety-cail-intelligence.service");
let PmCompanySafetyContextModule = class PmCompanySafetyContextModule {
};
exports.PmCompanySafetyContextModule = PmCompanySafetyContextModule;
exports.PmCompanySafetyContextModule = PmCompanySafetyContextModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, pm_project_safety_context_module_1.PmProjectSafetyContextModule],
        controllers: [pm_company_safety_context_controller_1.PmCompanySafetyContextController, pm_company_safety_controller_1.PmCompanySafetyController],
        providers: [
            pm_company_safety_context_service_1.PmCompanySafetyContextService,
            pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService,
        ],
        exports: [
            pm_company_safety_context_service_1.PmCompanySafetyContextService,
            pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService,
        ],
    })
], PmCompanySafetyContextModule);
//# sourceMappingURL=pm-company-safety-context.module.js.map