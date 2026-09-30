/**
 * Client helpers for VeriHub org console → Next `/api/org/*` → SaaS.
 */

const TOKEN_KEY = "verihub_saas_access_token";
const ORG_KEY = "verihub_saas_org_id";
const USER_KEY = "verihub_saas_user";

export type VeriHubSession = {
  accessToken: string;
  orgId: string;
  user?: { id: string; email: string; fullName: string; role?: string | null };
};

export function saveVeriHubSession(session: VeriHubSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(ORG_KEY, session.orgId);
  if (session.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearVeriHubSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getVeriHubSession(): VeriHubSession | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const orgId = localStorage.getItem(ORG_KEY);
  if (!accessToken || !orgId) return null;
  let user: VeriHubSession["user"];
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw);
  } catch {
    user = undefined;
  }
  return { accessToken, orgId, user };
}

async function orgFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = getVeriHubSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  const res = await fetch(`/api/org/${path.replace(/^\//, "")}`, {
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

export async function createOrganization(body: Record<string, unknown>) {
  const data = await orgFetch<{
    organization: { id: string; name: string; slug: string };
    user: { id: string; email: string; fullName: string; role?: string | null };
    tokens: { accessToken: string; refreshToken: string };
  }>("create", {
    method: "POST",
    body: JSON.stringify(body),
  });
  saveVeriHubSession({
    accessToken: data.tokens.accessToken,
    orgId: data.organization.id,
    user: data.user,
  });
  return data;
}

export async function getOrganization(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  if (!id) throw new Error("Not signed in to VeriHub");
  return orgFetch(`${id}`);
}

export async function listOrgUsers(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  if (!id) throw new Error("Not signed in to VeriHub");
  return orgFetch(`${id}/users`);
}

export async function listOrgModules(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  if (!id) throw new Error("Not signed in to VeriHub");
  return orgFetch<{ modules: unknown[] }>(`${id}/modules`);
}

export async function listOrgRoles(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  if (!id) throw new Error("Not signed in to VeriHub");
  return orgFetch<{ roles: unknown[] }>(`${id}/roles`);
}

export async function updateOrgModules(
  modules: { code: string; enabled: boolean }[],
) {
  return orgFetch("modules/update", {
    method: "POST",
    body: JSON.stringify({ modules }),
  });
}

export async function createOrgUser(body: Record<string, unknown>) {
  return orgFetch("user/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createOrgRole(body: Record<string, unknown>) {
  return orgFetch("role/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
