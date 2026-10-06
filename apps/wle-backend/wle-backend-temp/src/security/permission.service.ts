import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CONTRACTOR_ROLES,
  isCompanyAdmin,
  isSuperAdmin,
  isSupervisor,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
} from '../modules/vera-core/roles';
import {
  Permission,
  type PermissionKey,
  type SecurityActor,
} from './security.types';
import { TenantScopeService } from './tenant-scope.service';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantScopeService,
  ) {}

  /** Synchronous role-matrix check (no DB). */
  hasPermission(actor: SecurityActor, permission: PermissionKey): boolean {
    const role = actor.role;
    switch (permission) {
      case Permission.ADMIN_ACCESS:
        return isSuperAdmin(role) || isCompanyAdmin(role);
      case Permission.PM_ACCESS:
        return (
          isSupervisor(role) ||
          role === UserRole.WORKER ||
          isContractorRole(role)
        );
      case Permission.CORE_ACCESS:
        return STAFF_ROLES.includes(role);
      case Permission.CONTRACTOR_PORTAL_ACCESS:
        return CONTRACTOR_ROLES.includes(role) || isSupervisor(role);
      case Permission.COMPANY_READINESS_VIEW:
        return SUPERVISOR_ROLES.includes(role);
      case Permission.WORKER_VIEW:
        return STAFF_ROLES.includes(role) || CONTRACTOR_ROLES.includes(role);
      case Permission.WORKER_EDIT:
        return SUPERVISOR_ROLES.includes(role);
      case Permission.INSPECTION_VIEW:
        return STAFF_ROLES.includes(role) || CONTRACTOR_ROLES.includes(role);
      case Permission.INSPECTION_EDIT:
      case Permission.INSPECTION_SUBMIT:
        return SUPERVISOR_ROLES.includes(role) || role === UserRole.WORKER;
      case Permission.TEMPLATE_MANAGE:
        return SUPERVISOR_ROLES.includes(role);
      default:
        return false;
    }
  }

  assertPermission(actor: SecurityActor, permission: PermissionKey): void {
    if (!this.hasPermission(actor, permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }

  async canViewWorker(
    actor: SecurityActor,
    workerId: number,
  ): Promise<boolean> {
    if (!this.hasPermission(actor, Permission.WORKER_VIEW)) return false;
    try {
      await this.tenant.assertWorkerInTenant(actor, workerId);
      return true;
    } catch {
      return false;
    }
  }

  async assertCanViewWorker(
    actor: SecurityActor,
    workerId: number,
  ): Promise<void> {
    this.assertPermission(actor, Permission.WORKER_VIEW);
    await this.tenant.assertWorkerInTenant(actor, workerId);
  }

  async assertCanEditWorker(
    actor: SecurityActor,
    workerId: number,
  ): Promise<void> {
    this.assertPermission(actor, Permission.WORKER_EDIT);
    await this.tenant.assertWorkerInTenant(actor, workerId);
  }

  async canViewInspection(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<boolean> {
    if (!this.hasPermission(actor, Permission.INSPECTION_VIEW)) return false;
    try {
      await this.tenant.assertInspectionInTenant(actor, inspectionId);
      return true;
    } catch {
      return false;
    }
  }

  async assertCanViewInspection(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    this.assertPermission(actor, Permission.INSPECTION_VIEW);
    await this.tenant.assertInspectionInTenant(actor, inspectionId);
  }

  async assertCanEditInspection(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    this.assertPermission(actor, Permission.INSPECTION_EDIT);
    await this.tenant.assertInspectionInTenant(actor, inspectionId);
  }

  async assertCanSubmitInspection(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    this.assertPermission(actor, Permission.INSPECTION_SUBMIT);
    await this.tenant.assertInspectionInTenant(actor, inspectionId);
  }

  async assertCanViewCompanyReadiness(
    actor: SecurityActor,
    companyId?: number,
  ): Promise<void> {
    this.assertPermission(actor, Permission.COMPANY_READINESS_VIEW);
    const resolved = this.tenant.resolveCompanyId(actor, companyId);
    if (resolved != null) {
      this.tenant.assertCompanyAccess(actor, resolved);
    }
  }

  async assertPmModuleAccess(actor: SecurityActor): Promise<void> {
    this.assertPermission(actor, Permission.PM_ACCESS);
  }

  /** Resolve worker company for tenant checks; hides existence from other tenants. */
  async loadWorkerCompanyId(workerId: number): Promise<number | null> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { companyId: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker.companyId;
  }

  /** Resolve inspection tenant company. */
  async loadInspectionCompanyId(inspectionId: string): Promise<number> {
    const row = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      select: { companyId: true },
    });
    if (!row) throw new NotFoundException('Inspection not found');
    return row.companyId;
  }
}

function isContractorRole(role: UserRole): boolean {
  return CONTRACTOR_ROLES.includes(role);
}
