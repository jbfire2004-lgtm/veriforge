/**
 * Developer console → Next `/api/developer/*` → SaaS `/developer/*`
 */

const TOKEN_KEY = "developer_access_token";
const USER_KEY = "developer_user";

export type DeveloperSession = {
  accessToken: string;
  developer?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    fullName?: string | null;
  };
};

export function saveDeveloperSession(session: DeveloperSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  if (session.developer) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.developer));
  }
}

export function clearDeveloperSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getDeveloperSession(): DeveloperSession | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(TOKEN_KEY);
  if (!accessToken) return null;
  let developer: DeveloperSession["developer"];
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) developer = JSON.parse(raw);
  } catch {
    developer = undefined;
  }
  return { accessToken, developer };
}

export function developerCan(key: string): boolean {
  const perms = getDeveloperSession()?.developer?.permissions ?? [];
  return perms.includes("system.full_access") || perms.includes(key);
}

async function devFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = getDeveloperSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  const res = await fetch(`/api/developer/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function developerLogin(email: string, password: string) {
  const data = await devFetch<{
    developer: {
      id: string;
      email: string;
      role: string;
      permissions: string[];
      fullName: string | null;
    };
    tokens: { accessToken: string };
  }>("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveDeveloperSession({
    accessToken: data.tokens.accessToken,
    developer: data.developer,
  });
  return data;
}

export async function developerBootstrap(body: Record<string, unknown>) {
  const data = await devFetch<{
    developer: {
      id: string;
      email: string;
      role: string;
      permissions: string[];
      fullName: string | null;
    };
    tokens: { accessToken: string };
  }>("auth/bootstrap", {
    method: "POST",
    body: JSON.stringify(body),
  });
  saveDeveloperSession({
    accessToken: data.tokens.accessToken,
    developer: data.developer,
  });
  return data;
}

export const developerApi = {
  dashboard: () =>
    devFetch<{ stats: Record<string, number> }>("dashboard"),
  listOrgs: (q?: string) =>
    devFetch<{ items: { id: string; name: string; slug: string; status: string }[] }>(
      `orgs${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ),
  impersonate: (targetOrgId: string, reason?: string) =>
    devFetch("impersonate", {
      method: "POST",
      body: JSON.stringify({ targetOrgId, reason }),
    }),
  endImpersonate: (sessionId: string) =>
    devFetch(`impersonate/${sessionId}/end`, { method: "POST", body: "{}" }),
  listModules: () =>
    devFetch<{ modules: { id: string; code: string; name: string; isActive: boolean }[] }>(
      "modules",
    ),
  updateModule: (code: string, body: Record<string, unknown>) =>
    devFetch(`modules/${code}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  listFlags: () =>
    devFetch<{ flags: { id: string; key: string; enabled: boolean; description?: string }[] }>(
      "feature-flags",
    ),
  upsertFlag: (body: Record<string, unknown>) =>
    devFetch("feature-flags", { method: "POST", body: JSON.stringify(body) }),
  listLogs: () =>
    devFetch<{
      items: {
        id: string;
        action: string;
        createdAt: string;
        developer?: { email: string } | null;
      }[];
    }>("logs"),
  listApiKeys: () =>
    devFetch<{
      keys: {
        id: string;
        name: string;
        keyPrefix: string;
        revokedAt: string | null;
      }[];
    }>("api-keys"),
  createApiKey: (name: string) =>
    devFetch<{ secret: string; apiKey: { id: string; name: string } }>(
      "api-keys",
      { method: "POST", body: JSON.stringify({ name }) },
    ),
  revokeApiKey: (id: string) =>
    devFetch(`api-keys/${id}/revoke`, { method: "POST", body: "{}" }),
};
