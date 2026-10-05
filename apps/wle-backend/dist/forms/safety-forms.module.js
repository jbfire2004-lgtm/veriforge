"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyFormsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const safety_management_module_1 = require("../safety-management/safety-management.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const safety_forms_controller_1 = require("./safety-forms.controller");
const safety_workflow_controller_1 = require("./safety-workflow.controller");
const project_safety_controller_1 = require("./project-safety.controller");
const form_engine_service_1 = require("./engine/form-engine.service");
const definitions_loader_1 = require("./definitions/definitions.loader");
const definitions_service_1 = require("./definitions/definitions.service");
const validation_service_1 = require("./validation/validation.service");
const submissions_service_1 = require("./submissions/submissions.service");
const workflows_service_1 = require("./workflows/workflows.service");
const safety_workflow_engine_service_1 = require("./workflows/safety-workflow-engine.service");
const attachments_service_1 = require("./attachments/attachments.service");
const signatures_service_1 = require("./signatures/signatures.service");
const corrective_actions_service_1 = require("./corrective-actions/corrective-actions.service");
const analytics_service_1 = require("./analytics/analytics.service");
const auto_populate_service_1 = require("./integration/auto-populate.service");
let SafetyFormsModule = class SafetyFormsModule {
};
exports.SafetyFormsModule = SafetyFormsModule;
exports.SafetyFormsModule = SafetyFormsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => safety_intelligence_module_1.SafetyIntelligenceModule),
            safety_management_module_1.SafetyManagementModule,
            sif_heca_module_1.SifHecaModule,
        ],
        controllers: [
            safety_forms_controller_1.SafetyFormsController,
            safety_workflow_controller_1.SafetyWorkflowController,
            project_safety_controller_1.ProjectSafetyController,
        ],
        providers: [
            prisma_service_1.PrismaService,
            form_engine_service_1.FormEngineService,
            definitions_loader_1.DefinitionsLoader,
            definitions_service_1.DefinitionsService,
            validation_service_1.SafetyFormValidationService,
            submissions_service_1.SafetyFormSubmissionsService,
            workflows_service_1.SafetyFormWorkflowsService,
            safety_workflow_engine_service_1.SafetyWorkflowEngineService,
            attachments_service_1.SafetyFormAttachmentsService,
            signatures_service_1.SafetyFormSignaturesService,
            corrective_actions_service_1.SafetyFormCorrectiveActionsService,
            analytics_service_1.SafetyFormAnalyticsService,
            auto_populate_service_1.AutoPopulateService,
        ],
        exports: [
            submissions_service_1.SafetyFormSubmissionsService,
            definitions_service_1.DefinitionsService,
            form_engine_service_1.FormEngineService,
            safety_workflow_engine_service_1.SafetyWorkflowEngineService,
        ],
    })
], SafetyFormsModule);
//# sourceMappingURL=safety-forms.module.js.map