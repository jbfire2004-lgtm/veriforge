import type { CompanyIntelInput } from "../types";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RecommendationEngine } from "../engines/recommendation-engine";
export declare function analyzeCompany(input: CompanyIntelInput, engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
}): {
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
//# sourceMappingURL=company-intelligence.d.ts.map