import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VerisuiteSmsController } from './controllers/verisuite-sms.controller';
import { PlaneScopeGuard } from './guards/plane-scope.guard';
import { SmsAuditService } from './common/sms-audit.service';
import { SmsAnonymizationService } from './common/sms-anonymization.service';
import { SmsPerformanceCache } from './common/sms-performance-cache';
import { SmsIdempotencyService } from './common/sms-idempotency.service';
import { SmsDataIngestionPipeline } from './engines/data-ingestion.pipeline';
import { IndustryBenchmarkEngine } from './engines/industry-benchmark.engine';
import { RegionalDrilldownEngine } from './engines/regional-drilldown.engine';
import { CrossPageIntelligenceEngine } from './engines/cross-page-intelligence.engine';
import { AiInsightsCacheService } from './services/ai-insights-cache.service';
import { IncidentInvestigationService } from './services/incident-investigation.service';
import { ErpGenerationService } from './services/erp-generation.service';
import { JhaTemplateService } from './services/jha-template.service';
import { FlhaScoringService } from './services/flha-scoring.service';
import { InspectionTrendService } from './services/inspection-trend.service';
import { CompetencyCorrelationService } from './services/competency-correlation.service';
import { SmsDashboardService } from './services/sms-dashboard.service';
import { SmsFlhaApiService } from './services/sms-flha-api.service';
import { SmsJhaApiService } from './services/sms-jha-api.service';
import { SmsEmsErpApiService } from './services/sms-ems-erp-api.service';
import { ErpDrillService } from './services/erp-drill.service';
import { SmsInspectionsApiService } from './services/sms-inspections-api.service';
import { SmsMeetingsApiService } from './services/sms-meetings-api.service';
import { SmsActionsApiService } from './services/sms-actions-api.service';
import { SmsAiOrchestratorService } from './services/sms-ai-orchestrator.service';
import { SmsProductionOpsService } from './services/sms-production-ops.service';
import { SmsDataRetentionService } from './services/sms-data-retention.service';
import { SmsPostLaunchMonitoringService } from './ops/sms-post-launch-monitoring.service';

@Module({
  imports: [PrismaModule],
  controllers: [VerisuiteSmsController],
  providers: [
    PlaneScopeGuard,
    SmsProductionOpsService,
    SmsDataRetentionService,
    SmsPostLaunchMonitoringService,
    SmsAuditService,
    SmsAnonymizationService,
    SmsPerformanceCache,
    SmsIdempotencyService,
    SmsDataIngestionPipeline,
    IndustryBenchmarkEngine,
    RegionalDrilldownEngine,
    CrossPageIntelligenceEngine,
    AiInsightsCacheService,
    IncidentInvestigationService,
    ErpGenerationService,
    JhaTemplateService,
    FlhaScoringService,
    InspectionTrendService,
    CompetencyCorrelationService,
    SmsDashboardService,
    SmsFlhaApiService,
    SmsJhaApiService,
    SmsEmsErpApiService,
    ErpDrillService,
    SmsInspectionsApiService,
    SmsMeetingsApiService,
    SmsActionsApiService,
    SmsAiOrchestratorService,
  ],
  exports: [
    SmsDataIngestionPipeline,
    IndustryBenchmarkEngine,
    RegionalDrilldownEngine,
    CrossPageIntelligenceEngine,
    AiInsightsCacheService,
    IncidentInvestigationService,
    ErpGenerationService,
    JhaTemplateService,
    FlhaScoringService,
    InspectionTrendService,
    CompetencyCorrelationService,
    SmsAuditService,
    SmsAnonymizationService,
    SmsDashboardService,
    SmsFlhaApiService,
    SmsJhaApiService,
    SmsEmsErpApiService,
    ErpDrillService,
    SmsInspectionsApiService,
    SmsMeetingsApiService,
    SmsActionsApiService,
    SmsAiOrchestratorService,
    SmsProductionOpsService,
    SmsDataRetentionService,
    SmsPostLaunchMonitoringService,
  ],
})
export class VerisuiteSmsModule {}
