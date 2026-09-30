import { API_URL, apiFetchJson, getAccessToken } from "@/lib/api-fetch";

const BASE = "/api/v1/orientation";

export type OrientationPackageSummary = {
  id: string;
  title: string;
  type: string;
  version: number;
  isPublished: boolean;
  languages: string[];
  _count?: { workerProgress: number };
};

export type OrientationPackageDetail = OrientationPackageSummary & {
  currentVersion?: {
    id: string;
    versionNumber: number;
    sections: Record<string, { id: string; type: string; title: string; body: string }[]>;
    quiz: Record<string, { id: string; prompt: string; choices: string[]; answerIndex: number }[]>;
    media?: unknown[];
  };
};

export type OrientationRequiredItem = {
  id: string;
  packageId: string;
  status: string;
  versionNumber: number;
  package: OrientationPackageSummary;
};

export type OrientationStats = {
  total: number;
  completed: number;
  pending: number;
  outdated: number;
  inProgress: number;
  completionRate: number;
};

export type OrientationCompliance = {
  packageCount: number;
  completed: number;
  pending: number;
  outdated: number;
  packages: Array<{ id: string; title: string; version: number; progress: number }>;
};

export function listCompanyOrientations(companyId: number) {
  return apiFetchJson<OrientationPackageSummary[]>(`${BASE}/companies/${companyId}`);
}

export function listProjectOrientations(projectId: number) {
  return apiFetchJson<OrientationPackageSummary[]>(`${BASE}/projects/${projectId}`);
}

export function getCompanyOrientationCompliance(companyId: number) {
  return apiFetchJson<OrientationCompliance>(`${BASE}/companies/${companyId}/compliance`);
}

export function getProjectOrientationCompliance(projectId: number) {
  return apiFetchJson<OrientationCompliance>(`${BASE}/projects/${projectId}/compliance`);
}

export function getOrientation(id: string) {
  return apiFetchJson<OrientationPackageDetail>(`${BASE}/${id}`);
}

export function getOrientationStats(id: string) {
  return apiFetchJson<OrientationStats>(`${BASE}/${id}/stats`);
}

export function createOrientation(body: {
  companyId?: number;
  projectId?: number;
  type: "UPLOAD" | "AI_GENERATED";
  title: string;
  languages?: string[];
}) {
  return apiFetchJson<OrientationPackageDetail>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function publishOrientation(id: string) {
  return apiFetchJson<OrientationPackageDetail>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ isPublished: true }),
  });
}

export function assignOrientation(id: string, scope: "COMPANY" | "PROJECT" | "ONBOARDING") {
  return apiFetchJson<OrientationPackageDetail>(`${BASE}/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ scope }),
  });
}

export function aiGenerateOrientation(id: string, body: Record<string, unknown>) {
  return apiFetchJson<OrientationPackageDetail>(`${BASE}/${id}/ai-generate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function uploadOrientationFiles(id: string, files: File[]) {
  const token = await getAccessToken();
  const form = new FormData();
  for (const f of files) {
    form.append("files", f);
  }
  const res = await fetch(`${API_URL}${BASE}/${id}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as OrientationPackageDetail) : ({} as OrientationPackageDetail);
}

export function listOrientationWorkers(id: string) {
  return apiFetchJson<
    {
      id: string;
      status: string;
      versionNumber: number;
      quizScore: number | null;
      certificateId: string | null;
      languageCode: string;
      worker: { id: number; firstName: string; lastName: string };
    }[]
  >(`${BASE}/${id}/workers`);
}

export function listOrientationVersions(id: string) {
  return apiFetchJson<
    Array<{
      id: string;
      versionNumber: number;
      createdAt: string;
      aiMetadata?: Record<string, unknown>;
    }>
  >(`${BASE}/${id}/versions`);
}

export function rollbackOrientationVersion(id: string, versionNumber: number) {
  return apiFetchJson<OrientationPackageDetail>(`${BASE}/${id}/version/rollback`, {
    method: "POST",
    body: JSON.stringify({ versionNumber }),
  });
}

export function fetchMyRequiredOrientations() {
  return apiFetchJson<OrientationRequiredItem[]>(`${BASE}/me/required`);
}

export function startMyOrientation(packageId: string) {
  return apiFetchJson(`${BASE}/me/${packageId}/progress/start`, { method: "POST" });
}

export function completeMyOrientation(
  packageId: string,
  body: { quizScore?: number; languageCode?: string },
) {
  return apiFetchJson(`${BASE}/me/${packageId}/progress/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
