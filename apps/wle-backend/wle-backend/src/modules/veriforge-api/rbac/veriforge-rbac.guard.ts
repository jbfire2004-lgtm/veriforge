import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  normalizeVeriForgeRoleName,
  VERIFORGE_ROLE_PERMISSIONS,
  type VeriForgeRoleName,
} from './permissions';
import { VERIFORGE_PERMISSIONS_KEY } from './permissions.decorator';
import type { VeriForgePermission } from './permissions';
import type { VeriForgeRequest } from '../veriforge-request.util';
import { TenantAuthService } from '../tenancy/tenant-auth.service';
import { bindVeriForgeTenantJwt } from '../tenancy/bind-veriforge-jwt';

/**
 * JWT-only RBAC. Client-supplied role headers are intentionally ignored.
 * When TenantAuthService is injected (Nest), Bearer tenant JWT is required
 * and populates request.user / request.veriforgeTenantId.
 */
@Injectable()
export class VeriForgeRbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly tenantAuth?: TenantAuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<VeriForgeRequest>();

    if (request.headers['x-veriforge-role'] != null) {
      throw new ForbiddenException({
        code: 'ROLE_HEADER_REJECTED',
        message:
          'Client role headers are not accepted. Role is taken only from signed JWT claims.',
      });
    }

    if (this.tenantAuth) {
      bindVeriForgeTenantJwt(request, this.tenantAuth);
    }

    const required = this.reflector.getAllAndOverride<VeriForgePermission[]>(
      VERIFORGE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    if (!request.user?.role) {
      throw new UnauthorizedException(
        'Authenticated user with JWT role claim is required for RBAC evaluation',
      );
    }

    const role = normalizeVeriForgeRoleName(request.user.role);
    if (!role) {
      throw new ForbiddenException(
        'VeriForge role missing or unrecognized for RBAC evaluation',
      );
    }

    if (role === 'SuperAdmin') return true;

    const granted = new Set(
      VERIFORGE_ROLE_PERMISSIONS[role as VeriForgeRoleName] ?? [],
    );
    const allowed = required.every((permission) => granted.has(permission));
    if (!allowed) {
      throw new ForbiddenException(
        `Missing VeriForge permission(s): ${required.join(', ')}`,
      );
    }
    return true;
  }
}
