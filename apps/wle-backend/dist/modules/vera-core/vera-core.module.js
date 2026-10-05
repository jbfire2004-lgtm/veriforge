"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const competency_module_1 = require("../competency/competency.module");
const inspection_core_module_1 = require("../inspection-core/inspection-core.module");
const vera_core_controller_1 = require("./vera-core.controller");
const registry_service_1 = require("./registry.service");
const company_links_module_1 = require("./company-links.module");
const equipment_links_service_1 = require("./equipment-links.service");
const projects_service_1 = require("./projects.service");
const union_halls_service_1 = require("./union-halls.service");
const union_hall_training_service_1 = require("./union-hall-training.service");
const wallets_service_1 = require("./wallets.service");
const inactivation_module_1 = require("./inactivation.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const tools_ppe_core_module_1 = require("../tools-ppe-core/tools-ppe-core.module");
const training_pipeline_service_1 = require("./training-pipeline.service");
const training_wallet_integration_service_1 = require("./training-wallet-integration.service");
const inspections_core_service_1 = require("./inspections-core.service");
const competency_core_service_1 = require("./competency-core.service");
const equipment_wallet_module_1 = require("../equipment-wallet/equipment-wallet.module");
const maintenance_calibration_core_module_1 = require("../maintenance-calibration-core/maintenance-calibration-core.module");
const reporting_core_module_1 = require("../reporting-core/reporting-core.module");
const notification_engine_module_1 = require("../notification-engine/notification-engine.module");
const training_standards_compliance_module_1 = require("../training-standards-compliance/training-standards-compliance.module");
const training_credential_nft_module_1 = require("../training-credential-nft/training-credential-nft.module");
const companies_module_1 = require("../../companies/companies.module");
const orientation_module_1 = require("../orientation/orientation.module");
const vera_platform_service_1 = require("./vera-platform.service");
const dashboard_widgets_module_1 = require("../dashboard-widgets/dashboard-widgets.module");
const verification_module_1 = require("../../verification/verification.module");
const core_readiness_service_1 = require("./core-readiness.service");
const core_documents_service_1 = require("./core-documents.service");
const training_ingestion_module_1 = require("../../training-ingestion/training-ingestion.module");
const credential_ledger_module_1 = require("../credential-ledger/credential-ledger.module");
const digital_twin_module_1 = require("../digital-twin/digital-twin.module");
const assessment_engines_module_1 = require("../assessment-engines/assessment-engines.module");
const safety_knowledge_module_1 = require("../safety-knowledge/safety-knowledge.module");
const fit_test_module_1 = require("../fit-test/fit-test.module");
const acp_module_1 = require("../../acp/acp.module");
const domain_event_bus_module_1 = require("../api-platform/events/domain-event-bus.module");
const project_compliance_module_1 = require("../project-compliance/project-compliance.module");
const provider_integration_hub_service_1 = require("./provider-integration-hub.service");
const vera_core_hub_service_1 = require("./vera-core-hub.service");
let VeraCoreModule = class VeraCoreModule {
};
exports.VeraCoreModule = VeraCoreModule;
exports.VeraCoreModule = VeraCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            domain_event_bus_module_1.DomainEventBusModule,
            acp_module_1.AcpModule,
            company_links_module_1.CompanyLinksModule,
            orientation_module_1.OrientationModule,
            companies_module_1.CompaniesModule,
            competency_module_1.CompetencyModule,
            inactivation_module_1.InactivationModule,
            inspection_core_module_1.InspectionCoreModule,
            equipment_compliance_module_1.EquipmentComplianceModule,
            tools_ppe_core_module_1.ToolsPpeCoreModule,
            equipment_wallet_module_1.EquipmentWalletModule,
            maintenance_calibration_core_module_1.MaintenanceCalibrationCoreModule,
            reporting_core_module_1.ReportingCoreModule,
            notification_engine_module_1.NotificationEngineModule,
            dashboard_widgets_module_1.DashboardWidgetsModule,
            (0, common_1.forwardRef)(() => verification_module_1.VerificationModule),
            (0, common_1.forwardRef)(() => training_ingestion_module_1.TrainingIngestionModule),
            (0, common_1.forwardRef)(() => digital_twin_module_1.DigitalTwinModule),
            assessment_engines_module_1.AssessmentEnginesModule,
            safety_knowledge_module_1.SafetyKnowledgeModule,
            fit_test_module_1.FitTestModule,
            (0, common_1.forwardRef)(() => training_standards_compliance_module_1.TrainingStandardsComplianceModule),
            training_credential_nft_module_1.TrainingCredentialNftModule,
            credential_ledger_module_1.CredentialLedgerModule,
            project_compliance_module_1.ProjectComplianceModule,
        ],
        controllers: [vera_core_controller_1.VeraCoreController],
        providers: [
            registry_service_1.RegistryService,
            equipment_links_service_1.EquipmentLinksService,
            projects_service_1.ProjectsService,
            union_halls_service_1.UnionHallsService,
            union_hall_training_service_1.UnionHallTrainingService,
            wallets_service_1.WalletsService,
            training_pipeline_service_1.TrainingPipelineService,
            training_wallet_integration_service_1.TrainingWalletIntegrationService,
            inspections_core_service_1.InspectionsCoreService,
            competency_core_service_1.CompetencyCoreService,
            vera_platform_service_1.VeraPlatformService,
            core_readiness_service_1.CoreReadinessService,
            core_documents_service_1.CoreDocumentsService,
            provider_integration_hub_service_1.ProviderIntegrationHubService,
            vera_core_hub_service_1.VeraCoreHubService,
        ],
        exports: [
            registry_service_1.RegistryService,
            company_links_module_1.CompanyLinksModule,
            equipment_links_service_1.EquipmentLinksService,
            projects_service_1.ProjectsService,
            union_halls_service_1.UnionHallsService,
            union_hall_training_service_1.UnionHallTrainingService,
            wallets_service_1.WalletsService,
            inactivation_module_1.InactivationModule,
            training_pipeline_service_1.TrainingPipelineService,
            training_wallet_integration_service_1.TrainingWalletIntegrationService,
            inspections_core_service_1.InspectionsCoreService,
            competency_core_service_1.CompetencyCoreService,
            vera_platform_service_1.VeraPlatformService,
            core_readiness_service_1.CoreReadinessService,
            core_documents_service_1.CoreDocumentsService,
            provider_integration_hub_service_1.ProviderIntegrationHubService,
        ],
    })
], VeraCoreModule);
//# sourceMappingURL=vera-core.module.js.map