import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Phase1MonitoringModule } from './common/monitoring/phase1-monitoring.module';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './prisma/prisma.module';
import { VeriAgentModule } from './veri-agent/veri-agent.module';

// Core Data Modules (stable)
import { WorkersModule } from './workers/workers.module';
import { CompaniesModule } from './companies/companies.module';
import { TrainingRecordsModule } from './training-records/training-records.module';
import { DocumentsModule } from './documents/documents.module';
import { CertificationsModule } from './certifications/certifications.module';
import { ProvidersModule } from './providers/providers.module';

// Safety Verification System (required for demo)
import { RuleEngineModule } from './rules/rule-engine.module';
import { VerificationModule } from './verification/verification.module';

// Compliance Engine (stable)
import { ComplianceModule } from './compliance/compliance.module';

// NEW — Training Requirements Module
import { TrainingRequirementsModule } from './training-requirements/training-requirements.module';

// NEW — Access Module (QR site entry)
import { AccessModule } from './access/access.module';

// NEW — Training Dashboard Module
import { TrainingDashboardModule } from './training-dashboard/training-dashboard.module';

// Equipment ↔ certification requirements (Prisma: EquipmentTrainingRequirement)
import { EquipmentTrainingRequirementsModule } from './equipment-training-requirements/equipment-training-requirements.module';
import { TrainingIngestionModule } from './training-ingestion/training-ingestion.module';
import { CredentialLedgerModule } from './modules/credential-ledger/credential-ledger.module';
import { ProjectComplianceModule } from './modules/project-compliance/project-compliance.module';
import { Phase1DashboardModule } from './phase1-dashboard/phase1-dashboard.module';

// Phase 1 contract-required modules: equipment CRUD, equipment-assignments,
// QR scan endpoint, and the aggregate /training endpoint used by dashboards.
// Their controllers/services already existed; they were just not registered.
import { EquipmentModule } from './equipment/equipment.module';
import { EquipmentAssignmentsModule } from './equipment-assignments/equipment-assignments.module';
import { QrModule } from './qr/qr.module';
import { TrainingModule } from './training/training.module';
import { TrainingVerificationModule } from './services/training-verification.module';
import { ProviderSyncEngineModule } from './modules/provider-sync-engine/provider-sync-engine.module';
import { MatrixModule } from './training/matrix.module';
import { IncidentsModule } from './incidents/incidents.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { SafetyWorkflowModule } from './safety-workflow/safety-workflow.module';
import { SitesModule } from './modules/sites/sites.module';
import { SiteContactsModule } from './modules/site-contacts/site-contacts.module';
import { CoreUploadModule } from './modules/core-upload/core-upload.module';
import { PmSafetyWorkflowModule } from './pm-safety-workflow/pm-safety-workflow.module';
import { SafetyFormsModule } from './forms/safety-forms.module';
import { SafetyIntelligenceModule } from './safety-intelligence/safety-intelligence.module';
import { SafetyManagementModule } from './safety-management/safety-management.module';
import { JhaFlhaModule } from './jha-flha/jha-flha.module';
import { SifHecaModule } from './sif-heca/sif-heca.module';
import { FallClearanceModule } from './fall-clearance/fall-clearance.module';
import { SafetyProgramIngestionModule } from './safety-program-ingestion/safety-program-ingestion.module';
import { PmWorkAtHeightsModule } from './pm-work-at-heights/pm-work-at-heights.module';
import { SafetySuiteModule } from './safety-suite/safety-suite.module';
import { PmInspectionsModule } from './pm-inspections/pm-inspections.module';
import { PmSafetyEventsModule } from './pm-safety-events/pm-safety-events.module';
import { PmSubstanceTestingModule } from './pm-substance-testing/pm-substance-testing.module';
import { PmPredictiveSafetyAnalyticsModule } from './pm-predictive-safety-analytics/pm-predictive-safety-analytics.module';
import { PmContractorPortalModule } from './pm-contractor-portal/pm-contractor-portal.module';
import { PmSafetyHubModule } from './pm-safety-hub/pm-safety-hub.module';
import { PmSmsCoreModule } from './pm-sms-core/pm-sms-core.module';
import { PmSafetyEcosystemModule } from './pm-safety-ecosystem/pm-safety-ecosystem.module';
import { PmCorrectiveActionsModule } from './pm-corrective-actions/pm-corrective-actions.module';
import { PmSafetyMeetingsModule } from './pm-safety-meetings/pm-safety-meetings.module';
import { PmDocumentControlModule } from './pm-document-control/pm-document-control.module';
import { PmEquipmentSafetyModule } from './pm-equipment-safety/pm-equipment-safety.module';
import { PmEmergencyResponseModule } from './pm-emergency-response/pm-emergency-response.module';
import { PmSiteAccessControlModule } from './pm-site-access-control/pm-site-access-control.module';
import { PmAttachmentsMediaModule } from './pm-attachments-media/pm-attachments-media.module';
import { PmOfflineModeModule } from './pm-offline-mode/pm-offline-mode.module';
import { PmSafetyStationsModule } from './pm-safety-stations/pm-safety-stations.module';
import { PmProjectSafetyContextModule } from './pm-project-safety-context/pm-project-safety-context.module';
import { PmCompanySafetyContextModule } from './pm-company-safety-context/pm-company-safety-context.module';
import { PmWorkerSafetyProfileModule } from './pm-worker-safety-profile/pm-worker-safety-profile.module';
import { PmTrainingModule } from './pm-training/pm-training.module';
import { PmProjectManagementModule } from './pm-project-management/pm-project-management.module';
import { PmPermitsModule } from './pm-permits/pm-permits.module';
import { AiModule } from './ai/ai.module';
import { PmUnifiedHazardControlModule } from './pm-unified-hazard-control/pm-unified-hazard-control.module';
import { PmUnifiedCorrectiveActionModule } from './pm-unified-corrective-action/pm-unified-corrective-action.module';
import { PmUnifiedSafetyIntelligenceModule } from './pm-unified-safety-intelligence/pm-unified-safety-intelligence.module';
import { CoreActionItemsModule } from './modules/core-action-items/core-action-items.module';
import { SafetyObservationModule } from './modules/safety-observation/safety-observation.module';
import { CoreMeetingRecordModule } from './modules/core-meeting-record/core-meeting-record.module';
import { CoreComplianceNoteModule } from './modules/core-compliance-note/core-compliance-note.module';
import { CoreDailyLogModule } from './modules/core-daily-log/core-daily-log.module';
import { CoreSiteRiskModule } from './modules/core-site-risk/core-site-risk.module';
import { SafetyStationModule } from './safety-station/safety-station.module';
import { SafetyMapModule } from './safety-map/safety-map.module';
import { LegacyCompatController } from './legacy/legacy-compat.controller';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AcpModule } from './acp/acp.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WorkerWalletModule } from './worker-wallet/worker-wallet.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { VeraCoreModule } from './modules/vera-core/vera-core.module';
import { EquipmentCoreModule } from './modules/equipment-core/equipment-core.module';
import { CompetencyModule } from './modules/competency/competency.module';
import { InspectionCoreModule } from './modules/inspection-core/inspection-core.module';
import { EquipmentComplianceModule } from './modules/equipment-compliance/equipment-compliance.module';
import { EquipmentWalletModule } from './modules/equipment-wallet/equipment-wallet.module';
import { ToolsPpeCoreModule } from './modules/tools-ppe-core/tools-ppe-core.module';
import { MaintenanceCalibrationCoreModule } from './modules/maintenance-calibration-core/maintenance-calibration-core.module';
import { ReportingCoreModule } from './modules/reporting-core/reporting-core.module';
import { DashboardWidgetsModule } from './modules/dashboard-widgets/dashboard-widgets.module';
import { FieldSyncModule } from './modules/field-sync/field-sync.module';
import { ApiPlatformModule } from './modules/api-platform/api-platform.module';
import { VeraEventBusModule } from './modules/vera-event-bus/vera-event-bus.module';
import { HealthModule } from './health/health.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { VisionModule } from './modules/vision/vision.module';
import { DigitalTwinModule } from './modules/digital-twin/digital-twin.module';
import { AutonomousSafetyModule } from './modules/autonomous-safety/autonomous-safety.module';
import { PredictiveSchedulingModule } from './modules/predictive-scheduling/predictive-scheduling.module';
import { AutonomousOperationsModule } from './modules/autonomous-operations/autonomous-operations.module';
import { EnterpriseAutomationModule } from './modules/enterprise-automation/enterprise-automation.module';
import { CommandCenterModule } from './modules/command-center/command-center.module';
import { EnterpriseBrainModule } from './modules/enterprise-brain/enterprise-brain.module';
import { GlobalNetworkModule } from './modules/global-network/global-network.module';
import { IndustryEcosystemModule } from './modules/industry-ecosystem/industry-ecosystem.module';
import { HubIndustrySafetyModule } from './modules/hub-industry-safety/hub-industry-safety.module';
import { VerisuiteSmsModule } from './verisuite-sms/verisuite-sms.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { InterplanetaryModule } from './modules/interplanetary/interplanetary.module';
import { InterstellarModule } from './modules/interstellar/interstellar.module';
import { CivilizationModule } from './modules/civilization/civilization.module';
import { NotificationEngineModule } from './modules/notification-engine/notification-engine.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TrainingProviderCoreModule } from './modules/training-provider-core/training-provider-core.module';
import { TrainingStandardsComplianceModule } from './modules/training-standards-compliance/training-standards-compliance.module';
import { TrainingCredentialNftModule } from './modules/training-credential-nft/training-credential-nft.module';
import { VeraHubHomepageModule } from './modules/vera-hub-homepage/vera-hub-homepage.module';
import { VeraHubProfileModule } from './modules/vera-hub-profile/vera-hub-profile.module';
import { VeraFeedEngineModule } from './modules/vera-feed-engine/vera-feed-engine.module';
import { VeraSafetyBlogModule } from './modules/vera-safety-blog/vera-safety-blog.module';
import { VeraExpertQaModule } from './modules/vera-expert-qa/vera-expert-qa.module';
import { VeraJobBoardModule } from './modules/vera-job-board/vera-job-board.module';
import { VeraSocialModule } from './modules/vera-social/vera-social.module';
import { VeraSeoEngineModule } from './modules/vera-seo-engine/vera-seo-engine.module';
import { VeraModerationModule } from './modules/vera-moderation/vera-moderation.module';
import { WeatherAlertModule } from './modules/weather-alert/weather-alert.module';
import { VeraSocialFeedModule } from './modules/vera-social-feed/vera-social-feed.module';
import { AdoptionAnalyticsModule } from './modules/adoption-analytics/adoption-analytics.module';
import { AdminSubscriptionsModule } from './modules/admin-subscriptions/admin-subscriptions.module';
import { OrientationModule } from './modules/orientation/orientation.module';
import { AssessmentEnginesModule } from './modules/assessment-engines/assessment-engines.module';
import { SafetyKnowledgeModule } from './modules/safety-knowledge/safety-knowledge.module';
import { FitTestModule } from './modules/fit-test/fit-test.module';
import { RenewalBookingModule } from './modules/renewal-booking/renewal-booking.module';
import { VendorIntegrationModule } from './modules/vendor-integration/vendor-integration.module';
import { VeriForgeApiModule } from './modules/veriforge-api/veriforge-api.module';
import { EventsModule } from './common/events/events.module';
import { SecurityModule } from './security/security.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { PermissionGuard } from './security/guards/permission.guard';
import { TenantIsolationGuard } from './security/guards/tenant-isolation.guard';
import { OriginGuard } from './security/guards/origin.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({ ttl: 60, limit: 120 }),
    PrismaModule,
    EventsModule,
    AuditModule,
    VeriAgentModule,
    Phase1MonitoringModule,
    SecurityModule,

    AuthModule,
    AdminModule,
    AcpModule,
    SubscriptionsModule,
    WorkerWalletModule,
    SupervisorModule,

    // Core Data
    WorkersModule,
    CompaniesModule,
    TrainingRecordsModule,
    DocumentsModule,
    CertificationsModule,
    ProvidersModule,

    // Compliance + Verification
    ComplianceModule,
    RuleEngineModule,
    VerificationModule,

    // Safety incidents & workflow
    IncidentsModule,
    InvestigationsModule,
    SafetyWorkflowModule,

    // NEW
    AccessModule,
    TrainingRequirementsModule,
    TrainingDashboardModule,
    EquipmentTrainingRequirementsModule,
    TrainingIngestionModule,
    CredentialLedgerModule,
    ProjectComplianceModule,
    Phase1DashboardModule,

    // Phase 1 contract surfaces previously not registered.
    EquipmentModule,
    EquipmentAssignmentsModule,
    QrModule,
    TrainingModule,
    TrainingVerificationModule,
    ProviderSyncEngineModule,
    MatrixModule,

    // Versioned REST (VERA /api/v1)
    SitesModule,
    SiteContactsModule,
    CoreUploadModule,
    PmSafetyWorkflowModule,
    SafetyFormsModule,
    SafetyIntelligenceModule,
    SafetyManagementModule,
    JhaFlhaModule,
    SifHecaModule,
    FallClearanceModule,
    SafetyProgramIngestionModule,
    PmWorkAtHeightsModule,
    SafetySuiteModule,
    PmSafetyEcosystemModule,
    PmInspectionsModule,
    PmSafetyEventsModule,
    PmSubstanceTestingModule,
    PmPredictiveSafetyAnalyticsModule,
    PmContractorPortalModule,
    PmSafetyHubModule,
    PmSmsCoreModule,
    PmCorrectiveActionsModule,
    PmSafetyMeetingsModule,
    PmDocumentControlModule,
    PmEquipmentSafetyModule,
    PmEmergencyResponseModule,
    PmSiteAccessControlModule,
    PmAttachmentsMediaModule,
    PmOfflineModeModule,
    PmSafetyStationsModule,
    PmProjectSafetyContextModule,
    PmCompanySafetyContextModule,
    PmWorkerSafetyProfileModule,
    PmTrainingModule,
    PmProjectManagementModule,
    PmPermitsModule,
    AiModule,
    PmUnifiedHazardControlModule,
    PmUnifiedCorrectiveActionModule,
    PmUnifiedSafetyIntelligenceModule,
    CoreActionItemsModule,
    SafetyObservationModule,
    CoreMeetingRecordModule,
    CoreComplianceNoteModule,
    CoreDailyLogModule,
    CoreSiteRiskModule,
    SafetyStationModule,
    SafetyMapModule,
    VeraCoreModule,
    EquipmentCoreModule,
    CompetencyModule,
    InspectionCoreModule,
    EquipmentComplianceModule,
    EquipmentWalletModule,
    ToolsPpeCoreModule,
    MaintenanceCalibrationCoreModule,
    ReportingCoreModule,
    DashboardWidgetsModule,
    FieldSyncModule,
    VeraEventBusModule,
    HealthModule,
    ApiPlatformModule,
    IntelligenceModule,
    VisionModule,
    DigitalTwinModule,
    AutonomousSafetyModule,
    PredictiveSchedulingModule,
    AutonomousOperationsModule,
    EnterpriseAutomationModule,
    CommandCenterModule,
    EnterpriseBrainModule,
    GlobalNetworkModule,
    IndustryEcosystemModule,
    HubIndustrySafetyModule,
    VerisuiteSmsModule,
    MarketplaceModule,
    InterplanetaryModule,
    InterstellarModule,
    CivilizationModule,
    NotificationEngineModule,
    AnalyticsModule,
    TrainingProviderCoreModule,
    TrainingStandardsComplianceModule,
    TrainingCredentialNftModule,
    VeraFeedEngineModule,
    VeraSafetyBlogModule,
    VeraExpertQaModule,
    VeraJobBoardModule,
    VeraSocialModule,
    VeraSeoEngineModule,
    VeraModerationModule,
    VeraHubHomepageModule,
    VeraHubProfileModule,
    WeatherAlertModule,
    VeraSocialFeedModule,
    AdoptionAnalyticsModule,
    AdminSubscriptionsModule,
    OrientationModule,
    AssessmentEnginesModule,
    SafetyKnowledgeModule,
    FitTestModule,
    RenewalBookingModule,
    VendorIntegrationModule,
    VeriForgeApiModule,
  ],
  controllers: [AppController, LegacyCompatController],
  providers: [
    AppService,
    // Global guards run in registration order — authenticate before permission/tenant checks.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_GUARD, useClass: TenantIsolationGuard },
  ],
})
export class AppModule {}
