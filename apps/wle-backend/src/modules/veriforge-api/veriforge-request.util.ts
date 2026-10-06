import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export type VeriForgeRequestUser = {
  id?: number;
  email?: string;
  role?: string;
  tenantId?: string;
  companyId?: number | string;
};

export type VeriForgeRequest = Request & {
  user?: VeriForgeRequestUser;
  veriforgeTenantId?: string;
};

export function resolveUserId(
  req: VeriForgeRequest,
  body?: unknown,
): number | null {
  if (req.user?.id) return req.user.id;
  return null;
}

/**
 * Tenant context is JWT-only. Headers, query, and body tenantId are never
 * authoritative. Route params are compared by VeriForgeTenantGuard.
 */
export function resolveTenantId(
  req: VeriForgeRequest,
  _body?: unknown,
  paramTenantId?: string,
): string | null {
  const jwtTenant = req.veriforgeTenantId ?? req.user?.tenantId ?? null;
  if (!jwtTenant) return null;
  if (paramTenantId && paramTenantId !== jwtTenant) return jwtTenant;
  return jwtTenant;
}

export function requireTenantId(
  req: VeriForgeRequest,
  body?: unknown,
  paramTenantId?: string,
): string {
  const tenantId = resolveTenantId(req, body, paramTenantId);
  if (!tenantId) {
    throw new UnauthorizedException(
      'Authenticated tenant JWT is required; tenantId is never taken from headers or body',
    );
  }
  return tenantId;
}
