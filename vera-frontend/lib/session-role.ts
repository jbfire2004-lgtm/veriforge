import type { Session } from "next-auth";
import { sessionRole } from "@/lib/phase1-roles";

/** Read `role` from a VERA API JWT access token payload. */
export function roleFromAccessToken(accessToken: string): string | null {
  try {
    const part = accessToken.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : atob(padded)
    ) as { role?: unknown };
    const role = json?.role;
    return typeof role === "string" && role.length > 0 ? role : null;
  } catch {
    return null;
  }
}

/**
 * Best-effort role for server guards and nav — prefers NextAuth `user.role`,
 * then the signed API JWT on the session.
 */
export function resolveSessionRole(
  session: Session | null | undefined
): string | null {
  const fromUser = sessionRole(session);
  if (fromUser) return fromUser;
  const token = session?.accessToken;
  if (typeof token === "string") {
    return roleFromAccessToken(token);
  }
  return null;
}
