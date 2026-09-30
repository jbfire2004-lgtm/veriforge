import { createSecretKey, type KeyObject } from "crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { jwtVerify, type JWTPayload } from "jose";
import type { AppConfig } from "../config";
import { VeriAgentError } from "../core/types";

export type VeriAgentJwtClaims = JWTPayload & {
  companyId?: number;
  role?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      bypass: boolean;
      claims?: VeriAgentJwtClaims;
      sub?: string;
      companyId?: number;
    };
  }
}

const PUBLIC_PATH_PREFIXES = ["/health/", "/metrics"];

function isPublicPath(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  if (path === "/metrics") return true;
  return PUBLIC_PATH_PREFIXES.some((p) => path.startsWith(p));
}

function isProtectedPath(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return path.startsWith("/veriagent/") || path.startsWith("/v1/");
}

export function assertAuthBootConfig(config: AppConfig): void {
  if (config.isProd && config.AUTH_DEV_BYPASS) {
    throw new Error(
      "AUTH_DEV_BYPASS is not allowed when NODE_ENV=production",
    );
  }
  const needsSecret = config.isProd || !config.AUTH_DEV_BYPASS;
  if (needsSecret && !config.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is required when AUTH_DEV_BYPASS is disabled or NODE_ENV=production",
    );
  }
}

function secretKey(config: AppConfig): KeyObject {
  if (!config.JWT_SECRET) {
    throw new VeriAgentError(500, "auth_misconfigured", "JWT_SECRET not set");
  }
  return createSecretKey(Buffer.from(config.JWT_SECRET, "utf8"));
}

export async function verifyBearerJwt(
  token: string,
  config: AppConfig,
): Promise<VeriAgentJwtClaims> {
  const { payload } = await jwtVerify(token, secretKey(config), {
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    algorithms: ["HS256"],
  });
  return payload as VeriAgentJwtClaims;
}

/**
 * Fastify onRequest hook: JWT for /veriagent/* and /v1/*; health/metrics public.
 * AUTH_DEV_BYPASS only allowed outside production (enforced at boot).
 */
export function createJwtAuthHook(config: AppConfig) {
  return async function jwtAuthHook(
    req: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (!isProtectedPath(req.url) || isPublicPath(req.url)) {
      return;
    }

    if (config.AUTH_DEV_BYPASS && !config.isProd) {
      req.auth = { bypass: true };
      return;
    }

    const header = req.headers.authorization;
    if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
      throw new VeriAgentError(401, "unauthorized", "Missing Bearer token");
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new VeriAgentError(401, "unauthorized", "Missing Bearer token");
    }

    try {
      const claims = await verifyBearerJwt(token, config);
      const companyId =
        typeof claims.companyId === "number" ? claims.companyId : undefined;
      req.auth = {
        bypass: false,
        claims,
        sub: typeof claims.sub === "string" ? claims.sub : undefined,
        companyId,
      };
    } catch (err) {
      if (err instanceof VeriAgentError) throw err;
      throw new VeriAgentError(401, "unauthorized", "Invalid or expired token");
    }
  };
}

/**
 * After body parse: JWT must carry companyId matching body.tenant.companyId.
 * Fail closed when the claim is absent (no static-token any-tenant invoke).
 */
export function assertTenantMatchesJwt(
  req: FastifyRequest,
  tenantCompanyId: number | undefined,
): void {
  if (tenantCompanyId == null) return;
  const jwtCompanyId = req.auth?.companyId;
  if (jwtCompanyId == null) {
    throw new VeriAgentError(
      403,
      "tenant_mismatch",
      "JWT companyId is required and must match request tenant",
    );
  }
  if (jwtCompanyId !== tenantCompanyId) {
    throw new VeriAgentError(
      403,
      "tenant_mismatch",
      "JWT companyId does not match request tenant",
    );
  }
}
