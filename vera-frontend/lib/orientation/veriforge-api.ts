import { apiFetchJson, getAccessToken, API_URL } from "@/lib/api-fetch";
import type {
  OrientationCompletion,
  OrientationContentBlock,
  OrientationContentMode,
  OrientationDefinition,
  OrientationDefinitionType,
  OrientationDeliveryAssignResult,
  OrientationDeliveryLinks,
  OrientationExpiryRules,
  OrientationMustCompleteBefore,
  OrientationRequirement,
  WorkerOrientationProfile,
} from "./veriforge-types";

const DEF = "/api/v1/orientation-definitions";
const REQ = "/api/v1/orientation-requirements";
const COMP = "/api/v1/orientation-completions";
const AI = "/api/v1/ai/orientation";
const DELIVERY = "/api/v1/delivery/orientation";

export function listOrientationDefinitions(params: {
  companyId: number;
  projectId?: number;
  type?: OrientationDefinitionType;
  isPublished?: boolean;
}) {
  const q = new URLSearchParams();
  q.set("companyId", String(params.companyId));
  if (params.projectId != null) q.set("projectId", String(params.projectId));
  if (params.type) q.set("type", params.type);
  if (params.isPublished != null) q.set("isPublished", String(params.isPublished));
  return apiFetchJson<OrientationDefinition[]>(`${DEF}?${q.toString()}`);
}

export function getOrientationDefinition(id: string) {
  return apiFetchJson<OrientationDefinition>(`${DEF}/${id}`);
}

export function createOrientationDefinition(body: {
  companyId: number;
  title: string;
  type: OrientationDefinitionType;
  contentMode?: OrientationContentMode;
  contentBlocks?: OrientationContentBlock[];
  version?: string;
  isPublished?: boolean;
  expiryRules?: OrientationExpiryRules;
  metadata?: Record<string, unknown>;
}) {
  return apiFetchJson<OrientationDefinition>(DEF, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateOrientationDefinition(
  id: string,
  body: {
    title?: string;
    type?: OrientationDefinitionType;
    contentMode?: OrientationContentMode;
    contentBlocks?: OrientationContentBlock[];
    isPublished?: boolean;
    expiryRules?: OrientationExpiryRules;
    metadata?: Record<string, unknown>;
    bumpVersion?: boolean;
  },
) {
  return apiFetchJson<OrientationDefinition>(`${DEF}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function uploadOrientationDefinition(input: {
  companyId: number;
  title?: string;
  type?: OrientationDefinitionType;
  file: File;
}) {
  const token = await getAccessToken();
  const form = new FormData();
  form.append("file", input.file);
  form.append("companyId", String(input.companyId));
  if (input.title) form.append("title", input.title);
  if (input.type) form.append("type", input.type);

  const res = await fetch(`${API_URL}${DEF}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }
  return (await res.json()) as OrientationDefinition;
}

export function listOrientationRequirements(params: {
  companyId: number;
  projectId?: number;
  workerId?: number;
  isActive?: boolean;
}) {
  const q = new URLSearchParams();
  q.set("companyId", String(params.companyId));
  if (params.projectId != null) q.set("projectId", String(params.projectId));
  if (params.workerId != null) q.set("workerId", String(params.workerId));
  if (params.isActive != null) q.set("isActive", String(params.isActive));
  return apiFetchJson<OrientationRequirement[]>(`${REQ}?${q.toString()}`);
}

export function createOrientationRequirement(body: {
  orientationId: string;
  companyId: number;
  projectId?: number;
  siteId?: number;
  tradeId?: string;
  unionDispatchType?: string;
  mustCompleteBefore: OrientationMustCompleteBefore;
  isActive?: boolean;
}) {
  return apiFetchJson<OrientationRequirement>(REQ, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateOrientationRequirement(
  id: string,
  body: Partial<{
    projectId: number | null;
    siteId: number | null;
    tradeId: string | null;
    unionDispatchType: string | null;
    mustCompleteBefore: OrientationMustCompleteBefore;
    isActive: boolean;
  }>,
) {
  return apiFetchJson<OrientationRequirement>(`${REQ}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function createOrientationCompletion(body: {
  workerId: number;
  orientationId: string;
  companyId: number;
  projectId?: number;
  score?: number;
  status?: string;
  clientSyncId?: string;
}) {
  return apiFetchJson<OrientationCompletion>(COMP, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listOrientationCompletions(params: {
  workerId?: number;
  orientationId?: string;
}) {
  const q = new URLSearchParams();
  if (params.workerId != null) q.set("workerId", String(params.workerId));
  if (params.orientationId) q.set("orientationId", params.orientationId);
  return apiFetchJson<OrientationCompletion[]>(`${COMP}?${q.toString()}`);
}

export function getWorkerOrientationProfile(
  workerId: number,
  opts?: {
    companyId?: number;
    projectId?: number;
    siteId?: number;
    tradeId?: string;
    unionDispatchType?: string;
  },
) {
  const q = new URLSearchParams();
  if (opts?.companyId != null) q.set("companyId", String(opts.companyId));
  if (opts?.projectId != null) q.set("projectId", String(opts.projectId));
  if (opts?.siteId != null) q.set("siteId", String(opts.siteId));
  if (opts?.tradeId) q.set("tradeId", opts.tradeId);
  if (opts?.unionDispatchType)
    q.set("unionDispatchType", opts.unionDispatchType);
  const qs = q.toString();
  return apiFetchJson<WorkerOrientationProfile>(
    `/api/v1/workers/${workerId}/orientation-profile${qs ? `?${qs}` : ""}`,
  );
}

export function aiGenerateFromText(body: {
  companyId: number;
  title?: string;
  text: string;
  type?: string;
}) {
  return apiFetchJson<{
    title: string;
    contentBlocks: OrientationContentBlock[];
    metadata: Record<string, unknown>;
  }>(`${AI}/generate-from-text`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function aiGenerateFromFile(body: {
  companyId: number;
  title?: string;
  fileName: string;
  mimeType?: string;
  textExtract?: string;
}) {
  return apiFetchJson<{
    title: string;
    contentBlocks: OrientationContentBlock[];
    metadata: Record<string, unknown>;
  }>(`${AI}/generate-from-file`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function aiGenerateQuiz(body: {
  companyId: number;
  topic: string;
  contentBlocks?: OrientationContentBlock[];
  questionCount?: number;
}) {
  return apiFetchJson<{ contentBlocks: OrientationContentBlock[] }>(
    `${AI}/generate-quiz`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export function aiImproveBlock(body: {
  companyId: number;
  block: OrientationContentBlock;
  instruction?: string;
}) {
  return apiFetchJson<{ contentBlock: OrientationContentBlock }>(
    `${AI}/improve-block`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export function assignOrientationDelivery(body: {
  workerId: number;
  orientationId: string;
  companyId: number;
}) {
  return apiFetchJson<OrientationDeliveryAssignResult>(`${DELIVERY}/assign`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listOrientationDeliveryLinks(workerId: number) {
  return apiFetchJson<OrientationDeliveryLinks>(
    `${DELIVERY}/links?workerId=${workerId}`,
  );
}
