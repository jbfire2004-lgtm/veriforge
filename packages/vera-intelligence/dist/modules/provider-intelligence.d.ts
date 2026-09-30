import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
export type ProviderIntelInput = {
    id: string;
    name: string;
    approved: boolean;
    instructorValid: boolean;
    courseCount: number;
    rejectionRate: number;
    standardsMismatch: boolean;
    daysToApproval?: number;
};
export declare function analyzeProvider(input: ProviderIntelInput, engines: {
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
    anomaly: AnomalyDetectionEngine;
}): {
    id: string;
    name: string;
    reliability: import("..").ScoreResult;
    instructorScore: number;
    courseQuality: number;
    approvalForecast: {
        days: number;
        likely: boolean;
    } | undefined;
    summary: import("..").SummaryResult;
};
//# sourceMappingURL=provider-intelligence.d.ts.map