"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmUnifiedCorrectiveActionModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_unified_hazard_control_module_1 = require("../pm-unified-hazard-control/pm-unified-hazard-control.module");
const pm_worker_safety_profile_module_1 = require("../pm-worker-safety-profile/pm-worker-safety-profile.module");
const pm_unified_corrective_action_controller_1 = require("./pm-unified-corrective-action.controller");
const pm_corrective_action_controller_1 = require("./pm-corrective-action.controller");
const pm_unified_corrective_action_service_1 = require("./pm-unified-corrective-action.service");
const pm_unified_corrective_action_cail_service_1 = require("./pm-unified-corrective-action-cail.service");
let PmUnifiedCorrectiveActionModule = class PmUnifiedCorrectiveActionModule {
};
exports.PmUnifiedCorrectiveActionModule = PmUnifiedCorrectiveActionModule;
exports.PmUnifiedCorrectiveActionModule = PmUnifiedCorrectiveActionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            pm_corrective_actions_module_1.PmCorrectiveActionsModule,
            pm_unified_hazard_control_module_1.PmUnifiedHazardControlModule,
            pm_worker_safety_profile_module_1.PmWorkerSafetyProfileModule,
        ],
        controllers: [
            pm_unified_corrective_action_controller_1.PmUnifiedCorrectiveActionController,
            pm_corrective_action_controller_1.PmCorrectiveActionSpecController,
        ],
        providers: [
            pm_unified_corrective_action_service_1.PmUnifiedCorrectiveActionService,
            pm_unified_corrective_action_cail_service_1.PmUnifiedCorrectiveActionCailService,
        ],
        exports: [
            pm_unified_corrective_action_service_1.PmUnifiedCorrectiveActionService,
            pm_unified_corrective_action_cail_service_1.PmUnifiedCorrectiveActionCailService,
        ],
    })
], PmUnifiedCorrectiveActionModule);
//# sourceMappingURL=pm-unified-corrective-action.module.js.map