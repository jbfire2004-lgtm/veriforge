import { Module } from '@nestjs/common';
import { VeriForgeAuthController } from './controllers/auth.controller';
import { VeriForgeUsersController } from './controllers/users.controller';
import { VeriForgeTrainingController } from './controllers/training.controller';
import { VeriForgeVerificationController } from './controllers/verification.controller';
import { VeriForgeComplianceController } from './controllers/compliance.controller';
import { VeriForgeSettingsController } from './controllers/settings.controller';
import { VeriForgeNotificationsController } from './controllers/notifications.controller';
import { VeriForgeAssistantController } from './controllers/assistant.controller';
import { VeriForgeIncidentController } from './controllers/incident.controller';
import { VeriForgeAuditController } from './controllers/audit.controller';
import { VeriForgeWorkflowController } from './controllers/workflow.controller';
import { VeriForgeContractorController } from './controllers/contractor.controller';
import { VeriForgeTenantController } from './controllers/tenant.controller';
import { VeriForgeRiskController } from './controllers/risk.controller';
import { VeriForgeBadgeController } from './controllers/badge.controller';
import { VeriForgeCultureController } from './controllers/culture.controller';
import { VeriForgeEmergencyController } from './controllers/emergency.controller';
import { VeriForgeInspectionController } from './controllers/inspection.controller';
import { VeriForgeSiteSafetyController } from './controllers/site-safety.controller';
import { VeriForgeContractorOnboardingController } from './controllers/contractor-onboarding.controller';
import { VeriForgeFieldOperationsController } from './controllers/field-operations.controller';
import { VeriForgeSafetyKpiController } from './controllers/safety-kpi.controller';
import { VeriForgeEnterpriseArchitectureController } from './controllers/enterprise-architecture.controller';
import { VeriForgeBrandExpansionController } from './controllers/brand-expansion.controller';
import { VeriForgeMotionController } from './controllers/motion.controller';
import { VeriForgeIconographyController } from './controllers/iconography.controller';
import { VeriForgePredictiveController } from './controllers/predictive.controller';
import { VeriForgeDeploymentController } from './controllers/deployment.controller';
import { VeriForgeAnimationController } from './controllers/animation.controller';
import { VeriForgeReportsController } from './controllers/reports.controller';
import { VeriForgeDigitalTwinController } from './controllers/digital-twin.controller';
import { VeriForgeSoundController } from './controllers/sound.controller';
import { VeriForgeCommandCenterController } from './controllers/command-center.controller';
import { VeriForgeLedgerController } from './controllers/ledger.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { TrainingService } from './services/training.service';
import { VerificationService } from './services/verification.service';
import { ComplianceService } from './services/compliance.service';
import { SettingsService } from './services/settings.service';
import { VeriForgeStoreService } from './services/veriforge-store.service';
import { NotificationService } from './services/notification.service';
import { AssistantService } from './services/assistant.service';
import { IncidentService } from './services/incident.service';
import { AuditEngineService } from './services/audit-engine.service';
import { WorkflowBuilderService } from './services/workflow-builder.service';
import { ContractorService } from './services/contractor.service';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { BadgeService } from './services/badge.service';
import { SafetyCultureService } from './services/safety-culture.service';
import { EmergencyResponseService } from './services/emergency-response.service';
import { EquipmentInspectionService } from './services/equipment-inspection.service';
import { SiteSafetyPlanningService } from './services/site-safety-planning.service';
import { ContractorOnboardingService } from './services/contractor-onboarding.service';
import { FieldOperationsService } from './services/field-operations.service';
import { SafetyKpiIntelligenceService } from './services/safety-kpi-intelligence.service';
import { EnterpriseArchitectureService } from './services/enterprise-architecture.service';
import { BrandExpansionService } from './services/brand-expansion.service';
import { IndustrialMotionService } from './services/industrial-motion.service';
import { IndustrialIconographyService } from './services/industrial-iconography.service';
import { SafetyAiPredictiveService } from './services/safety-ai-predictive.service';
import { GlobalDeploymentPlaybookService } from './services/global-deployment-playbook.service';
import { IndustrialAnimationLibraryService } from './services/industrial-animation-library.service';
import { ExecutiveReportingService } from './services/executive-reporting.service';
import { SafetyDigitalTwinService } from './services/safety-digital-twin.service';
import { IndustrialSoundDesignService } from './services/industrial-sound-design.service';
import { MultiSiteCommandCenterService } from './services/multi-site-command-center.service';
import { SafetyBlockchainLedgerService } from './services/safety-blockchain-ledger.service';
import { TenantRegistryService } from './tenancy/tenant-registry.service';
import { TenantAuthService } from './tenancy/tenant-auth.service';
import { TenantIsolationService } from './tenancy/tenant-isolation.service';
import { TenantStorageService } from './tenancy/tenant-storage.service';
import { TenantScalingService } from './tenancy/tenant-scaling.service';
import { TenantAwareDomainService } from './tenancy/tenant-aware-domain.service';
import { VeriForgeTenantGuard } from './tenancy/veriforge-tenant.guard';
import { VeriForgeRbacGuard } from './rbac/veriforge-rbac.guard';

@Module({
  controllers: [
    VeriForgeAuthController,
    VeriForgeUsersController,
    VeriForgeTrainingController,
    VeriForgeVerificationController,
    VeriForgeComplianceController,
    VeriForgeSettingsController,
    VeriForgeNotificationsController,
    VeriForgeAssistantController,
    VeriForgeIncidentController,
    VeriForgeAuditController,
    VeriForgeWorkflowController,
    VeriForgeContractorController,
    VeriForgeTenantController,
    VeriForgeRiskController,
    VeriForgeBadgeController,
    VeriForgeCultureController,
    VeriForgeEmergencyController,
    VeriForgeInspectionController,
    VeriForgeSiteSafetyController,
    VeriForgeContractorOnboardingController,
    VeriForgeFieldOperationsController,
    VeriForgeSafetyKpiController,
    VeriForgeEnterpriseArchitectureController,
    VeriForgeBrandExpansionController,
    VeriForgeMotionController,
    VeriForgeIconographyController,
    VeriForgePredictiveController,
    VeriForgeDeploymentController,
    VeriForgeAnimationController,
    VeriForgeReportsController,
    VeriForgeDigitalTwinController,
    VeriForgeSoundController,
    VeriForgeCommandCenterController,
    VeriForgeLedgerController,
  ],
  providers: [

    AuthService,
    UserService,
    TrainingService,
    VerificationService,
    ComplianceService,
    SettingsService,
    NotificationService,
    AssistantService,
    IncidentService,
    AuditEngineService,
    WorkflowBuilderService,
    ContractorService,
    RiskAssessmentService,
    BadgeService,
    SafetyCultureService,
    EmergencyResponseService,
    EquipmentInspectionService,
    SiteSafetyPlanningService,
    ContractorOnboardingService,
    FieldOperationsService,
    SafetyKpiIntelligenceService,
    EnterpriseArchitectureService,
    BrandExpansionService,
    IndustrialMotionService,
    IndustrialIconographyService,
    SafetyAiPredictiveService,
    GlobalDeploymentPlaybookService,
    IndustrialAnimationLibraryService,
    ExecutiveReportingService,
    SafetyDigitalTwinService,
    IndustrialSoundDesignService,
    MultiSiteCommandCenterService,
    SafetyBlockchainLedgerService,
    VeriForgeStoreService,
    TenantRegistryService,
    TenantAuthService,
    TenantIsolationService,
    TenantStorageService,
    TenantScalingService,
    TenantAwareDomainService,
    VeriForgeTenantGuard,
    VeriForgeRbacGuard,
  ],
})
export class VeriForgeApiModule {}
