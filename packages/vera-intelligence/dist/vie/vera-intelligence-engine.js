"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraIntelligenceEngine = void 0;
const predictive_engine_1 = require("../engines/predictive-engine");
const risk_engine_1 = require("../engines/risk-engine");
const recommendation_engine_1 = require("../engines/recommendation-engine");
const pattern_engine_1 = require("../engines/pattern-engine");
const anomaly_engine_1 = require("../engines/anomaly-engine");
const nlp_engine_1 = require("../engines/nlp-engine");
const auto_engines_1 = require("../engines/auto-engines");
const automation_engine_1 = require("../automation/automation-engine");
const worker_intelligence_1 = require("../modules/worker-intelligence");
const equipment_intelligence_1 = require("../modules/equipment-intelligence");
const training_intelligence_1 = require("../modules/training-intelligence");
const provider_intelligence_1 = require("../modules/provider-intelligence");
const project_intelligence_1 = require("../modules/project-intelligence");
const company_intelligence_1 = require("../modules/company-intelligence");
const union_intelligence_1 = require("../modules/union-intelligence");
const compliance_intelligence_1 = require("../modules/compliance-intelligence");
const inspection_intelligence_1 = require("../modules/inspection-intelligence");
const competency_intelligence_1 = require("../modules/competency-intelligence");
const offline_intelligence_1 = require("../modules/offline-intelligence");
const dashboard_intelligence_1 = require("../modules/dashboard-intelligence");
/**
 * Vera Intelligence Engine (VIE) — unified orchestrator for Phase 2 intelligence.
 */
class VeraIntelligenceEngine {
    constructor() {
        this.predictive = new predictive_engine_1.PredictiveEngine();
        this.risk = new risk_engine_1.RiskEngine();
        this.recommend = new recommendation_engine_1.RecommendationEngine();
        this.patterns = new pattern_engine_1.PatternRecognitionEngine();
        this.anomaly = new anomaly_engine_1.AnomalyDetectionEngine();
        this.nlp = new nlp_engine_1.NaturalLanguageEngine();
        this.classify = new auto_engines_1.AutoClassificationEngine();
        this.tag = new auto_engines_1.AutoTaggingEngine();
        this.summarize = new auto_engines_1.AutoSummarizationEngine();
        this.correct = new auto_engines_1.AutoCorrectionEngine();
        this.map = new auto_engines_1.AutoMappingEngine();
        this.prioritize = new auto_engines_1.AutoPrioritizationEngine();
        this.automation = new automation_engine_1.AutomationEngine();
        this.automation.registerDefaultRules();
    }
    coreEngines() {
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
    analyzeWorker(input) {
        return (0, worker_intelligence_1.analyzeWorker)(input, this.coreEngines());
    }
    analyzeEquipment(input) {
        return (0, equipment_intelligence_1.analyzeEquipment)(input, this.coreEngines());
    }
    analyzeTraining(inputs) {
        return (0, training_intelligence_1.analyzeTraining)(inputs, this.coreEngines());
    }
    analyzeProvider(input) {
        return (0, provider_intelligence_1.analyzeProvider)(input, {
            risk: this.risk,
            summarize: this.summarize,
            anomaly: this.anomaly,
        });
    }
    analyzeProject(input) {
        return (0, project_intelligence_1.analyzeProject)(input, {
            predictive: this.predictive,
            risk: this.risk,
            summarize: this.summarize,
            recommend: this.recommend,
        });
    }
    analyzeCompany(input) {
        return (0, company_intelligence_1.analyzeCompany)(input, {
            predictive: this.predictive,
            risk: this.risk,
            summarize: this.summarize,
            recommend: this.recommend,
        });
    }
    analyzeUnionHall(input) {
        return (0, union_intelligence_1.analyzeUnionHall)(input, {
            predictive: this.predictive,
            risk: this.risk,
            summarize: this.summarize,
        });
    }
    analyzeCompliance(input) {
        return (0, compliance_intelligence_1.analyzeCompliance)(input, {
            patterns: this.patterns,
            predictive: this.predictive,
            summarize: this.summarize,
            correct: this.correct,
            anomaly: this.anomaly,
        });
    }
    analyzeInspection(input) {
        return (0, inspection_intelligence_1.analyzeInspection)(input, {
            predictive: this.predictive,
            classify: this.classify,
            summarize: this.summarize,
            correct: this.correct,
            patterns: this.patterns,
        });
    }
    analyzeCompetency(input) {
        return (0, competency_intelligence_1.analyzeCompetency)(input, {
            predictive: this.predictive,
            summarize: this.summarize,
        });
    }
    analyzeOffline(ctx) {
        return (0, offline_intelligence_1.analyzeOffline)(ctx);
    }
    buildBundle(input) {
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
        const dashboard = (0, dashboard_intelligence_1.buildDashboardIntel)({
            company: input.company,
            projects: input.projects,
            expiring30: input.expiring30,
            expiring60: input.expiring60,
            anomalies: this.anomaly.getAll(),
        }, {
            risk: this.risk,
            predictive: this.predictive,
            summarize: this.summarize,
            recommend: this.recommend,
        });
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
    ask(text, bundle) {
        const query = this.nlp.parse(text);
        return this.nlp.answer(query, bundle);
    }
}
exports.VeraIntelligenceEngine = VeraIntelligenceEngine;
//# sourceMappingURL=vera-intelligence-engine.js.map