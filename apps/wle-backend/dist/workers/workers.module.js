"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersModule = void 0;
const common_1 = require("@nestjs/common");
const workers_controller_1 = require("./workers.controller");
const workers_service_1 = require("./workers.service");
const worker_training_hydration_service_1 = require("./worker-training-hydration.service");
const worker_project_readiness_service_1 = require("./worker-project-readiness.service");
const worker_expiry_rules_store_1 = require("./worker-expiry-rules.store");
const prisma_service_1 = require("../prisma/prisma.service");
const verification_module_1 = require("../verification/verification.module");
const company_links_module_1 = require("../modules/vera-core/company-links.module");
const orientation_module_1 = require("../modules/orientation/orientation.module");
const pm_contractor_portal_module_1 = require("../pm-contractor-portal/pm-contractor-portal.module");
let WorkersModule = class WorkersModule {
};
exports.WorkersModule = WorkersModule;
exports.WorkersModule = WorkersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => verification_module_1.VerificationModule),
            company_links_module_1.CompanyLinksModule,
            orientation_module_1.OrientationModule,
            pm_contractor_portal_module_1.PmContractorPortalModule,
        ],
        controllers: [workers_controller_1.WorkersController],
        providers: [
            workers_service_1.WorkersService,
            worker_training_hydration_service_1.WorkerTrainingHydrationService,
            worker_project_readiness_service_1.WorkerProjectReadinessService,
            worker_expiry_rules_store_1.WorkerExpiryRulesStore,
            prisma_service_1.PrismaService,
        ],
        exports: [
            workers_service_1.WorkersService,
            worker_training_hydration_service_1.WorkerTrainingHydrationService,
            worker_project_readiness_service_1.WorkerProjectReadinessService,
            worker_expiry_rules_store_1.WorkerExpiryRulesStore,
        ],
    })
], WorkersModule);
//# sourceMappingURL=workers.module.js.map