import { PatternRecognitionEngine } from "../engines/pattern-engine";
import { AutoSummarizationEngine, AutoCorrectionEngine } from "../engines/auto-engines";
import { PredictiveEngine } from "../engines/predictive-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
export type ComplianceIntelInput = {
    companyId: string;
    failureRate: number;
    expiryDates: string[];
    lockoutCount: number;
    invalidTraining: number;
    missingRequirements: number;
};
export declare function analyzeCompliance(input: ComplianceIntelInput, engines: {
    patterns: PatternRecognitionEngine;
    predictive: PredictiveEngine;
    summarize: AutoSummarizationEngine;
    correct: AutoCorrectionEngine;
    anomaly: AnomalyDetectionEngine;
}): {
    failurePrediction: import("..").PredictionResult;
    expiryCluster: import("../engines/pattern-engine").PatternMatch | null;
    lockoutCluster: {
        detected: boolean;
        count: number;
    } | null;
    correctiveActions: string[];
    summary: import("..").SummaryResult;
};
//# sourceMappingURL=compliance-intelligence.d.ts.map