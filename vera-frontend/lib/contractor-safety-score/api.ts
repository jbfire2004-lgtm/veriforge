import type {
  ContractorSafetyScoreDto,
  PillarId,
  ScoreEvidence,
  ScoreHistoryPoint,
} from "./types";

const BASE = "/api/v1/contractor-scores";

function qs(query: Record<string, string | number | undefined | null>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Contractor score error (${res.status})`);
  }
  return (await res.json()) as T;
}

export function listContractorScores(opts?: {
  grade?: string;
  minScore?: number;
}) {
  return getJson<{ items: ContractorSafetyScoreDto[]; revision: number }>(
    `${BASE}${qs({ grade: opts?.grade, minScore: opts?.minScore })}`,
  );
}

export function fetchContractorScore(
  contractorCompanyId: number,
  projectId?: number,
) {
  return getJson<ContractorSafetyScoreDto>(
    `${BASE}/detail${qs({ contractorCompanyId, projectId })}`,
  );
}

export function fetchScoreEvidence(
  contractorCompanyId: number,
  pillar?: PillarId,
) {
  return getJson<{ items: ScoreEvidence[]; total: number }>(
    `${BASE}/evidence${qs({ contractorCompanyId, pillar })}`,
  );
}

export function fetchScoreHistory(contractorCompanyId: number) {
  return getJson<{ items: ScoreHistoryPoint[] }>(
    `${BASE}/history${qs({ contractorCompanyId })}`,
  );
}

export function fetchPillarDetail(
  contractorCompanyId: number,
  pillarId: PillarId,
) {
  return getJson<{
    pillar: ContractorSafetyScoreDto["pillars"][PillarId];
    evidence: ScoreEvidence[];
    score: ContractorSafetyScoreDto;
  }>(`${BASE}/pillar${qs({ contractorCompanyId, pillarId })}`);
}

export function recalculateContractorScore(contractorCompanyId: number) {
  return getJson<ContractorSafetyScoreDto>(`${BASE}/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contractorCompanyId }),
  });
}

export function emitContractorScoreEvent(
  contractorCompanyId: number,
  eventName: string,
) {
  return getJson<ContractorSafetyScoreDto>(`${BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contractorCompanyId, eventName }),
  });
}

export function fetchRubric() {
  return getJson<{
    weights: Record<string, number>;
    requiredDocs: Array<{ code: string; label: string; mandatory: boolean }>;
    lookbackDays: number;
  }>(`${BASE}/rubric`);
}
