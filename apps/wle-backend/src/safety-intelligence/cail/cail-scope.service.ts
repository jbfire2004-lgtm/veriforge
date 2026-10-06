import { Injectable } from '@nestjs/common';
import { ProjectSafetyRoleType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PRIME_ROLES } from './cail.types';

export type CailActor = {
  id: number;
  role: UserRole;
  companyId?: number | null;
  projectRoles?: Array<{ projectId: number; role: ProjectSafetyRoleType }>;
};

const VERIFY_PROJECT_ROLES = new Set<ProjectSafetyRoleType>([
  ProjectSafetyRoleType.prime_admin,
  ProjectSafetyRoleType.company_safety_manager,
]);

@Injectable()
export class CailScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveActor(
    userId: number,
    role: UserRole,
    projectId?: number,
  ): Promise<CailActor> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true },
    });
    const projectRoles = await this.prisma.projectSafetyRole.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
      },
      select: { projectId: true, role: true },
    });
    return {
      id: userId,
      role: user?.role ?? role,
      companyId: user?.companyId,
      projectRoles,
    };
  }

  isPrime(actor: CailActor): boolean {
    return PRIME_ROLES.has(actor.role);
  }

  isClientReadonly(actor: CailActor, projectId?: number): boolean {
    if (!actor.projectRoles?.length) return false;
    const roles = projectId
      ? actor.projectRoles.filter((r) => r.projectId === projectId)
      : actor.projectRoles;
    return roles.some((r) => r.role === ProjectSafetyRoleType.client_readonly);
  }

  /** Prisma where clause for listing/filtering CAIL entries */
  buildListWhere(
    actor: CailActor,
    filters: {
      projectId?: number;
      status?: string;
      sourceType?: string;
      ownerCompanyId?: number;
    },
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.sourceType) where.sourceType = filters.sourceType;

    if (this.isPrime(actor)) {
      if (filters.ownerCompanyId) where.ownerCompanyId = filters.ownerCompanyId;
      if (this.isClientReadonly(actor, filters.projectId)) {
        where.severity = { in: ['high', 'critical'] };
      }
      return where;
    }

    if (actor.companyId) {
      where.ownerCompanyId = actor.companyId;
    } else {
      where.ownerCompanyId = -1;
    }

    const workerScoped = actor.projectRoles?.some(
      (r) =>
        (!filters.projectId || r.projectId === filters.projectId) &&
        r.role === ProjectSafetyRoleType.worker,
    );
    if (workerScoped && !this.isPrime(actor)) {
      where.assignedUserId = actor.id;
    }

    return where;
  }

  canVerify(actor: CailActor, projectId?: number): boolean {
    if (this.isPrime(actor)) return true;
    if (actor.role === UserRole.SUPERVISOR) return true;
    if (!projectId || !actor.projectRoles?.length) return false;
    return actor.projectRoles.some(
      (r) => r.projectId === projectId && VERIFY_PROJECT_ROLES.has(r.role),
    );
  }

  canAccessEntry(
    actor: CailActor,
    entry: {
      ownerCompanyId: number;
      projectId: number;
      assignedUserId?: number | null;
    },
  ): boolean {
    if (this.isPrime(actor)) return true;
    if (actor.companyId !== entry.ownerCompanyId) return false;
    const workerOnly = actor.projectRoles?.some(
      (r) =>
        r.projectId === entry.projectId &&
        r.role === ProjectSafetyRoleType.worker,
    );
    if (workerOnly) {
      return entry.assignedUserId === actor.id;
    }
    return true;
  }
}
