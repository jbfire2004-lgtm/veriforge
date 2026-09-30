import type { RegulatoryDecision, RegulatoryDecisionBody } from "./types";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/training-standards";

/** Run regulatory verification (standards + equivalency); persists audit decision. */
export async function verifyTrainingAgainstRegulations(
  body: RegulatoryDecisionBody,
): Promise<RegulatoryDecision> {
  return apiFetchJson<RegulatoryDecision>(`${BASE}/regulatory/decision`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Latest regulatory decision for a training record. */
export async function fetchLatestRegulatoryDecision(
  trainingRecordId: number,
): Promise<RegulatoryDecision | null> {
  return apiFetchJson<RegulatoryDecision | null>(
    `${BASE}/regulatory/decision/${trainingRecordId}`,
  );
}

export async function fetchRegulatoryEquivalencies() {
  return apiFetchJson<
    Array<{
      id: number;
      fromJurisdiction: string;
      toJurisdiction: string;
      standardCode: string;
      notes?: string | null;
      active: boolean;
    }>
  >(`${BASE}/regulatory/equivalencies`);
}
