import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { isCompanyAdmin, isSuperAdmin } from '../../vera-core/roles';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';
import { COMPANY_SCOPE_KEY } from '../decorators/scoped.decorator';

/**
 * Enforces company-level scoping from route/query/body (§1 authorization).
 * Super/company admins may access any company in their scope; workers forbidden.
 */
@Injectable()
export class CompanyScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName =
      this.reflector.getAllAndOverride<string>(COMPANY_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'companyId';

    const request = context.switchToHttp().getRequest<{
      user?: { role?: string; companyId?: number };
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: Record<string, unknown>;
    }>();

    const user = request.user;
    if (!user?.role) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Authentication required',
      );
    }

    const role = user.role as UserRole;
    if (isSuperAdmin(role) || isCompanyAdmin(role)) {
      return true;
    }

    const raw =
      request.params?.[paramName] ??
      request.query?.[paramName] ??
      (request.body?.[paramName] != null
        ? String(request.body[paramName])
        : undefined);

    if (!raw) return true;

    const companyId = Number(raw);
    if (user.companyId != null && user.companyId !== companyId) {
      throw new ApiException(
        ApiErrorCode.FORBIDDEN,
        'Access denied for this company',
        { companyId, userCompanyId: user.companyId },
      );
    }

    return true;
  }
}
