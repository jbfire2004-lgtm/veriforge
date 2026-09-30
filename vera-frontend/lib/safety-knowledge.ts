import { API_URL, getAccessToken } from "./api-fetch";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/safety-knowledge`;

export type SafetyKnowledgeResult = {
  workerId: string;
  overallScore: number;
  overallStatus: string;
  domains: Array<{
    domain: string;
    score: number;
    status: string;
    gaps: string[];
  }>;
  recommendations: string[];
};

export async function evaluateSafetyKnowledge(workerId: number) {
  return fetchJson<{ runId: string; result: SafetyKnowledgeResult }>(
    `${BASE}/worker/${workerId}/evaluate`,
    { method: "POST" },
  );
}

export type SafetyKnowledgeRunSummary = {
  id: string;
  overallScore: number;
  overallStatus: string;
  resultJson: SafetyKnowledgeResult;
  evaluatedAt: string;
};

export type SafetyKnowledgeHistoryEntry = {
  id: string;
  overallScore: number;
  overallStatus: string;
  evaluatedAt: string;
  createdByUserId?: number | null;
};

export function safetyKnowledgeWorkerPath(workerId: number, suffix: string) {
  return `${BASE}/worker/${workerId}${suffix}`;
}

export async function getLatestSafetyKnowledge(workerId: number) {
  return fetchJson<SafetyKnowledgeRunSummary | null>(
    safetyKnowledgeWorkerPath(workerId, "/latest"),
  );
}

export async function listSafetyKnowledgeHistory(workerId: number) {
  return fetchJson<SafetyKnowledgeHistoryEntry[]>(
    safetyKnowledgeWorkerPath(workerId, "/history"),
  );
}

export async function downloadSafetyKnowledgePdf(workerId: number) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/worker/${workerId}/export.pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("PDF export failed");
  return res.blob();
}
