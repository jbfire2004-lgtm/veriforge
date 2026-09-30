import type { ProviderTwinState } from "../types";
import { scoreFromFactors, readinessFromRisk } from "../engines/scoring";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";

export type ProviderTwinInput = {
  id: string;
  name: string;
  approved?: boolean;
  instructorCount?: number;
  courseCount?: number;
  trainingVolume?: number;
  qualityScore?: number;
};

export function buildProviderTwin(input: ProviderTwinInput): ProviderTwinState {
  const predictive = new PredictiveStateEngine();
  const quality = input.qualityScore ?? (input.approved ? 85 : 40);
  const risk = scoreFromFactors([
    { weight: 50, value: input.approved ? 15 : 75 },
    { weight: 50, value: 100 - quality },
  ]);
  const compliance = scoreFromFactors([{ weight: 100, value: quality }]);
  const readiness = readinessFromRisk(risk.score);

  return {
    id: input.id,
    type: "provider",
    name: input.name,
    updatedAt: new Date().toISOString(),
    approved: input.approved ?? false,
    instructorCount: input.instructorCount ?? 0,
    courseCount: input.courseCount ?? 0,
    trainingVolume: input.trainingVolume ?? 0,
    qualityScore: quality,
    compliance,
    risk,
    readiness,
    predictions: [
      predictive.forecastFailure(
        input.id,
        "Approval lapse",
        input.approved ? 0.1 : 0.7
      ),
    ],
    offline: { pending: false, queuedEvents: 0 },
    timeline: [
      {
        id: "tl_init",
        at: new Date().toISOString(),
        event: "twin.created",
        summary: `Provider twin initialized for ${input.name}`,
      },
    ],
  };
}
