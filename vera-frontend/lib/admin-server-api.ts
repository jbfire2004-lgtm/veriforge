import "server-only";

import type { Session } from "next-auth";
import { getServerAuthSession } from "@/lib/server-session";
import { apiFetchJson } from "@/lib/api-fetch";
import { isAdmin, sessionRole } from "@/lib/phase1-roles";

export class AdminServerAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminServerAuthError";
  }
}

export async function requireAdminSession(): Promise<Session> {
  const session = await getServerAuthSession();
  if (!session?.user) {
    throw new AdminServerAuthError("Not signed in");
  }
  if (!isAdmin(sessionRole(session))) {
    throw new AdminServerAuthError("Admin role required");
  }
  return session;
}

/** Authenticated GET for server components / actions (admin only). */
export async function adminServerGet<T>(path: string): Promise<T> {
  const session = await requireAdminSession();
  return apiFetchJson<T>(path, { session, cache: "no-store" });
}
