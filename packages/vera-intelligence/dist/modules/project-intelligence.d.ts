import type { ProjectIntelInput } from "../types";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RecommendationEngine } from "../engines/recommendation-engine";
export declare function analyzeProject(input: ProjectIntelInput, engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
}): {
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
//# sourceMappingURL=project-intelligence.d.ts.map