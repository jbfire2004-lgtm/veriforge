"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmWorkerSafetyProfileModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_company_safety_context_module_1 = require("../pm-company-safety-context/pm-company-safety-context.module");
const pm_project_safety_context_module_1 = require("../pm-project-safety-context/pm-project-safety-context.module");
const pm_site_access_control_module_1 = require("../pm-site-access-control/pm-site-access-control.module");
const pm_worker_safety_profile_controller_1 = require("./pm-worker-safety-profile.controller");
const pm_worker_safety_controller_1 = require("./pm-worker-safety.controller");
const pm_worker_safety_profile_service_1 = require("./pm-worker-safety-profile.service");
const pm_worker_safety_cail_intelligence_service_1 = require("./pm-worker-safety-cail-intelligence.service");
let PmWorkerSafetyProfileModule = class PmWorkerSafetyProfileModule {
};
exports.PmWorkerSafetyProfileModule = PmWorkerSafetyProfileModule;
exports.PmWorkerSafetyProfileModule = PmWorkerSafetyProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            pm_company_safety_context_module_1.PmCompanySafetyContextModule,
            pm_project_safety_context_module_1.PmProjectSafetyContextModule,
            pm_site_access_control_module_1.PmSiteAccessControlModule,
        ],
        controllers: [pm_worker_safety_profile_controller_1.PmWorkerSafetyProfileController, pm_worker_safety_controller_1.PmWorkerSafetyController],
        providers: [
            pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService,
            pm_worker_safety_cail_intelligence_service_1.PmWorkerSafetyCailIntelligenceService,
        ],
        exports: [
            pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService,
            pm_worker_safety_cail_intelligence_service_1.PmWorkerSafetyCailIntelligenceService,
        ],
    })
], PmWorkerSafetyProfileModule);
//# sourceMappingURL=pm-worker-safety-profile.module.js.map