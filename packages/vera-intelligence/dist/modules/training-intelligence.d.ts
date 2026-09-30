import type { TrainingIntelInput } from "../types";
import { AutoClassificationEngine, AutoMappingEngine, AutoSummarizationEngine } from "../engines/auto-engines";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";
export declare function analyzeTraining(inputs: TrainingIntelInput[], engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    classify: AutoClassificationEngine;
    map: AutoMappingEngine;
    summarize: AutoSummarizationEngine;
    anomaly: AnomalyDetectionEngine;
    recommend: RecommendationEngine;
}): {
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
//# sourceMappingURL=training-intelligence.d.ts.map