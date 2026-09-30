import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/auth";

function publicPost<T>(path: string, body: unknown) {
  return apiFetchJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    requireAuth: false,
    timeoutMs: 12_000,
  });
}

export async function refreshSession(refreshToken: string) {
  return publicPost<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
      id: number;
      email: string;
      role: string;
      companyId?: number | null;
      companyName?: string | null;
    };
  }>(`${BASE}/refresh`, { refreshToken });
}

export async function requestPasswordReset(email: string) {
  return publicPost<{ ok: boolean; resetUrl?: string }>(`${BASE}/forgot-password`, {
    email,
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return publicPost<{ ok: boolean }>(`${BASE}/reset-password`, {
    token,
    newPassword,
  });
}

export async function logout(refreshToken: string) {
  return publicPost<{ ok: boolean }>(`${BASE}/logout`, { refreshToken });
}
