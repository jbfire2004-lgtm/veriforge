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

export function analyzeUnionHall(
  input: UnionIntelInput,
  engines: { predictive: PredictiveEngine; risk: RiskEngine; summarize: AutoSummarizationEngine }
) {
  const dispatchReadiness = engines.risk.toReadiness(
    engines.risk.score([
      { id: "training", label: "Missing training", weight: 50, value: Math.min(100, input.missingTraining * 8) },
      { id: "conflicts", label: "Dispatch conflicts", weight: 50, value: Math.min(100, input.dispatchConflicts * 20) },
    ])
  );

  return {
    hallId: input.hallId,
    dispatchReadiness,
    dispatchForecast: engines.predictive.forecastShortage(
      input.hallId,
      input.activeMembers,
      input.readyForDispatch,
      7
    ),
    memberShortage: engines.predictive.forecastShortage(
      input.hallId,
      input.activeMembers,
      input.readyForDispatch,
      30
    ),
    trainingNeeds: input.missingTraining,
    dispatchConflicts: input.dispatchConflicts,
    summary: engines.summarize.summarize("Union hall", [
      `${input.readyForDispatch} ready for dispatch`,
      `${input.missingTraining} missing training`,
    ]),
    suggestedDispatchList: input.readyForDispatch > 0 ? [`${input.readyForDispatch} members ready`] : [],
  };
}
