"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmDocumentControlModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_document_control_controller_1 = require("./pm-document-control.controller");
const pm_sds_controller_1 = require("./pm-sds.controller");
const pm_document_control_service_1 = require("./pm-document-control.service");
const pm_document_cail_intelligence_service_1 = require("./pm-document-cail-intelligence.service");
const chemical_hazard_engine_1 = require("./chemical-hazard.engine");
let PmDocumentControlModule = class PmDocumentControlModule {
};
exports.PmDocumentControlModule = PmDocumentControlModule;
exports.PmDocumentControlModule = PmDocumentControlModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, pm_corrective_actions_module_1.PmCorrectiveActionsModule],
        controllers: [pm_document_control_controller_1.PmDocumentControlController, pm_sds_controller_1.PmSdsController],
        providers: [
            pm_document_control_service_1.PmDocumentControlService,
            pm_document_cail_intelligence_service_1.PmDocumentCailIntelligenceService,
            chemical_hazard_engine_1.ChemicalHazardEngine,
        ],
        exports: [pm_document_control_service_1.PmDocumentControlService, pm_document_cail_intelligence_service_1.PmDocumentCailIntelligenceService],
    })
], PmDocumentControlModule);
//# sourceMappingURL=pm-document-control.module.js.map