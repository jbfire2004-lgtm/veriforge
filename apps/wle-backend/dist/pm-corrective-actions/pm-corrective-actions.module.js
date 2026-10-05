"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmCorrectiveActionsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const vera_core_module_1 = require("../modules/vera-core/vera-core.module");
const pm_corrective_actions_controller_1 = require("./pm-corrective-actions.controller");
const pm_corrective_actions_service_1 = require("./pm-corrective-actions.service");
const pm_capa_auto_generate_service_1 = require("./pm-capa-auto-generate.service");
const pm_capa_intelligence_service_1 = require("./pm-capa-intelligence.service");
const capa_priority_engine_1 = require("./capa-priority.engine");
const capa_due_date_engine_1 = require("./capa-due-date.engine");
const capa_assignment_engine_1 = require("./capa-assignment.engine");
const capa_escalation_engine_1 = require("./capa-escalation.engine");
const capa_verification_engine_1 = require("./capa-verification.engine");
let PmCorrectiveActionsModule = class PmCorrectiveActionsModule {
};
exports.PmCorrectiveActionsModule = PmCorrectiveActionsModule;
exports.PmCorrectiveActionsModule = PmCorrectiveActionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            safety_intelligence_module_1.SafetyIntelligenceModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
        ],
        controllers: [pm_corrective_actions_controller_1.PmCorrectiveActionsController],
        providers: [
            pm_corrective_actions_service_1.PmCorrectiveActionsService,
            pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
            pm_capa_intelligence_service_1.PmCapaIntelligenceService,
            capa_priority_engine_1.CapaPriorityEngine,
            capa_due_date_engine_1.CapaDueDateEngine,
            capa_assignment_engine_1.CapaAssignmentEngine,
            capa_escalation_engine_1.CapaEscalationEngine,
            capa_verification_engine_1.CapaVerificationEngine,
        ],
        exports: [
            pm_corrective_actions_service_1.PmCorrectiveActionsService,
            pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
            capa_due_date_engine_1.CapaDueDateEngine,
        ],
    })
], PmCorrectiveActionsModule);
//# sourceMappingURL=pm-corrective-actions.module.js.map