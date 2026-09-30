import { PredictiveEngine } from "../engines/predictive-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";

export type CompetencyIntelInput = {
  workerId: string;
  daysToExpiry?: number;
  failed: boolean;
  gaps: string[];
};

export function analyzeCompetency(
  input: CompetencyIntelInput,
  engines: { predictive: PredictiveEngine; summarize: AutoSummarizationEngine }
) {
  return {
    workerId: input.workerId,
    expiryForecast: engines.predictive.forecastExpiry(
      input.workerId,
      "Competency",
      input.daysToExpiry
    ),
    failureForecast: engines.predictive.forecastFailure(
      input.workerId,
      "Competency failure",
      input.failed ? 0.7 : 0.1
    ),
    summary: engines.summarize.summarize("Competency", [
      input.failed ? "Failed evaluation" : "Valid",
      input.gaps.length ? `${input.gaps.length} gaps` : "No gaps",
    ]),
    suggestedTraining: input.gaps,
    suggestedEquipment: input.failed ? [] : ["General fleet"],
  };
}
