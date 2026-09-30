import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/pm/jha-flha`;

export type JhaFlhaStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "LOCKED"
  | "REJECTED";

export type JhaFlhaKind = "FLHA" | "JHA";

export type JhaFlhaSummary = {
  id: string;
  kind: JhaFlhaKind;
  status: JhaFlhaStatus;
  taskDescription: string;
  projectId: number;
  companyId: number;
  sifPotential: boolean;
  riskScore: number | null;
  qualityScore: number | null;
  updatedAt: string;
  project?: { id: number; name: string };
};

export type JhaEvaluation = {
  riskScore: number;
  taskRiskScore: number;
  sifScore: number;
  sifPotential: boolean;
  highEnergyFlag: boolean;
  qualityScore: number;
  requiresSupervisorReview: boolean;
  controlsAdequate: boolean;
  missingControls: string[];
  weakControls: string[];
  blockSubmission: boolean;
  blockReasons: string[];
  supervisorReviewFlags?: Array<{
    severity: "critical" | "warning" | "info";
    code: string;
    message: string;
    hazardId?: string;
  }>;
  ppeOnlyHighEnergyHazards?: string[];
};

export async function listJhaFlha(params: {
  projectId?: number;
  companyId?: number;
  status?: JhaFlhaStatus;
  kind?: JhaFlhaKind;
}) {
  const q = new URLSearchParams();
  if (params.projectId) q.set("projectId", String(params.projectId));
  if (params.companyId) q.set("companyId", String(params.companyId));
  if (params.status) q.set("status", params.status);
  if (params.kind) q.set("kind", params.kind);
  return fetchJson<JhaFlhaSummary[]>(`${BASE}?${q}`);
}

export async function getJhaFlha(id: string) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function createJhaFlha(body: {
  kind?: JhaFlhaKind;
  companyId: number;
  projectId: number;
  siteId?: number;
  taskDescription: string;
  workScope?: string;
  locationNote?: string;
  environmentalJson?: Record<string, unknown>;
  clientSyncId?: string;
}) {
  return fetchJson<Record<string, unknown>>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchJhaFlhaAnalytics(projectId: number) {
  return fetchJson<Record<string, unknown>>(`${BASE}/analytics?projectId=${projectId}`);
}

export async function getJhaFlhaScore(id: string) {
  return fetchJson<JhaEvaluation>(`${BASE}/${id}/score`);
}

export async function evaluateJhaFlha(id: string) {
  return fetchJson<JhaEvaluation>(`${BASE}/${id}/evaluate`, { method: "POST" });
}

export async function submitJhaFlha(id: string) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/submit`, {
    method: "POST",
  });
}

export async function reviewJhaFlha(
  id: string,
  action: "approve" | "reject" | "request_changes",
  reviewNotes?: string,
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reviewNotes }),
  });
}

export async function lockJhaFlha(id: string) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/lock`, { method: "POST" });
}

export type VeraOrchestratorAnalysis = {
  moduleType: string;
  recordId: string;
  facts: string[];
  analysis: string[];
  actions: string[];
};

export type JhaFlhaEngineHazard = {
  category: "people" | "equipment" | "environment" | "energy";
  description: string;
  sif_potential?: boolean;
};

export type JhaFlhaEngineControl = {
  hierarchy: "elimination" | "substitution" | "engineering" | "administrative" | "ppe";
  description: string;
  sif_verification?: boolean;
};

export type JhaFlhaEngineOutput = {
  jha_steps: Array<{
    step: string;
    hazards: JhaFlhaEngineHazard[];
    controls: JhaFlhaEngineControl[];
    sif_potential?: boolean;
  }>;
  energy_wheel: Array<{
    energy_type: string;
    description: string;
    failure_modes: string[];
    controls: string[];
  }>;
  field_summary: string;
  verification_questions: string[];
};

export async function generateJhaFlhaEngine(body: {
  task_description: string;
  task_steps?: string[];
  environment?: Record<string, unknown>;
  equipment_and_tools?: string[];
  materials?: string[];
  workforce?: {
    crew_size?: number;
    experience_level?: "new" | "mixed" | "experienced";
    subcontractors?: string[];
  };
  known_critical_risks?: string[];
  client_rules?: string[];
  org_standards?: string[];
  kind?: JhaFlhaKind;
  companyId?: number;
  projectId?: number;
}) {
  return fetchJson<JhaFlhaEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchJhaFlhaOrchestrator(id: string) {
  return fetchJson<VeraOrchestratorAnalysis>(`${BASE}/${id}/orchestrator`);
}

export async function addJhaHazard(
  id: string,
  body: {
    description: string;
    category?: string;
    subcategory?: string;
    severity?: number;
    likelihood?: number;
    energyTypes?: string[];
  },
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/hazards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addJhaControl(
  id: string,
  body: {
    hazardId?: string;
    controlType: string;
    description: string;
    adequate?: boolean;
  },
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function setJhaCrew(
  id: string,
  workers: Array<{ workerId: number; role?: string }>,
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/crew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workers }),
  });
}

export async function signJhaFlha(
  id: string,
  body: {
    role: "WORKER" | "SUPERVISOR" | "AUTHORIZER";
    signatureData: string;
    signerName?: string;
    workerId?: number;
  },
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchJhaSuggestions(id: string) {
  return fetchJson<{
    hazards: Array<Record<string, unknown>>;
    controls: Array<Record<string, unknown>>;
    energyWheel: Array<Record<string, unknown>>;
    suggestedHazards?: Array<Record<string, unknown> & { score: number; reason: string }>;
    suggestedControls?: Array<Record<string, unknown> & { score: number; reason: string }>;
    warnings?: string[];
  }>(`${BASE}/${id}/suggestions`);
}

export async function fetchLibrarySuggest(params: {
  companyId: number;
  projectId?: number;
  taskDescription?: string;
  locationNote?: string;
  weather?: string;
  hazardCategories?: string[];
  energyTypes?: string[];
  existingHazardDescriptions?: string[];
  existingControlDescriptions?: string[];
  focusedHazardCategory?: string;
  focusedHazardEnergyTypes?: string[];
  focusedHazardDescription?: string;
}) {
  const q = new URLSearchParams();
  q.set("companyId", String(params.companyId));
  if (params.projectId) q.set("projectId", String(params.projectId));
  if (params.taskDescription) q.set("taskDescription", params.taskDescription);
  if (params.locationNote) q.set("locationNote", params.locationNote);
  if (params.weather) q.set("weather", params.weather);
  if (params.hazardCategories?.length) {
    q.set("hazardCategories", params.hazardCategories.join(","));
  }
  if (params.energyTypes?.length) q.set("energyTypes", params.energyTypes.join(","));
  if (params.existingHazardDescriptions?.length) {
    q.set("existingHazards", params.existingHazardDescriptions.join("|"));
  }
  if (params.existingControlDescriptions?.length) {
    q.set("existingControls", params.existingControlDescriptions.join("|"));
  }
  if (params.focusedHazardCategory) {
    q.set("focusedHazardCategory", params.focusedHazardCategory);
  }
  if (params.focusedHazardEnergyTypes?.length) {
    q.set("focusedHazardEnergyTypes", params.focusedHazardEnergyTypes.join(","));
  }
  if (params.focusedHazardDescription) {
    q.set("focusedHazardDescription", params.focusedHazardDescription);
  }
  return fetchJson<{
    suggestedHazards: Array<Record<string, unknown> & { score: number; reason: string }>;
    suggestedControls: Array<Record<string, unknown> & { score: number; reason: string; controlClass?: string }>;
    warnings: string[];
    crewOftenAdds?: {
      hazards: Array<{ description: string; category?: string; count: number; reason: string }>;
      controls: Array<{ description: string; controlType?: string; count: number; reason: string }>;
    };
    missedHazards?: Array<Record<string, unknown> & { score: number; reason: string }>;
    missedControls?: Array<Record<string, unknown> & { score: number; reason: string; controlClass?: string }>;
    requiredEnergyTypes?: string[];
    matchedTaskProfiles?: string[];
    gapWarnings?: string[];
    hecaNotes?: string[];
  }>(`${BASE}/library/suggest?${q}`);
}

export async function fetchIndustryPacks(companyId: number) {
  return fetchJson<{ packIds: string[]; labels: string[] }>(
    `${BASE}/library/packs?companyId=${companyId}`,
  );
}

export async function createLibraryHazard(body: {
  companyId: number;
  projectId?: number;
  category: string;
  description: string;
  defaultEnergyTypes?: string[];
}) {
  return fetchJson<Record<string, unknown>>(`${BASE}/library/hazards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createLibraryControl(body: {
  companyId: number;
  projectId?: number;
  controlType: string;
  description: string;
  hazardCategories?: string[];
}) {
  return fetchJson<Record<string, unknown>>(`${BASE}/library/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchHazardLibrary(
  companyId: number,
  projectId?: number,
  session?: import("next-auth").Session | null,
) {
  const { fetchHazardCatalog } = await import("@/lib/hazard-control-catalog");
  const catalog = await fetchHazardCatalog(companyId, projectId, { session });
  return catalog.hazards as Array<Record<string, unknown>>;
}

export async function fetchControlLibrary(
  companyId: number,
  projectId?: number,
  category?: string,
  session?: import("next-auth").Session | null,
) {
  const { fetchControlCatalog } = await import("@/lib/hazard-control-catalog");
  const catalog = await fetchControlCatalog(companyId, projectId, {
    hazardCategory: category,
    session,
  });
  return catalog.controls as Array<Record<string, unknown>>;
}

export async function setJhaEnergySources(
  id: string,
  sources: Array<{
    energyType: string;
    exposureLevel: number;
    controlsSummary?: string;
  }>,
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/energy-sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources }),
  });
}

export async function updateJhaFlhaDraft(
  id: string,
  body: {
    taskDescription?: string;
    workScope?: string;
    locationNote?: string;
    environmentalJson?: Record<string, unknown>;
    kind?: JhaFlhaKind;
  },
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchEnergyWheel() {
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/library/energy-wheel`,
  );
}

export async function setJhaEquipment(
  id: string,
  items: Array<{ equipmentId: number; authorized?: boolean }>,
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

export async function addJhaFlhaAttachment(
  id: string,
  body: { fileName: string; mimeType?: string; storageKey?: string; dataUrl?: string },
) {
  return fetchJson<Record<string, unknown>>(`${BASE}/${id}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncJhaFlhaOffline(body: Record<string, unknown>) {
  return fetchJson<Record<string, unknown>>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
