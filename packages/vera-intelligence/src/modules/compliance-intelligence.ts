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

export function analyzeCompliance(
  input: ComplianceIntelInput,
  engines: {
    patterns: PatternRecognitionEngine;
    predictive: PredictiveEngine;
    summarize: AutoSummarizationEngine;
    correct: AutoCorrectionEngine;
    anomaly: AnomalyDetectionEngine;
  }
) {
  const expiryCluster = engines.patterns.detectExpiryCluster(input.expiryDates);
  const failurePrediction = engines.predictive.forecastFailure(
    input.companyId,
    "Compliance failure wave",
    input.failureRate
  );

  if (input.invalidTraining > 0) {
    engines.anomaly.report({
      module: "compliance",
      code: "INVALID_TRAINING",
      message: `${input.invalidTraining} invalid training records`,
      severity: "high",
    });
  }

  const issues: string[] = [];
  if (input.missingRequirements) issues.push(`${input.missingRequirements} missing requirements`);
  if (input.lockoutCount) issues.push(`${input.lockoutCount} active lockouts`);

  return {
    failurePrediction,
    expiryCluster,
    lockoutCluster: input.lockoutCount >= 3 ? { detected: true, count: input.lockoutCount } : null,
    correctiveActions: engines.correct.suggestCorrections(issues),
    summary: engines.summarize.summarize("Compliance intelligence", [
      `Failure risk ${(failurePrediction.probability * 100).toFixed(0)}%`,
      expiryCluster ? "Expiry cluster detected" : "No expiry cluster",
    ]),
  };
}
