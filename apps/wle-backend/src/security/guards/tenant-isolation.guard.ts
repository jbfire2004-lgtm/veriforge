import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TENANT_SCOPE_PARAM_KEY } from '../decorators/tenant-scoped.decorator';
import type { SecurityActor } from '../security.types';
import { TenantScopeService } from '../tenant-scope.service';

/**
 * Enforces companyId param/query/body matches actor tenant (unless admin).
 * Opt-in via @TenantScoped('companyId').
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenant: TenantScopeService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName =
      this.reflector.getAllAndOverride<string>(TENANT_SCOPE_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? null;
    if (!paramName) return true;

    const request = context.switchToHttp().getRequest<{
      user?: SecurityActor;
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: Record<string, unknown>;
    }>();

    const actor = request.user;
    if (!actor?.role) return false;

    const raw =
      request.params?.[paramName] ??
      request.query?.[paramName] ??
      (request.body?.[paramName] != null
        ? String(request.body[paramName])
        : undefined);

    if (!raw) return true;

    const companyId = Number(raw);
    if (!Number.isFinite(companyId)) return true;

    this.tenant.assertCompanyAccess(actor, companyId);
    return true;
  }
}
