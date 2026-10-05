"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JhaFlhaModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_unified_corrective_action_module_1 = require("../pm-unified-corrective-action/pm-unified-corrective-action.module");
const jha_flha_controller_1 = require("./jha-flha.controller");
const jha_flha_service_1 = require("./jha-flha.service");
const jha_library_learning_service_1 = require("./jha-library-learning.service");
const jha_library_service_1 = require("./jha-library.service");
const jha_scoring_service_1 = require("./jha-scoring.service");
const jha_cail_bridge_service_1 = require("./jha-cail-bridge.service");
const jha_flha_orchestrator_service_1 = require("./jha-flha-orchestrator.service");
const jha_flha_engine_service_1 = require("./jha-flha-engine.service");
const hazard_control_catalog_controller_1 = require("./hazard-control-catalog.controller");
const hazard_control_catalog_service_1 = require("./hazard-control-catalog.service");
let JhaFlhaModule = class JhaFlhaModule {
};
exports.JhaFlhaModule = JhaFlhaModule;
exports.JhaFlhaModule = JhaFlhaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            safety_intelligence_module_1.SafetyIntelligenceModule,
            (0, common_1.forwardRef)(() => sif_heca_module_1.SifHecaModule),
            pm_corrective_actions_module_1.PmCorrectiveActionsModule,
            pm_unified_corrective_action_module_1.PmUnifiedCorrectiveActionModule,
        ],
        controllers: [
            jha_flha_controller_1.JhaFlhaController,
            hazard_control_catalog_controller_1.HazardCatalogController,
            hazard_control_catalog_controller_1.ControlCatalogController,
        ],
        providers: [
            jha_flha_service_1.JhaFlhaService,
            jha_library_learning_service_1.JhaLibraryLearningService,
            jha_library_service_1.JhaLibraryService,
            hazard_control_catalog_service_1.HazardControlCatalogService,
            jha_scoring_service_1.JhaScoringService,
            jha_cail_bridge_service_1.JhaCailBridgeService,
            jha_flha_orchestrator_service_1.JhaFlhaOrchestratorService,
            jha_flha_engine_service_1.JhaFlhaEngineService,
        ],
        exports: [
            jha_flha_service_1.JhaFlhaService,
            jha_library_service_1.JhaLibraryService,
            hazard_control_catalog_service_1.HazardControlCatalogService,
            jha_flha_orchestrator_service_1.JhaFlhaOrchestratorService,
            jha_flha_engine_service_1.JhaFlhaEngineService,
        ],
    })
], JhaFlhaModule);
//# sourceMappingURL=jha-flha.module.js.map