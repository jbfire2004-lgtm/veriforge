import {
  ApiSuccessEnvelopeSchema,
  type ApiSuccessEnvelope,
  API_CONTRACT_REGISTRY,
  getContractById,
} from "@vera/api-contract";
import { apiGet, apiPost } from "@/lib/api";

/** Fetch unified API contract registry (super-admin). */
export async function fetchApiContracts() {
  return apiGet<ApiSuccessEnvelope<typeof API_CONTRACT_REGISTRY>>(
    "/api/v1/contracts"
  );
}

export function parseApiSuccess<T>(body: unknown): ApiSuccessEnvelope<T> | null {
  const parsed = ApiSuccessEnvelopeSchema.safeParse(body);
  return parsed.success ? (parsed.data as ApiSuccessEnvelope<T>) : null;
}

/** Workers API — envelope responses from api-platform controllers. */
export async function searchWorkersV1(params: {
  q?: string;
  companyId?: number;
  page?: number;
  pageSize?: number;
}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.companyId != null) qs.set("companyId", String(params.companyId));
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiGet<ApiSuccessEnvelope<unknown[]>>(
    `/api/v1/workers/search${q ? `?${q}` : ""}`
  );
}

export async function syncBatchV1(actions: {
  type: string;
  payload: Record<string, unknown>;
}[]) {
  return apiPost<ApiSuccessEnvelope<unknown>>("/api/v1/sync/batch", { actions });
}

export { API_CONTRACT_REGISTRY, getContractById };
