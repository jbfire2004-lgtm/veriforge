import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";
import { PatternRecognitionEngine } from "../engines/pattern-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
import { NaturalLanguageEngine } from "../engines/nlp-engine";
import { AutoClassificationEngine, AutoTaggingEngine, AutoSummarizationEngine, AutoCorrectionEngine, AutoMappingEngine, AutoPrioritizationEngine } from "../engines/auto-engines";
import { AutomationEngine } from "../automation/automation-engine";
import type { CompanyIntelInput, EquipmentIntelInput, IntelligenceBundle, IntelligenceContext, NlpResponse, ProjectIntelInput, TrainingIntelInput, WorkerIntelInput } from "../types";
import { type ProviderIntelInput } from "../modules/provider-intelligence";
import { type UnionIntelInput } from "../modules/union-intelligence";
import { type ComplianceIntelInput } from "../modules/compliance-intelligence";
import { type InspectionIntelInput } from "../modules/inspection-intelligence";
import { type CompetencyIntelInput } from "../modules/competency-intelligence";
import { analyzeOffline } from "../modules/offline-intelligence";
/**
 * Vera Intelligence Engine (VIE) — unified orchestrator for Phase 2 intelligence.
 */
export declare class VeraIntelligenceEngine {
    readonly predictive: PredictiveEngine;
    readonly risk: RiskEngine;
    readonly recommend: RecommendationEngine;
    readonly patterns: PatternRecognitionEngine;
    readonly anomaly: AnomalyDetectionEngine;
    readonly nlp: NaturalLanguageEngine;
    readonly classify: AutoClassificationEngine;
    readonly tag: AutoTaggingEngine;
    readonly summarize: AutoSummarizationEngine;
    readonly correct: AutoCorrectionEngine;
    readonly map: AutoMappingEngine;
    readonly prioritize: AutoPrioritizationEngine;
    readonly automation: AutomationEngine;
    constructor();
    private coreEngines;
    analyzeWorker(input: WorkerIntelInput): {
        id: string;
        name: string;
        complianceRisk: import("../types").ScoreResult;
        readiness: import("../types").ScoreResult;
        expiryForecast: import("../types").PredictionResult[];
        skillGaps: number;
        missingTraining: boolean;
        summary: import("../types").SummaryResult;
        suggestedTraining: string[];
        suggestedProjects: string[];
    };
    analyzeEquipment(input: EquipmentIntelInput): {
        id: string;
        name: string;
        lockoutRisk: import("../types").ScoreResult;
        readiness: import("../types").ScoreResult;
        inspectionFailure: import("../types").PredictionResult;
        maintenanceSchedule: import("../types").PredictionResult[];
        overdueInspection: boolean;
        competencyGaps: number;
        summary: import("../types").SummaryResult;
        suggestedMaintenance: string[];
    };
    analyzeTraining(inputs: TrainingIntelInput[]): {
        classifications: import("../types").ClassificationResult[];
        gapDetection: {
            trainingId: string;
            gap: string;
        }[];
        fraudRisk: import("../types").ScoreResult;
        expiryForecasts: import("../types").PredictionResult[];
        providerQuality: {
            score: number;
            sampleSize: number;
        } | undefined;
        summary: import("../types").SummaryResult;
        suggestedRequired: string[];
    };
    analyzeProvider(input: ProviderIntelInput): {
        id: string;
        name: string;
        reliability: import("../types").ScoreResult;
        instructorScore: number;
        courseQuality: number;
        approvalForecast: {
            days: number;
            likely: boolean;
        } | undefined;
        summary: import("../types").SummaryResult;
    };
    analyzeProject(input: ProjectIntelInput): {
        id: string;
        name: string;
        readiness: import("../types").ScoreResult;
        risk: import("../types").ScoreResult;
        predictions: {
            workerShortage: import("../types").PredictionResult;
            complianceFailure: import("../types").PredictionResult;
        };
        staffingGaps: {
            workers: number;
            equipment: number;
            training: number;
        };
        summary: import("../types").SummaryResult;
        suggestedStaffing: string[];
    };
    analyzeCompany(input: CompanyIntelInput): {
        id: string;
        name: string;
        complianceScore: import("../types").ScoreResult;
        complianceForecast: import("../types").PredictionResult;
        trainingBudgetForecast: {
            expiringCount: number;
            estimatedRenewals: number;
        };
        workforcePlanning: {
            highRiskWorkers: number;
            highRiskEquipment: number;
        };
        summary: import("../types").SummaryResult;
        improvements: string[];
    };
    analyzeUnionHall(input: UnionIntelInput): {
        hallId: string;
        dispatchReadiness: import("../types").ScoreResult;
        dispatchForecast: import("../types").PredictionResult;
        memberShortage: import("../types").PredictionResult;
        trainingNeeds: number;
        dispatchConflicts: number;
        summary: import("../types").SummaryResult;
        suggestedDispatchList: string[];
    };
    analyzeCompliance(input: ComplianceIntelInput): {
        failurePrediction: import("../types").PredictionResult;
        expiryCluster: import("../engines/pattern-engine").PatternMatch | null;
        lockoutCluster: {
            detected: boolean;
            count: number;
        } | null;
        correctiveActions: string[];
        summary: import("../types").SummaryResult;
    };
    analyzeInspection(input: InspectionIntelInput): {
        id: string;
        failureForecast: import("../types").PredictionResult;
        lockoutTrigger: import("../types").PredictionResult;
        photoClassification: import("../types").ClassificationResult;
        repeatedFailures: import("../engines/pattern-engine").PatternMatch | null;
        summary: import("../types").SummaryResult;
        correctiveActions: string[];
    };
    analyzeCompetency(input: CompetencyIntelInput): {
        workerId: string;
        expiryForecast: import("../types").PredictionResult[];
        failureForecast: import("../types").PredictionResult;
        summary: import("../types").SummaryResult;
        suggestedTraining: string[];
        suggestedEquipment: string[];
    };
    analyzeOffline(ctx: IntelligenceContext & Parameters<typeof analyzeOffline>[0]): {
        qrIntelligence: {
            payload: string;
            verified: boolean;
        } | null;
        complianceCheck: {
            ok: boolean;
        };
        riskScore: import("../types").ScoreResult;
        readiness: import("../types").ScoreResult;
        anomalies: import("../types").Anomaly[];
        summary: import("../types").SummaryResult;
        classification: import("../types").ClassificationResult | undefined;
    };
    buildBundle(input: {
        context: IntelligenceContext;
        company?: CompanyIntelInput;
        projects?: ProjectIntelInput[];
        workers?: WorkerIntelInput[];
        equipment?: EquipmentIntelInput[];
        training?: TrainingIntelInput[];
        expiring30?: number;
        expiring60?: number;
    }): IntelligenceBundle;
    ask(text: string, bundle?: IntelligenceBundle): NlpResponse;
}
//# sourceMappingURL=vera-intelligence-engine.d.ts.map