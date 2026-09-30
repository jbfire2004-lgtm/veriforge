import type { AuthPrincipal, OrgJwtPayload } from "../../../types/auth";
import { UnauthorizedError } from "../../utils/errors";

export interface AuthContext {
  principal: AuthPrincipal;
  accessToken: string;
}

export function requireOrgPrincipal(ctx: AuthContext | null): OrgJwtPayload {
  if (!ctx?.principal || ctx.principal.ns !== "organization") {
    throw new UnauthorizedError("Organization access token required");
  }
  return ctx.principal;
}

export function parseBearer(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

/**
 * Runtime implementation lives in veriforge-saas-service auth middleware.
 * This module is the DDD contract for org / client / developer namespaces.
 */
export function createAuthMiddleware() {
  return {
    requireAuth(ctx: AuthContext | null): AuthContext {
      if (!ctx) throw new UnauthorizedError("Access token required");
      return ctx;
    },
  };
}
