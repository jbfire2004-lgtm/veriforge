import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  isCompanyAdmin,
  isSuperAdmin,
  isSupervisor,
  SUPERVISOR_ROLES,
} from '../modules/vera-core/roles';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
import { parseInspectionSharing } from './pm-inspection-sharing.types';

@Injectable()
export class PmInspectionAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subcontractorResolver: PmInspectionSubcontractorResolverService,
  ) {}

  isProjectOwnerRole(role: UserRole): boolean {
    return (
      isSuperAdmin(role) ||
      isCompanyAdmin(role) ||
      SUPERVISOR_ROLES.includes(role)
    );
  }

  async loadInspectionContext(inspectionId: string) {
    const row = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      select: {
        id: true,
        companyId: true,
        projectId: true,
        inspectorUserId: true,
        status: true,
        sharingJson: true,
        project: { select: { companyId: true, name: true } },
      },
    });
    if (!row) throw new NotFoundException('Inspection not found');
    return {
      ...row,
      sharing: parseInspectionSharing(row.sharingJson),
    };
  }

  async actorCompanyOnProject(
    actor: SecurityActor,
    projectId: number,
  ): Promise<boolean> {
    if (actor.companyId == null) return false;
    const companies = await this.subcontractorResolver.listWithNames(projectId);
    return companies.some((c) => c.id === actor.companyId);
  }

  async actorWorkerOnProject(
    actor: SecurityActor,
    projectId: number,
  ): Promise<boolean> {
    if (!actor.id) return false;
    const worker = await this.prisma.worker.findFirst({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!worker) return false;
    const assignment = await this.prisma.projectAssignment.findFirst({
      where: {
        projectId,
        workerId: worker.id,
        status: 'ACTIVE',
      },
    });
    return !!assignment;
  }

  async canViewInspectionReport(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<boolean> {
    const ctx = await this.loadInspectionContext(inspectionId);
    if (isSuperAdmin(actor.role)) return true;

    if (actor.companyId === ctx.companyId) return true;
    if (
      actor.companyId === ctx.project.companyId &&
      this.isProjectOwnerRole(actor.role)
    ) {
      return true;
    }
    if (actor.id === ctx.inspectorUserId) return true;

    const submitted = ctx.status !== 'draft' && ctx.status !== 'in_progress';
    if (!submitted) return false;

    if (ctx.sharing.shareReportWithContractors && actor.companyId != null) {
      if (await this.actorCompanyOnProject(actor, ctx.projectId)) return true;
    }

    if (ctx.sharing.shareReportWithWorkers) {
      if (await this.actorWorkerOnProject(actor, ctx.projectId)) return true;
    }

    return false;
  }

  async assertCanViewInspectionReport(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    if (!(await this.canViewInspectionReport(actor, inspectionId))) {
      throw new ForbiddenException('Inspection report access denied');
    }
  }

  async assertCanManageInspectionSharing(
    actor: SecurityActor,
    inspectionId: string,
  ): Promise<void> {
    const ctx = await this.loadInspectionContext(inspectionId);
    if (isSuperAdmin(actor.role) || isCompanyAdmin(actor.role)) return;
    if (
      actor.companyId === ctx.project.companyId &&
      (isSupervisor(actor.role) || actor.role === UserRole.PROJECT_MANAGER)
    ) {
      return;
    }
    if (actor.companyId === ctx.companyId && isSupervisor(actor.role)) return;
    throw new ForbiddenException(
      'Only the project owner can change report sharing',
    );
  }

  async canViewProjectFindingsLog(
    actor: SecurityActor,
    projectId: number,
  ): Promise<boolean> {
    if (isSuperAdmin(actor.role)) return true;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    if (!project) return false;
    if (
      actor.companyId === project.companyId &&
      this.isProjectOwnerRole(actor.role)
    ) {
      return true;
    }
    if (
      actor.companyId != null &&
      (await this.actorCompanyOnProject(actor, projectId))
    ) {
      return true;
    }
    if (await this.actorWorkerOnProject(actor, projectId)) return true;
    return false;
  }

  async assertCanViewProjectFindingsLog(
    actor: SecurityActor,
    projectId: number,
  ): Promise<void> {
    if (!(await this.canViewProjectFindingsLog(actor, projectId))) {
      throw new ForbiddenException('Findings log access denied');
    }
  }
}
