"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesModule = void 0;
const common_1 = require("@nestjs/common");
const assessment_engines_module_1 = require("../modules/assessment-engines/assessment-engines.module");
const pm_company_safety_context_module_1 = require("../pm-company-safety-context/pm-company-safety-context.module");
const companies_service_1 = require("./companies.service");
const companies_controller_1 = require("./companies.controller");
const company_compliance_ui_service_1 = require("./company-compliance-ui.service");
const company_training_compliance_service_1 = require("./company-training-compliance.service");
const prisma_service_1 = require("../prisma/prisma.service");
let CompaniesModule = class CompaniesModule {
};
exports.CompaniesModule = CompaniesModule;
exports.CompaniesModule = CompaniesModule = __decorate([
    (0, common_1.Module)({
        imports: [assessment_engines_module_1.AssessmentEnginesModule, pm_company_safety_context_module_1.PmCompanySafetyContextModule],
        controllers: [companies_controller_1.CompaniesController],
        providers: [
            companies_service_1.CompaniesService,
            company_training_compliance_service_1.CompanyTrainingComplianceService,
            company_compliance_ui_service_1.CompanyComplianceUiService,
            prisma_service_1.PrismaService,
        ],
        exports: [
            companies_service_1.CompaniesService,
            company_training_compliance_service_1.CompanyTrainingComplianceService,
            company_compliance_ui_service_1.CompanyComplianceUiService,
        ],
    })
], CompaniesModule);
//# sourceMappingURL=companies.module.js.map