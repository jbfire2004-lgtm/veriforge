/**
 * Unified Vera API client — shared by Vera Core and Vera PM.
 *
 * Uses NextAuth session JWT (`accessToken`), injects `Authorization: Bearer`,
 * and applies global 401/403 handling via {@link apiFetch}.
 */
import type { Session } from "next-auth";

export {
  API_URL,
  apiFetch,
  apiFetchJson,
  getAccessToken,
  unwrapApiPayload,
  apiWsOrigin,
  type ApiFetchOptions,
} from "./api-fetch";

export { fetchJson, fetchArrayBuffer } from "./core/fetch-json";

/** Optional prefetched session — avoids resolving the token twice in hooks/pages. */
export type VeraApiContext = {
  session?: Session | null;
};

/** Normalize a relative API path (`/api/v1/...`). `apiFetch` prepends `API_URL`. */
export function apiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
