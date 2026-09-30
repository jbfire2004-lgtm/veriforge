/**
 * Hiring client console → Next `/api/client/*` → SaaS `/client/*`
 * Separate token namespace from VeriHub org JWT.
 */

const TOKEN_KEY = "hiring_client_access_token";
const CLIENT_KEY = "hiring_client_id";
const USER_KEY = "hiring_client_user";

export type HiringClientSession = {
  accessToken: string;
  hiringClientId: string;
  user?: {
    id: string;
    email: string;
    fullName?: string | null;
    role?: string;
    permissions?: string[];
  };
};

export function saveHiringClientSession(session: HiringClientSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(CLIENT_KEY, session.hiringClientId);
  if (session.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearHiringClientSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getHiringClientSession(): HiringClientSession | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const hiringClientId = localStorage.getItem(CLIENT_KEY);
  if (!accessToken || !hiringClientId) return null;
  let user: HiringClientSession["user"];
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw);
  } catch {
    user = undefined;
  }
  return { accessToken, hiringClientId, user };
}

async function clientFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = getHiringClientSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  const res = await fetch(`/api/client/${path.replace(/^\//, "")}`, {
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

export async function hiringClientSignup(body: Record<string, unknown>) {
  const data = await clientFetch<{
    hiringClient: { id: string; companyName: string };
    user: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      permissions: string[];
      hiringClientId: string;
    };
    tokens: { accessToken: string };
  }>("auth/signup", { method: "POST", body: JSON.stringify(body) });
  saveHiringClientSession({
    accessToken: data.tokens.accessToken,
    hiringClientId: data.hiringClient.id,
    user: data.user,
  });
  return data;
}

export async function hiringClientLogin(email: string, password: string) {
  const data = await clientFetch<{
    user: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      permissions: string[];
      hiringClientId: string;
    };
    tokens: { accessToken: string };
  }>("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveHiringClientSession({
    accessToken: data.tokens.accessToken,
    hiringClientId: data.user.hiringClientId,
    user: data.user,
  });
  return data;
}

export async function listContractors() {
  return clientFetch<{
    items: {
      id: string;
      companyName: string;
      slug: string;
      industry: string | null;
      modulesEnabled: string[];
    }[];
    total: number;
  }>("contractors");
}

export async function getContractorScorecard(id: string) {
  return clientFetch<{
    contractor: { id: string; companyName: string };
    globalScorecard: Record<string, number>;
    projectScorecards: {
      projectId: string;
      projectName: string;
      overall: number;
      safety: number;
      quality: number;
      openFindings: number;
    }[];
  }>(`contractor/${id}/scorecard`);
}

export async function getContractorCompliance(id: string) {
  return clientFetch<{
    artifacts: { type: string; label: string; status: string }[];
    incidentHistory: { id: string; severity: string; summary: string }[];
    trainingCompliance: {
      overallPercent: number;
      expiredCredentials: number;
      upcomingExpiries: number;
    };
    auditResults: { id: string; title: string; result: string }[];
  }>(`contractor/${id}/compliance`);
}

export async function awardContractor(
  id: string,
  body: { projectName?: string; notes?: string },
) {
  return clientFetch(`contractor/${id}/award`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function canAward(session: HiringClientSession | null): boolean {
  return Boolean(
    session?.user?.permissions?.includes("contractor.award.manage") ||
      session?.user?.role === "ClientAdmin",
  );
}
