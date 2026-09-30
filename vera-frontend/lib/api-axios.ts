import axios, { type AxiosRequestConfig } from "axios";
import type { Session } from "next-auth";
import { API_URL, getAccessToken } from "./api-client";

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function authConfig(
  config?: AxiosRequestConfig,
  session?: Session | null
): Promise<AxiosRequestConfig> {
  const token = await getAccessToken(session);
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config?.headers as Record<string, string> | undefined),
    },
  };
}

export async function apiAxiosGet<T>(
  path: string,
  config?: AxiosRequestConfig,
  session?: Session | null
): Promise<T> {
  const { data } = await axios.get(apiUrl(path), await authConfig(config, session));
  return unwrap<T>(data);
}

export async function apiAxiosPost<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
  session?: Session | null
): Promise<T> {
  const { data } = await axios.post(
    apiUrl(path),
    body ?? null,
    await authConfig(config, session)
  );
  return unwrap<T>(data);
}
