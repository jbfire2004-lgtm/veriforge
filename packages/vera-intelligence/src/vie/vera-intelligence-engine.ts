import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";
import { PatternRecognitionEngine } from "../engines/pattern-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
import { NaturalLanguageEngine } from "../engines/nlp-engine";
import {
  AutoClassificationEngine,
  AutoTaggingEngine,
  AutoSummarizationEngine,
  AutoCorrectionEngine,
  AutoMappingEngine,
  AutoPrioritizationEngine,
} from "../engines/auto-engines";
import { AutomationEngine } from "../automation/automation-engine";
import type {
  CompanyIntelInput,
  EquipmentIntelInput,
  IntelligenceBundle,
  IntelligenceContext,
  NlpQuery,
  NlpResponse,
  ProjectIntelInput,
  TrainingIntelInput,
  WorkerIntelInput,
} from "../types";
import { analyzeWorker } from "../modules/worker-intelligence";
import { analyzeEquipment } from "../modules/equipment-intelligence";
import { analyzeTraining } from "../modules/training-intelligence";
import { analyzeProvider, type ProviderIntelInput } from "../modules/provider-intelligence";
import { analyzeProject } from "../modules/project-intelligence";
import { analyzeCompany } from "../modules/company-intelligence";
import { analyzeUnionHall, type UnionIntelInput } from "../modules/union-intelligence";
import { analyzeCompliance, type ComplianceIntelInput } from "../modules/compliance-intelligence";
import { analyzeInspection, type InspectionIntelInput } from "../modules/inspection-intelligence";
import { analyzeCompetency, type CompetencyIntelInput } from "../modules/competency-intelligence";
import { analyzeOffline } from "../modules/offline-intelligence";
import { buildDashboardIntel } from "../modules/dashboard-intelligence";

/**
 * Vera Intelligence Engine (VIE) — unified orchestrator for Phase 2 intelligence.
 */
export class VeraIntelligenceEngine {
  readonly predictive = new PredictiveEngine();
  readonly risk = new RiskEngine();
  readonly recommend = new RecommendationEngine();
  readonly patterns = new PatternRecognitionEngine();
  readonly anomaly = new AnomalyDetectionEngine();
  readonly nlp = new NaturalLanguageEngine();
  readonly classify = new AutoClassificationEngine();
  readonly tag = new AutoTaggingEngine();
  readonly summarize = new AutoSummarizationEngine();
  readonly correct = new AutoCorrectionEngine();
  readonly map = new AutoMappingEngine();
  readonly prioritize = new AutoPrioritizationEngine();
  readonly automation = new AutomationEngine();

  constructor() {
    this.automation.registerDefaultRules();
  }

  private coreEngines() {
    return {
      predictive: this.predictive,
      risk: this.risk,
      patterns: this.patterns,
      summarize: this.summarize,
      recommend: this.recommend,
      anomaly: this.anomaly,
      classify: this.classify,
      map: this.map,
      correct: this.correct,
    };
  }

  analyzeWorker(input: WorkerIntelInput) {
    return analyzeWorker(input, this.coreEngines());
  }

  analyzeEquipment(input: EquipmentIntelInput) {
    return analyzeEquipment(input, this.coreEngines());
  }

  analyzeTraining(inputs: TrainingIntelInput[]) {
    return analyzeTraining(inputs, this.coreEngines());
  }

  analyzeProvider(input: ProviderIntelInput) {
    return analyzeProvider(input, {
      risk: this.risk,
      summarize: this.summarize,
      anomaly: this.anomaly,
    });
  }

  analyzeProject(input: ProjectIntelInput) {
    return analyzeProject(input, {
      predictive: this.predictive,
      risk: this.risk,
      summarize: this.summarize,
      recommend: this.recommend,
    });
  }

  analyzeCompany(input: CompanyIntelInput) {
    return analyzeCompany(input, {
      predictive: this.predictive,
      risk: this.risk,
      summarize: this.summarize,
      recommend: this.recommend,
    });
  }

  analyzeUnionHall(input: UnionIntelInput) {
    return analyzeUnionHall(input, {
      predictive: this.predictive,
      risk: this.risk,
      summarize: this.summarize,
    });
  }

  analyzeCompliance(input: ComplianceIntelInput) {
    return analyzeCompliance(input, {
      patterns: this.patterns,
      predictive: this.predictive,
      summarize: this.summarize,
      correct: this.correct,
      anomaly: this.anomaly,
    });
  }

  analyzeInspection(input: InspectionIntelInput) {
    return analyzeInspection(input, {
      predictive: this.predictive,
      classify: this.classify,
      summarize: this.summarize,
      correct: this.correct,
      patterns: this.patterns,
    });
  }

  analyzeCompetency(input: CompetencyIntelInput) {
    return analyzeCompetency(input, {
      predictive: this.predictive,
      summarize: this.summarize,
    });
  }

  analyzeOffline(ctx: IntelligenceContext & Parameters<typeof analyzeOffline>[0]) {
    return analyzeOffline(ctx);
  }

  buildBundle(input: {
    context: IntelligenceContext;
    company?: CompanyIntelInput;
    projects?: ProjectIntelInput[];
    workers?: WorkerIntelInput[];
    equipment?: EquipmentIntelInput[];
    training?: TrainingIntelInput[];
    expiring30?: number;
    expiring60?: number;
  }): IntelligenceBundle {
    this.recommend.reset();
    this.anomaly.reset();

    const worker = input.workers?.[0]
      ? this.analyzeWorker(input.workers[0])
      : undefined;
    const equipment = input.equipment?.[0]
      ? this.analyzeEquipment(input.equipment[0])
      : undefined;
    const training = input.training?.length
      ? this.analyzeTraining(input.training)
      : undefined;
    const company = input.company ? this.analyzeCompany(input.company) : undefined;
    const project = input.projects?.[0]
      ? this.analyzeProject(input.projects[0])
      : undefined;

    const compliance = input.company
      ? this.analyzeCompliance({
          companyId: String(input.company.id),
          failureRate: (100 - input.company.complianceRate) / 100,
          expiryDates: [],
          lockoutCount: input.company.highRiskEquipment,
          invalidTraining: 0,
          missingRequirements: 0,
        })
      : undefined;

    const dashboard = buildDashboardIntel(
      {
        company: input.company,
        projects: input.projects,
        expiring30: input.expiring30,
        expiring60: input.expiring60,
        anomalies: this.anomaly.getAll(),
      },
      {
        risk: this.risk,
        predictive: this.predictive,
        summarize: this.summarize,
        recommend: this.recommend,
      }
    );

    const automationTasks = this.automation.evaluate({
      daysToExpiry: worker?.expiryForecast?.[0]?.metadata?.daysRemaining,
      entityId: worker?.id,
      riskScore: company ? 100 - company.complianceScore.score : 0,
      companyId: input.company?.id,
    });

    return {
      generatedAt: new Date().toISOString(),
      context: input.context,
      worker,
      equipment,
      training,
      company,
      project,
      compliance,
      dashboard,
      recommendations: this.prioritize.prioritize(this.recommend.getAll()),
      anomalies: this.anomaly.getAll(),
      automationTasks: automationTasks.map((t) => ({
        id: t.id,
        type: t.type,
        scheduledAt: t.scheduledAt,
      })),
    };
  }

  ask(text: string, bundle?: IntelligenceBundle): NlpResponse {
    const query: NlpQuery = this.nlp.parse(text);
    return this.nlp.answer(query, bundle);
  }
}
