"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmUnifiedHazardControlModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_project_safety_context_module_1 = require("../pm-project-safety-context/pm-project-safety-context.module");
const pm_company_safety_context_module_1 = require("../pm-company-safety-context/pm-company-safety-context.module");
const pm_worker_safety_profile_module_1 = require("../pm-worker-safety-profile/pm-worker-safety-profile.module");
const pm_unified_hazard_control_controller_1 = require("./pm-unified-hazard-control.controller");
const pm_hazard_controller_1 = require("./pm-hazard.controller");
const pm_control_controller_1 = require("./pm-control.controller");
const pm_unified_hazard_control_service_1 = require("./pm-unified-hazard-control.service");
const pm_unified_hazard_control_cail_service_1 = require("./pm-unified-hazard-control-cail.service");
let PmUnifiedHazardControlModule = class PmUnifiedHazardControlModule {
};
exports.PmUnifiedHazardControlModule = PmUnifiedHazardControlModule;
exports.PmUnifiedHazardControlModule = PmUnifiedHazardControlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            pm_project_safety_context_module_1.PmProjectSafetyContextModule,
            pm_company_safety_context_module_1.PmCompanySafetyContextModule,
            pm_worker_safety_profile_module_1.PmWorkerSafetyProfileModule,
        ],
        controllers: [
            pm_unified_hazard_control_controller_1.PmUnifiedHazardControlController,
            pm_hazard_controller_1.PmHazardController,
            pm_control_controller_1.PmControlController,
        ],
        providers: [pm_unified_hazard_control_service_1.PmUnifiedHazardControlService, pm_unified_hazard_control_cail_service_1.PmUnifiedHazardControlCailService],
        exports: [pm_unified_hazard_control_service_1.PmUnifiedHazardControlService, pm_unified_hazard_control_cail_service_1.PmUnifiedHazardControlCailService],
    })
], PmUnifiedHazardControlModule);
//# sourceMappingURL=pm-unified-hazard-control.module.js.map