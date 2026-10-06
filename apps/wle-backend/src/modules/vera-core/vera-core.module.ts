import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CompetencyModule } from '../competency/competency.module';
import { InspectionCoreModule } from '../inspection-core/inspection-core.module';
import { VeraCoreController } from './vera-core.controller';
import { RegistryService } from './registry.service';
import { CompanyLinksModule } from './company-links.module';
import { EquipmentLinksService } from './equipment-links.service';
import { ProjectsService } from './projects.service';
import { UnionHallsService } from './union-halls.service';
import { UnionHallTrainingService } from './union-hall-training.service';
import { WalletsService } from './wallets.service';
import { InactivationModule } from './inactivation.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { ToolsPpeCoreModule } from '../tools-ppe-core/tools-ppe-core.module';
import { TrainingPipelineService } from './training-pipeline.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import { InspectionsCoreService } from './inspections-core.service';
import { CompetencyCoreService } from './competency-core.service';
import { EquipmentWalletModule } from '../equipment-wallet/equipment-wallet.module';
import { MaintenanceCalibrationCoreModule } from '../maintenance-calibration-core/maintenance-calibration-core.module';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { NotificationEngineModule } from '../notification-engine/notification-engine.module';
import { TrainingStandardsComplianceModule } from '../training-standards-compliance/training-standards-compliance.module';
import { TrainingCredentialNftModule } from '../training-credential-nft/training-credential-nft.module';
import { CompaniesModule } from '../../companies/companies.module';
import { OrientationModule } from '../orientation/orientation.module';
import { VeraPlatformService } from './vera-platform.service';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { VerificationModule } from '../../verification/verification.module';
import { CoreReadinessService } from './core-readiness.service';
import { CoreDocumentsService } from './core-documents.service';
import { TrainingIngestionModule } from '../../training-ingestion/training-ingestion.module';
import { CredentialLedgerModule } from '../credential-ledger/credential-ledger.module';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { AssessmentEnginesModule } from '../assessment-engines/assessment-engines.module';
import { SafetyKnowledgeModule } from '../safety-knowledge/safety-knowledge.module';
import { FitTestModule } from '../fit-test/fit-test.module';
import { AcpModule } from '../../acp/acp.module';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';
import { ProjectComplianceModule } from '../project-compliance/project-compliance.module';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';
import { VeraCoreHubService } from './vera-core-hub.service';

@Module({
  imports: [
    PrismaModule,
    DomainEventBusModule,
    AcpModule,
    CompanyLinksModule,
    OrientationModule,
    CompaniesModule,
    CompetencyModule,
    InactivationModule,
    InspectionCoreModule,
    EquipmentComplianceModule,
    ToolsPpeCoreModule,
    EquipmentWalletModule,
    MaintenanceCalibrationCoreModule,
    ReportingCoreModule,
    NotificationEngineModule,
    DashboardWidgetsModule,
    forwardRef(() => VerificationModule),
    forwardRef(() => TrainingIngestionModule),
    forwardRef(() => DigitalTwinModule),
    AssessmentEnginesModule,
    SafetyKnowledgeModule,
    FitTestModule,
    forwardRef(() => TrainingStandardsComplianceModule),
    TrainingCredentialNftModule,
    CredentialLedgerModule,
    ProjectComplianceModule,
  ],
  controllers: [VeraCoreController],
  providers: [
    RegistryService,
    EquipmentLinksService,
    ProjectsService,
    UnionHallsService,
    UnionHallTrainingService,
    WalletsService,
    TrainingPipelineService,
    TrainingWalletIntegrationService,
    InspectionsCoreService,
    CompetencyCoreService,
    VeraPlatformService,
    CoreReadinessService,
    CoreDocumentsService,
    ProviderIntegrationHubService,
    VeraCoreHubService,
  ],
  exports: [
    RegistryService,
    CompanyLinksModule,
    EquipmentLinksService,
    ProjectsService,
    UnionHallsService,
    UnionHallTrainingService,
    WalletsService,
    InactivationModule,
    TrainingPipelineService,
    TrainingWalletIntegrationService,
    InspectionsCoreService,
    CompetencyCoreService,
    VeraPlatformService,
    CoreReadinessService,
    CoreDocumentsService,
    ProviderIntegrationHubService,
  ],
})
export class VeraCoreModule {}
