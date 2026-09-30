import "server-only";

import { getServerSession, type Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth-options";

type JwtWithAccess = {
  accessToken?: string;
  refreshToken?: string;
};

async function refreshAccessTokenFromApi(
  refreshToken: string,
): Promise<string | undefined> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${apiBase}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return undefined;
    const raw: unknown = await res.json();
    if (raw && typeof raw === "object") {
      const envelope = raw as { data?: { accessToken?: string }; accessToken?: string };
      const token = envelope.data?.accessToken ?? envelope.accessToken;
      if (typeof token === "string" && token.length > 0) {
        return token;
      }
    }
  } catch {
    /* stale refresh — caller may redirect to sign-in */
  }
  return undefined;
}

async function readJwtFromCookies(): Promise<JwtWithAccess | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  if (all.length === 0) return null;

  const secret = authOptions.secret ?? process.env.NEXTAUTH_SECRET;
  const cookieHeader = all.map((c) => `${c.name}=${c.value}`).join("; ");

  const fromHeader = (await getToken({
    req: { headers: { cookie: cookieHeader } },
    secret,
  })) as JwtWithAccess | null;
  if (fromHeader?.accessToken || fromHeader?.refreshToken) {
    return fromHeader;
  }

  return (await getToken({
    req: {
      cookies: Object.fromEntries(all.map((c) => [c.name, c.value])),
    } as Parameters<typeof getToken>[0]["req"],
    secret,
  })) as JwtWithAccess | null;
}

async function resolveAccessToken(
  session: Session,
): Promise<string | undefined> {
  if (typeof session.accessToken === "string" && session.accessToken.length > 0) {
    return session.accessToken;
  }

  const jwt = await readJwtFromCookies();
  if (typeof jwt?.accessToken === "string" && jwt.accessToken.length > 0) {
    return jwt.accessToken;
  }

  if (typeof jwt?.refreshToken === "string" && jwt.refreshToken.length > 0) {
    const refreshed = await refreshAccessTokenFromApi(jwt.refreshToken);
    if (refreshed) {
      return refreshed;
    }
  }

  return undefined;
}

/** Server session with API bearer token attached when present in the JWT cookie. */
export async function getServerAuthSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const accessToken = await resolveAccessToken(session);
  if (accessToken) {
    session.accessToken = accessToken;
  }

  return session;
}

export async function getServerAccessToken(): Promise<string | undefined> {
  const session = await getServerAuthSession();
  return session?.accessToken;
}
