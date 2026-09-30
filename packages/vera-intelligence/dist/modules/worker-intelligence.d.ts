import type { WorkerIntelInput } from "../types";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { PatternRecognitionEngine } from "../engines/pattern-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RecommendationEngine } from "../engines/recommendation-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
export declare function analyzeWorker(input: WorkerIntelInput, engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    patterns: PatternRecognitionEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
    anomaly: AnomalyDetectionEngine;
}): {
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
//# sourceMappingURL=worker-intelligence.d.ts.map