import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { SmsAccessPlane, UserRole } from '@prisma/client';
import { SmsAuditService } from '../common/sms-audit.service';
import type { SmsAuthUser, SmsRequestScope } from '../types';

const COMPANY_PLANE_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPANY_ADMIN,
];

@Injectable()
export class PlaneScopeGuard implements CanActivate {
  constructor(private readonly audit: SmsAuditService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const path: string = req.route?.path ?? req.url ?? '';
    if (path.includes('/health') || String(req.url ?? '').includes('/health')) {
      return true;
    }

    const user = req.user as SmsAuthUser | undefined;
    if (!user?.id) {
      throw new ForbiddenException('Authentication required');
    }

    const planeHeader = String(
      req.headers['x-vera-plane'] ?? 'project',
    ).toLowerCase();
    if (!['project', 'company', 'subcontractor'].includes(planeHeader)) {
      throw new BadRequestException(
        'X-Vera-Plane must be project|company|subcontractor',
      );
    }
    const plane = planeHeader as SmsAccessPlane;

    const companyId =
      Number(req.query?.companyId ?? req.body?.companyId ?? user.companyId) ||
      user.companyId;
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    // Non–super-admin cannot cross tenants
    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.companyId != null &&
      user.companyId !== companyId
    ) {
      await this.audit.log({
        scope: {
          companyId,
          userId: user.id,
          plane,
          requestId: req.headers['x-request-id'],
        },
        action: 'authz.deny',
        entityType: 'tenant',
        payload: { reason: 'cross_tenant' },
      });
      throw new ForbiddenException('Tenant scope denied');
    }

    if (plane === SmsAccessPlane.company && !COMPANY_PLANE_ROLES.includes(user.role)) {
      // PROJECT_MANAGER may read company KPIs in some policies — allow PM+ for company plane reads
      const allowedCompanyRead: UserRole[] = [
        ...COMPANY_PLANE_ROLES,
        UserRole.PROJECT_MANAGER,
      ];
      if (!allowedCompanyRead.includes(user.role) && req.method !== 'GET') {
        await this.audit.log({
          scope: {
            companyId,
            userId: user.id,
            plane,
            requestId: req.headers['x-request-id'],
          },
          action: 'authz.deny',
          entityType: 'plane',
          payload: { reason: 'company_plane_role', role: user.role },
        });
        throw new ForbiddenException('Company plane not allowed for role');
      }
    }

    const projectIdRaw = req.query?.projectId ?? req.body?.projectId;
    const projectId = projectIdRaw != null ? Number(projectIdRaw) : undefined;
    const allowedProjectIds = user.projectIds ?? (projectId ? [projectId] : []);

    if (
      plane === SmsAccessPlane.project &&
      projectId != null &&
      allowedProjectIds.length > 0 &&
      !allowedProjectIds.includes(projectId) &&
      user.role !== UserRole.SUPER_ADMIN &&
      user.role !== UserRole.COMPANY_ADMIN &&
      user.role !== UserRole.ADMIN
    ) {
      await this.audit.log({
        scope: {
          companyId,
          userId: user.id,
          plane,
          requestId: req.headers['x-request-id'],
        },
        action: 'authz.deny',
        entityType: 'project',
        entityId: String(projectId),
        payload: { reason: 'project_membership' },
      });
      throw new ForbiddenException('Project not in allowed set');
    }

    if (
      plane === SmsAccessPlane.subcontractor &&
      !user.subcontractorCompanyId &&
      user.role !== UserRole.CONTRACTOR_ADMIN &&
      user.role !== UserRole.CONTRACTOR_USER &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Subcontractor plane requires sub token');
    }

    const scope: SmsRequestScope = {
      companyId,
      plane,
      projectId,
      allowedProjectIds,
      subcontractorCompanyId: user.subcontractorCompanyId ?? null,
      role: user.role,
      userId: user.id,
      requestId: req.headers['x-request-id'] as string | undefined,
    };
    req.smsScope = scope;
    return true;
  }
}

export function getSmsScope(req: { smsScope?: SmsRequestScope }): SmsRequestScope {
  if (!req.smsScope) {
    throw new ForbiddenException('SMS scope missing');
  }
  return req.smsScope;
}
