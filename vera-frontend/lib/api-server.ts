import { API_URL, apiFetchJson } from "@/lib/api-fetch";

export async function apiGetServer<T = any>(path: string): Promise<T> {
  return apiFetchJson<T>(`${API_URL}${path}`, {
    cache: "no-store",
  });
}
