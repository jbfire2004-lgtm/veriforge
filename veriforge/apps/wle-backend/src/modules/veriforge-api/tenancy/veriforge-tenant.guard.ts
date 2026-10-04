import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantAuthService } from './tenant-auth.service';
import { bindVeriForgeTenantJwt } from './bind-veriforge-jwt';
import type { VeriForgeRequest } from '../veriforge-request.util';

/**
 * Fail-closed tenant resolution: valid Bearer JWT is required.
 * Route tenantId must match JWT tenantId when present.
 * Spoofable headers (x-veriforge-tenant) alone are never trusted.
 */
@Injectable()
export class VeriForgeTenantGuard implements CanActivate {
  constructor(private readonly tenantAuth: TenantAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<VeriForgeRequest>();
    bindVeriForgeTenantJwt(req, this.tenantAuth);
    return true;
  }
}
