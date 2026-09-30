// frontend/lib/api.ts
import type { Session } from "next-auth";
import {
  API_URL,
  apiFetchJson,
  type ApiFetchOptions,
} from "./api-client";

export { API_URL };

type ApiGetOptions = Pick<ApiFetchOptions, "session" | "timeoutMs">;

/**
 * Generic GET request
 */
export async function apiGet<T = any>(
  path: string,
  options?: ApiGetOptions,
): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    method: "GET",
    cache: "no-store",
    ...options,
  });
}

export type ApiGetResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** GET that never throws — use for server pages that need error UI. */
export async function apiGetSafe<T = unknown>(
  path: string,
  session?: Session | null,
): Promise<ApiGetResult<T>> {
  try {
    const data = await apiGet<T>(path, { session });
    return { ok: true, data };
  } catch (e) {
    const error =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Could not reach the server. Check your connection and try again.";
    return { ok: false, error };
  }
}

/**
 * Generic POST request
 */
export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Generic PATCH request
 */
export async function apiPatch<T = any>(
  path: string,
  body: unknown
): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Generic PUT request
 */
export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Generic DELETE request
 */
export async function apiDelete<T = any>(path: string): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    method: "DELETE",
  });
}
