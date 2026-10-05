"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingStandardsComplianceModule = void 0;
const common_1 = require("@nestjs/common");
const phase1_monitoring_module_1 = require("../../common/monitoring/phase1-monitoring.module");
const prisma_module_1 = require("../../prisma/prisma.module");
const credential_ledger_module_1 = require("../credential-ledger/credential-ledger.module");
const standards_matching_engine_1 = require("./engines/standards-matching.engine");
const jurisdiction_matching_engine_1 = require("./engines/jurisdiction-matching.engine");
const expiry_rule_engine_1 = require("./engines/expiry-rule.engine");
const certificate_validation_engine_1 = require("./engines/certificate-validation.engine");
const provider_qualification_validator_1 = require("./validators/provider-qualification.validator");
const instructor_qualification_validator_1 = require("./validators/instructor-qualification.validator");
const standards_catalog_service_1 = require("./standards-catalog.service");
const training_standards_compliance_service_1 = require("./training-standards-compliance.service");
const training_standards_compliance_controller_1 = require("./training-standards-compliance.controller");
const regulatory_decision_service_1 = require("./regulatory/regulatory-decision.service");
const regulatory_equivalency_service_1 = require("./regulatory/regulatory-equivalency.service");
const training_credential_nft_module_1 = require("../training-credential-nft/training-credential-nft.module");
let TrainingStandardsComplianceModule = class TrainingStandardsComplianceModule {
};
exports.TrainingStandardsComplianceModule = TrainingStandardsComplianceModule;
exports.TrainingStandardsComplianceModule = TrainingStandardsComplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            phase1_monitoring_module_1.Phase1MonitoringModule,
            credential_ledger_module_1.CredentialLedgerModule,
            (0, common_1.forwardRef)(() => training_credential_nft_module_1.TrainingCredentialNftModule),
        ],
        controllers: [training_standards_compliance_controller_1.TrainingStandardsComplianceController],
        providers: [
            standards_catalog_service_1.StandardsCatalogService,
            training_standards_compliance_service_1.TrainingStandardsComplianceService,
            regulatory_decision_service_1.RegulatoryDecisionService,
            regulatory_equivalency_service_1.RegulatoryEquivalencyService,
            standards_matching_engine_1.StandardsMatchingEngine,
            jurisdiction_matching_engine_1.JurisdictionMatchingEngine,
            expiry_rule_engine_1.ExpiryRuleEngine,
            certificate_validation_engine_1.CertificateValidationEngine,
            provider_qualification_validator_1.ProviderQualificationValidator,
            instructor_qualification_validator_1.InstructorQualificationValidator,
        ],
        exports: [
            training_standards_compliance_service_1.TrainingStandardsComplianceService,
            standards_catalog_service_1.StandardsCatalogService,
            regulatory_decision_service_1.RegulatoryDecisionService,
            regulatory_equivalency_service_1.RegulatoryEquivalencyService,
        ],
    })
], TrainingStandardsComplianceModule);
//# sourceMappingURL=training-standards-compliance.module.js.map