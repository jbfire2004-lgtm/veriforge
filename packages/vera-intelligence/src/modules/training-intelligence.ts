import type { TrainingIntelInput } from "../types";
import {
  AutoClassificationEngine,
  AutoMappingEngine,
  AutoSummarizationEngine,
} from "../engines/auto-engines";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";

export function analyzeTraining(
  inputs: TrainingIntelInput[],
  engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    classify: AutoClassificationEngine;
    map: AutoMappingEngine;
    summarize: AutoSummarizationEngine;
    anomaly: AnomalyDetectionEngine;
    recommend: RecommendationEngine;
  }
) {
  const gapDetection: { trainingId: string; gap: string }[] = [];
  const classifications: ReturnType<AutoClassificationEngine["classifyTraining"]>[] = [];
  let fraudScore = 0;

  for (const t of inputs) {
    const cls = engines.classify.classifyTraining(t);
    classifications.push(cls);
    const mapping = engines.map.mapTrainingToStandards(t);
    if (!t.isValid) gapDetection.push({ trainingId: t.id, gap: "invalid_or_expired" });
    if (cls.standards?.length === 0) gapDetection.push({ trainingId: t.id, gap: "unmapped_standard" });
    if (t.fraudSignals?.length) {
      fraudScore += t.fraudSignals.length * 25;
      engines.anomaly.report({
        module: "training",
        code: "FRAUD_SIGNAL",
        message: `Suspicious certificate: ${t.title}`,
        severity: "high",
        entityId: t.id,
      });
    }
  }

  const fraudRisk = engines.risk.score([
    { id: "fraud", label: "Fraud signals", weight: 100, value: Math.min(100, fraudScore) },
  ]);

  const expiryForecasts = inputs
    .filter((t) => t.expiryDate)
    .map((t) => {
      const days = t.expiryDate
        ? Math.floor((new Date(t.expiryDate).getTime() - Date.now()) / 86400000)
        : undefined;
      return engines.predictive.forecastExpiry(t.id, t.title, days)[0]!;
    });

  if (gapDetection.length > 0) {
    engines.recommend.suggest({
      module: "training",
      title: "Close training gaps",
      description: `${gapDetection.length} records need attention`,
      actionType: "training.review",
      priority: 80,
    });
  }

  return {
    classifications,
    gapDetection,
    fraudRisk,
    expiryForecasts,
    providerQuality: inputs.length
      ? { score: Math.max(0, 100 - fraudScore), sampleSize: inputs.length }
      : undefined,
    summary: engines.summarize.summarize("Training portfolio", [
      `${inputs.length} records analyzed`,
      `${gapDetection.length} gaps`,
      `Fraud risk ${fraudRisk.level}`,
    ]),
    suggestedRequired: gapDetection.length ? ["WHMIS", "Fall protection", "Equipment-specific"] : [],
  };
}
