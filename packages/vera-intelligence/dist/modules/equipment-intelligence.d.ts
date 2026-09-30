import type { EquipmentIntelInput } from "../types";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RecommendationEngine } from "../engines/recommendation-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
export declare function analyzeEquipment(input: EquipmentIntelInput, engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
    anomaly: AnomalyDetectionEngine;
}): {
    id: string;
    name: string;
    lockoutRisk: import("../types").ScoreResult;
    readiness: import("../types").ScoreResult;
    inspectionFailure: import("../types").PredictionResult;
    maintenanceSchedule: import("../types").PredictionResult[];
    overdueInspection: boolean;
    competencyGaps: number;
    summary: import("../types").SummaryResult;
    suggestedMaintenance: string[];
};
//# sourceMappingURL=equipment-intelligence.d.ts.map