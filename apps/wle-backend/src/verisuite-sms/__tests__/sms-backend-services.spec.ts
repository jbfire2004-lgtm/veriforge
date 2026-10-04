/**
 * Contract: all required VeriSuite SMS backend engines/services are registered
 * and export the expected public surface (Final Engineering Build Plan).
 */
import { VerisuiteSmsModule } from '../verisuite-sms.module';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import { IndustryBenchmarkEngine } from '../engines/industry-benchmark.engine';
import { RegionalDrilldownEngine } from '../engines/regional-drilldown.engine';
import { CrossPageIntelligenceEngine } from '../engines/cross-page-intelligence.engine';
import { AiInsightsCacheService } from '../services/ai-insights-cache.service';
import { IncidentInvestigationService } from '../services/incident-investigation.service';
import { ErpGenerationService } from '../services/erp-generation.service';
import { JhaTemplateService } from '../services/jha-template.service';
import { FlhaScoringService } from '../services/flha-scoring.service';
import { InspectionTrendService } from '../services/inspection-trend.service';
import { CompetencyCorrelationService } from '../services/competency-correlation.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { PlaneScopeGuard } from '../guards/plane-scope.guard';
import { SMS_K_ANONYMITY, SMS_AGGREGATE_CACHE_TTL_MS, SMS_ROLES } from '../constants';

describe('SMS backend services · required surface', () => {
  const providers = Reflect.getMetadata('providers', VerisuiteSmsModule) as
    | unknown[]
    | undefined;

  const required = [
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
    SmsPerformanceCache,
    PlaneScopeGuard,
  ];

  it('registers every required engine and service on VerisuiteSmsModule', () => {
    expect(providers?.length).toBeGreaterThan(0);
    for (const token of required) {
      expect(providers).toEqual(expect.arrayContaining([token]));
    }
  });

  it('exposes expected public methods on each service prototype', () => {
    expect(typeof SmsDataIngestionPipeline.prototype.enqueue).toBe('function');
    expect(typeof SmsDataIngestionPipeline.prototype.processBatch).toBe('function');
    expect(typeof SmsDataIngestionPipeline.prototype.recomputeCompany).toBe(
      'function',
    );
    expect(typeof IndustryBenchmarkEngine.prototype.getIndustryCompare).toBe(
      'function',
    );
    expect(typeof IndustryBenchmarkEngine.prototype.recomputeCohort).toBe(
      'function',
    );
    expect(typeof RegionalDrilldownEngine.prototype.getTree).toBe('function');
    expect(typeof RegionalDrilldownEngine.prototype.getMetrics).toBe('function');
    expect(typeof RegionalDrilldownEngine.prototype.rollupFromProjects).toBe(
      'function',
    );
    expect(typeof CrossPageIntelligenceEngine.prototype.homeInsights).toBe(
      'function',
    );
    expect(typeof CrossPageIntelligenceEngine.prototype.pageInsights).toBe(
      'function',
    );
    expect(typeof AiInsightsCacheService.prototype.getOrCompute).toBe('function');
    expect(typeof AiInsightsCacheService.prototype.accept).toBe('function');
    expect(typeof AiInsightsCacheService.prototype.dismiss).toBe('function');
    expect(typeof IncidentInvestigationService.prototype.create).toBe('function');
    expect(
      typeof IncidentInvestigationService.prototype.getInvestigationPackage,
    ).toBe('function');
    expect(typeof ErpGenerationService.prototype.generate).toBe('function');
    expect(typeof ErpGenerationService.prototype.simulate).toBe('function');
    expect(typeof JhaTemplateService.prototype.suggest).toBe('function');
    expect(typeof JhaTemplateService.prototype.riskRank).toBe('function');
    expect(typeof FlhaScoringService.prototype.score).toBe('function');
    expect(typeof InspectionTrendService.prototype.trends).toBe('function');
    expect(typeof InspectionTrendService.prototype.focusPacks).toBe('function');
    expect(typeof CompetencyCorrelationService.prototype.metrics).toBe('function');
    expect(typeof CompetencyCorrelationService.prototype.forecast).toBe('function');
  });

  it('locks cross-cutting constants for RBAC / anonymization / performance', () => {
    expect(SMS_K_ANONYMITY).toBe(5);
    expect(SMS_AGGREGATE_CACHE_TTL_MS).toBe(45_000);
    expect(SMS_ROLES.READ.length).toBeGreaterThan(0);
    expect(SMS_ROLES.WRITE).toEqual(
      expect.arrayContaining(['COMPANY_ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']),
    );
  });
});
