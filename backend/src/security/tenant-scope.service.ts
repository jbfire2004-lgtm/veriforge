import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isSuperAdmin } from '../modules/vera-core/roles';
import type { SecurityActor } from './security.types';

/**
 * Tenant isolation — every data access must resolve to the actor's company
 * unless the actor is a platform super-admin (SUPER_ADMIN / ADMIN).
 * COMPANY_ADMIN is tenant-scoped to their own companyId (no cross-tenant bypass).
 */
@Injectable()
export class TenantScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Platform operators only — not COMPANY_ADMIN. */
  bypassesTenant(actor: SecurityActor): boolean {
    return isSuperAdmin(actor.role);
  }

  resolveCompanyId(
    actor: SecurityActor,
    requestedCompanyId?: number | null,
  ): number | null {
    if (requestedCompanyId != null && Number.isFinite(requestedCompanyId)) {
      return requestedCompanyId;
    }
    return actor.companyId ?? null;
  }

  assertCompanyAccess(actor: SecurityActor, companyId: number): void {
    if (this.bypassesTenant(actor)) return;
    if (actor.companyId == null) {
      throw new ForbiddenException('User is not linked to a company tenant');
    }
    if (actor.companyId !== companyId) {
      throw new ForbiddenException('Cross-tenant company access denied');
    }
  }

  /**
   * Company id for tenant-scoped reads/writes.
   * Non–platform-admins always use their JWT tenant (requested id ignored).
   * SUPER_ADMIN / ADMIN may target an explicit company.
   */
  effectiveCompanyId(
    actor: SecurityActor,
    requestedCompanyId?: number,
  ): number {
    if (this.bypassesTenant(actor)) {
      if (
        requestedCompanyId != null &&
        Number.isFinite(requestedCompanyId) &&
        requestedCompanyId > 0
      ) {
        return requestedCompanyId;
      }
      if (actor.companyId != null) return actor.companyId;
      throw new ForbiddenException('Tenant company context required');
    }
    if (actor.companyId == null) {
      throw new ForbiddenException('User is not linked to a company tenant');
    }
    return actor.companyId;
  }

  async assertWorkerInTenant(
    actor: SecurityActor,
    workerId: number,
  ): Promise<void> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { companyId: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    if (worker.companyId == null) {
      if (!this.bypassesTenant(actor)) {
        throw new ForbiddenException('Worker has no company tenant');
      }
      return;
    }
    this.assertCompanyAccess(actor, worker.companyId);
  }

  async assertInspectionInTenant(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      select: { companyId: true },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');
    this.assertCompanyAccess(actor, inspection.companyId);
  }

  async assertEquipmentInTenant(
    actor: SecurityActor,
    equipmentId: number,
  ): Promise<void> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { companyId: true },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (equipment.companyId == null) {
      if (!this.bypassesTenant(actor)) {
        throw new ForbiddenException('Equipment has no company tenant');
      }
      return;
    }
    this.assertCompanyAccess(actor, equipment.companyId);
  }

  /** Prisma filter helper — scopes queries to actor tenant when not admin. */
  companyWhere<T extends { companyId?: number }>(
    actor: SecurityActor,
    requestedCompanyId?: number,
  ): Prisma.IntFilter | number | undefined {
    const companyId = this.resolveCompanyId(actor, requestedCompanyId);
    if (companyId != null) {
      this.assertCompanyAccess(actor, companyId);
      return companyId;
    }
    if (this.bypassesTenant(actor)) return undefined;
    if (actor.companyId != null) return actor.companyId;
    throw new ForbiddenException('Tenant company context required');
  }
}
