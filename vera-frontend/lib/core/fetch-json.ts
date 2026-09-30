import { errorFromApiResponse } from "./api-error";
import { apiFetch, type ApiFetchOptions } from "../api-fetch";

/**
 * Successful response body as `ArrayBuffer` (e.g. PDF). Uses same auth headers as {@link fetchJson}.
 */
export async function fetchArrayBuffer(
  input: RequestInfo | URL,
  init?: ApiFetchOptions
): Promise<ArrayBuffer> {
  const baseInit = init ?? {};
  const res = await apiFetch(input, baseInit);
  if (!res.ok) {
    const text = await res.text();
    throw errorFromApiResponse(res.status, text);
  }
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    throw new Error(
      "fetchArrayBuffer: server returned JSON; use fetchJson instead"
    );
  }
  return res.arrayBuffer();
}

/**
 * `fetch` + `res.text()` + JSON parse; throws {@link errorFromApiResponse} when `!res.ok`.
 * Attaches Bearer token when a NextAuth session is available (client or RSC).
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: ApiFetchOptions
): Promise<T> {
  const baseInit = init ?? {};
  const res = await apiFetch(input, baseInit);
  const ct = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    const text = await res.text();
    throw errorFromApiResponse(res.status, text);
  }
  if (ct.includes("application/pdf")) {
    throw new Error(
      "fetchJson: response is application/pdf; use fetchArrayBuffer() instead"
    );
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
