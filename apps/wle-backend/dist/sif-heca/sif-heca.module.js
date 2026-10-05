"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SifHecaModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const sif_heca_controller_1 = require("./sif-heca.controller");
const sif_heca_service_1 = require("./sif-heca.service");
const sif_heca_ingestion_service_1 = require("./sif-heca-ingestion.service");
const sif_scoring_engine_1 = require("./sif-scoring.engine");
const heca_classification_engine_1 = require("./heca-classification.engine");
const control_effectiveness_engine_1 = require("./control-effectiveness.engine");
const csra_heca_engine_1 = require("./csra-heca.engine");
const sif_heca_cail_service_1 = require("./sif-heca-cail.service");
const sif_heca_scope_analysis_service_1 = require("./sif-heca-scope-analysis.service");
const sif_heca_orchestrator_service_1 = require("./sif-heca-orchestrator.service");
let SifHecaModule = class SifHecaModule {
};
exports.SifHecaModule = SifHecaModule;
exports.SifHecaModule = SifHecaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, safety_intelligence_module_1.SafetyIntelligenceModule, pm_corrective_actions_module_1.PmCorrectiveActionsModule],
        controllers: [sif_heca_controller_1.SifHecaController],
        providers: [
            sif_heca_service_1.SifHecaService,
            sif_heca_ingestion_service_1.SifHecaIngestionService,
            sif_scoring_engine_1.SifScoringEngine,
            heca_classification_engine_1.HecaClassificationEngine,
            control_effectiveness_engine_1.ControlEffectivenessEngine,
            csra_heca_engine_1.CsraHecaEngine,
            sif_heca_cail_service_1.SifHecaCailService,
            sif_heca_scope_analysis_service_1.SifHecaScopeAnalysisService,
            sif_heca_orchestrator_service_1.SifHecaOrchestratorService,
        ],
        exports: [
            sif_heca_service_1.SifHecaService,
            sif_heca_ingestion_service_1.SifHecaIngestionService,
            sif_heca_orchestrator_service_1.SifHecaOrchestratorService,
            csra_heca_engine_1.CsraHecaEngine,
        ],
    })
], SifHecaModule);
//# sourceMappingURL=sif-heca.module.js.map