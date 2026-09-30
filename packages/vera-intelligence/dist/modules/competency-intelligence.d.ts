import { PredictiveEngine } from "../engines/predictive-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
export type CompetencyIntelInput = {
    workerId: string;
    daysToExpiry?: number;
    failed: boolean;
    gaps: string[];
};
export declare function analyzeCompetency(input: CompetencyIntelInput, engines: {
    predictive: PredictiveEngine;
    summarize: AutoSummarizationEngine;
}): {
    workerId: string;
    expiryForecast: import("..").PredictionResult[];
    failureForecast: import("..").PredictionResult;
    summary: import("..").SummaryResult;
    suggestedTraining: string[];
    suggestedEquipment: string[];
};
//# sourceMappingURL=competency-intelligence.d.ts.map