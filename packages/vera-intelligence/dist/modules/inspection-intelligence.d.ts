import { PredictiveEngine } from "../engines/predictive-engine";
import { AutoClassificationEngine, AutoSummarizationEngine, AutoCorrectionEngine } from "../engines/auto-engines";
import { PatternRecognitionEngine } from "../engines/pattern-engine";
export type InspectionIntelInput = {
    id: string;
    equipmentId: string;
    passed: boolean;
    failureHistory: {
        at: string;
        type: string;
    }[];
    photoHazards?: string[];
};
export declare function analyzeInspection(input: InspectionIntelInput, engines: {
    predictive: PredictiveEngine;
    classify: AutoClassificationEngine;
    summarize: AutoSummarizationEngine;
    correct: AutoCorrectionEngine;
    patterns: PatternRecognitionEngine;
}): {
    id: string;
    failureForecast: import("..").PredictionResult;
    lockoutTrigger: import("..").PredictionResult;
    photoClassification: import("..").ClassificationResult;
    repeatedFailures: import("../engines/pattern-engine").PatternMatch | null;
    summary: import("..").SummaryResult;
    correctiveActions: string[];
};
//# sourceMappingURL=inspection-intelligence.d.ts.map