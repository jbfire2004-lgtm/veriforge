import type { CompanyIntelInput, ProjectIntelInput } from "../types";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RiskEngine } from "../engines/risk-engine";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";
import type { Anomaly } from "../types";
export type DashboardIntelInput = {
    company?: CompanyIntelInput;
    projects?: ProjectIntelInput[];
    expiring30?: number;
    expiring60?: number;
    anomalies?: Anomaly[];
};
export declare function buildDashboardIntel(input: DashboardIntelInput, engines: {
    risk: RiskEngine;
    predictive: PredictiveEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
}): {
    widgets: {
        predictiveCompliance: {
            probability: number;
            label: string;
        };
        predictiveExpiry: {
            expired30: number;
            expired60: number;
        };
        predictiveReadiness: {
            average: number;
        };
        predictiveRisk: {
            level: "low" | "medium" | "high" | "critical";
            score: number;
        };
        anomalies: Anomaly[];
        recommendations: import("../types").Recommendation[];
        workforceForecast: import("../types").PredictionResult[];
        equipmentForecast: number[];
    };
    summary: import("../types").SummaryResult;
};
//# sourceMappingURL=dashboard-intelligence.d.ts.map