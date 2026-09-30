import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
export type UnionIntelInput = {
    hallId: string;
    readyForDispatch: number;
    missingTraining: number;
    activeMembers: number;
    dispatchConflicts: number;
};
export declare function analyzeUnionHall(input: UnionIntelInput, engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
}): {
    hallId: string;
    dispatchReadiness: import("..").ScoreResult;
    dispatchForecast: import("..").PredictionResult;
    memberShortage: import("..").PredictionResult;
    trainingNeeds: number;
    dispatchConflicts: number;
    summary: import("..").SummaryResult;
    suggestedDispatchList: string[];
};
//# sourceMappingURL=union-intelligence.d.ts.map