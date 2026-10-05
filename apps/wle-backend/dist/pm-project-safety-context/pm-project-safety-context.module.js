"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmProjectSafetyContextModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_project_safety_context_controller_1 = require("./pm-project-safety-context.controller");
const pm_project_safety_controller_1 = require("./pm-project-safety.controller");
const pm_project_safety_context_service_1 = require("./pm-project-safety-context.service");
const pm_project_safety_cail_intelligence_service_1 = require("./pm-project-safety-cail-intelligence.service");
let PmProjectSafetyContextModule = class PmProjectSafetyContextModule {
};
exports.PmProjectSafetyContextModule = PmProjectSafetyContextModule;
exports.PmProjectSafetyContextModule = PmProjectSafetyContextModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [pm_project_safety_context_controller_1.PmProjectSafetyContextController, pm_project_safety_controller_1.PmProjectSafetyController],
        providers: [
            pm_project_safety_context_service_1.PmProjectSafetyContextService,
            pm_project_safety_cail_intelligence_service_1.PmProjectSafetyCailIntelligenceService,
        ],
        exports: [
            pm_project_safety_context_service_1.PmProjectSafetyContextService,
            pm_project_safety_cail_intelligence_service_1.PmProjectSafetyCailIntelligenceService,
        ],
    })
], PmProjectSafetyContextModule);
//# sourceMappingURL=pm-project-safety-context.module.js.map