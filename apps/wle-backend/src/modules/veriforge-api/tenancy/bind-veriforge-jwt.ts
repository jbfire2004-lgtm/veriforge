import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { TenantAuthService } from './tenant-auth.service';
import type { VeriForgeRequest } from '../veriforge-request.util';

/**
 * Bind req.user / req.veriforgeTenantId from a signed tenant JWT only.
 */
export function bindVeriForgeTenantJwt(
  req: VeriForgeRequest,
  tenantAuth: TenantAuthService,
): void {
  if (req.veriforgeTenantId && req.user?.role && req.user?.tenantId) {
    return;
  }

  const authHeader = req.headers.authorization;
  const bearer =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  if (!bearer) {
    throw new UnauthorizedException(
      'Bearer access token required for tenant context',
    );
  }

  let claims;
  try {
    claims = tenantAuth.verifyAccessToken(bearer);
  } catch (error) {
    if (
      error instanceof ForbiddenException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    throw new UnauthorizedException('Invalid tenant token');
  }

  req.user = {
    id: claims.sub,
    email: claims.email,
    role: claims.role,
    tenantId: claims.tenantId,
  };
  req.veriforgeTenantId = claims.tenantId;

  const paramTenantId = req.params?.tenantId as string | undefined;
  if (paramTenantId && paramTenantId !== claims.tenantId) {
    throw new ForbiddenException({
      code: 'TENANT_ISOLATION_VIOLATION',
      message: 'JWT tenantId does not match route tenantId',
      jwtTenantId: claims.tenantId,
      routeTenantId: paramTenantId,
    });
  }

  const header = req.headers['x-veriforge-tenant'];
  const headerTenant =
    typeof header === 'string'
      ? header
      : Array.isArray(header)
        ? header[0]
        : null;
  if (headerTenant && headerTenant !== claims.tenantId) {
    throw new ForbiddenException({
      code: 'TENANT_HEADER_MISMATCH',
      message:
        'x-veriforge-tenant does not match JWT tenantId; header alone is never authoritative',
      jwtTenantId: claims.tenantId,
      headerTenantId: headerTenant,
    });
  }
}
