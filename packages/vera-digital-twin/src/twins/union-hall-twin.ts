import type { UnionHallTwinState } from "../types";
import { scoreFromFactors, readinessFromRisk } from "../engines/scoring";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";

export type UnionHallTwinInput = {
  id: string;
  name: string;
  memberCount?: number;
  dispatchQueue?: number;
  readyForDispatch?: number;
  missingTraining?: number;
};

export function buildUnionHallTwin(input: UnionHallTwinInput): UnionHallTwinState {
  const predictive = new PredictiveStateEngine();
  const risk = scoreFromFactors([
    { weight: 60, value: Math.min(100, (input.missingTraining ?? 0) * 8) },
    { weight: 40, value: (input.dispatchQueue ?? 0) > (input.readyForDispatch ?? 0) ? 50 : 10 },
  ]);
  const compliance = scoreFromFactors([
    { weight: 100, value: Math.max(0, 100 - (input.missingTraining ?? 0) * 5) },
  ]);
  const readiness = readinessFromRisk(risk.score);

  return {
    id: input.id,
    type: "unionHall",
    name: input.name,
    updatedAt: new Date().toISOString(),
    memberCount: input.memberCount ?? 0,
    dispatchQueue: input.dispatchQueue ?? 0,
    readyForDispatch: input.readyForDispatch ?? 0,
    missingTraining: input.missingTraining ?? 0,
    compliance,
    risk,
    readiness,
    predictions: [
      predictive.forecastShortage(
        input.id,
        input.memberCount ?? 0,
        input.readyForDispatch ?? 0
      ),
    ],
    offline: { pending: false, queuedEvents: 0 },
    timeline: [
      {
        id: "tl_init",
        at: new Date().toISOString(),
        event: "twin.created",
        summary: `Union hall twin initialized for ${input.name}`,
      },
    ],
  };
}
