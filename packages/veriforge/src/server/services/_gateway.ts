import { SAAS_DEFAULT_URL } from "../utils/constants";

export class SaasGateway {
  constructor(private readonly baseUrl = SAAS_DEFAULT_URL) {}

  async request<T>(
    path: string,
    init: RequestInit & { accessToken?: string } = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (init.accessToken) {
      headers.set("Authorization", `Bearer ${init.accessToken}`);
    }
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => ({}))) as T & {
      error?: string;
      code?: string;
    };
    if (!res.ok) {
      const message =
        typeof body.error === "string" ? body.error : `SaaS ${res.status}`;
      throw new Error(message);
    }
    return body;
  }
}

export const saasGateway = new SaasGateway(
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, "") ?? SAAS_DEFAULT_URL,
);
