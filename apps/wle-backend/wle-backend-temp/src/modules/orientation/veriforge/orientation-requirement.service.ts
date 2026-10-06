import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../../audit/audit-actions';
import type {
  CreateOrientationRequirementInput,
  ResolveRequirementsInput,
} from './orientation.types';

@Injectable()
export class OrientationRequirementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    input: CreateOrientationRequirementInput,
    actor: { id: number; companyId?: number },
  ) {
    const def = await this.prisma.orientationDefinition.findUnique({
      where: { id: input.orientationId },
    });
    if (!def) throw new NotFoundException('Orientation definition not found');
    if (!def.isPublished) {
      throw new BadRequestException(
        'Only published orientations can be assigned as requirements',
      );
    }
    if (def.companyId !== input.companyId) {
      throw new BadRequestException(
        'orientationId does not belong to companyId',
      );
    }

    const row = await this.prisma.orientationRequirement.create({
      data: {
        orientationId: input.orientationId,
        companyId: input.companyId,
        projectId: input.projectId,
        siteId: input.siteId,
        tradeId: input.tradeId,
        unionDispatchType: input.unionDispatchType,
        mustCompleteBefore: input.mustCompleteBefore,
        isActive: input.isActive ?? true,
      },
      include: { orientation: true },
    });

    await this.auditLog.logAudit(
      { id: actor.id, companyId: actor.companyId ?? input.companyId },
      AuditAction.ORIENTATION_REQUIREMENT_CREATED,
      {
        type: AuditEntityType.ORIENTATION_REQUIREMENT,
        id: row.id,
        tenantId: input.companyId,
      },
      {
        orientationId: row.orientationId,
        projectId: row.projectId,
        mustCompleteBefore: row.mustCompleteBefore,
      },
    );

    return row;
  }

  async list(filters: {
    companyId: number;
    projectId?: number;
    workerId?: number;
    isActive?: boolean;
  }) {
    if (filters.workerId) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: filters.workerId },
        include: {
          projectAssignments: {
            where: { status: 'ACTIVE' },
            take: 20,
          },
        },
      });
      if (!worker) throw new NotFoundException('Worker not found');

      const projectIds = filters.projectId
        ? [filters.projectId]
        : worker.projectAssignments.map((a) => a.projectId);

      return this.resolveForWorker({
        workerId: filters.workerId,
        companyId: filters.companyId,
        projectId: projectIds[0],
        tradeId: worker.projectAssignments[0]?.role ?? undefined,
      });
    }

    return this.prisma.orientationRequirement.findMany({
      where: {
        companyId: filters.companyId,
        ...(filters.projectId != null
          ? { OR: [{ projectId: filters.projectId }, { projectId: null }] }
          : {}),
        ...(filters.isActive != null ? { isActive: filters.isActive } : {}),
      },
      include: { orientation: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async update(
    id: string,
    input: Partial<CreateOrientationRequirementInput> & { isActive?: boolean },
    actor: { id: number; companyId?: number },
  ) {
    const existing = await this.prisma.orientationRequirement.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Orientation requirement not found');

    const row = await this.prisma.orientationRequirement.update({
      where: { id },
      data: {
        ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
        ...(input.siteId !== undefined ? { siteId: input.siteId } : {}),
        ...(input.tradeId !== undefined ? { tradeId: input.tradeId } : {}),
        ...(input.unionDispatchType !== undefined
          ? { unionDispatchType: input.unionDispatchType }
          : {}),
        ...(input.mustCompleteBefore != null
          ? { mustCompleteBefore: input.mustCompleteBefore }
          : {}),
        ...(input.isActive != null ? { isActive: input.isActive } : {}),
      },
      include: { orientation: true },
    });

    await this.auditLog.logAudit(
      { id: actor.id, companyId: actor.companyId ?? existing.companyId },
      AuditAction.ORIENTATION_REQUIREMENT_UPDATED,
      {
        type: AuditEntityType.ORIENTATION_REQUIREMENT,
        id: row.id,
        tenantId: existing.companyId,
      },
      { isActive: row.isActive },
    );

    return row;
  }

  /**
   * Resolve required orientations for a worker from company/project/site/trade/dispatch scope.
   */
  async resolveForWorker(input: ResolveRequirementsInput) {
    const clauses: Prisma.OrientationRequirementWhereInput[] = [
      { companyId: input.companyId, projectId: null, siteId: null, tradeId: null },
    ];
    if (input.projectId != null) {
      clauses.push({ companyId: input.companyId, projectId: input.projectId });
    }
    if (input.siteId != null) {
      clauses.push({ companyId: input.companyId, siteId: input.siteId });
    }
    if (input.tradeId) {
      clauses.push({ companyId: input.companyId, tradeId: input.tradeId });
    }
    if (input.unionDispatchType) {
      clauses.push({
        companyId: input.companyId,
        unionDispatchType: input.unionDispatchType,
      });
    }

    const rows = await this.prisma.orientationRequirement.findMany({
      where: {
        isActive: true,
        OR: clauses,
      },
      include: {
        orientation: true,
      },
      take: 200,
    });

    // Prefer published definitions; keep unpublished for admins via list(), not gating.
    const published = rows.filter((r) => r.orientation.isPublished);

    // Dedupe by orientationId (most specific scope wins — later clauses overwrite).
    const byOrientation = new Map<string, (typeof published)[number]>();
    for (const row of published) {
      byOrientation.set(row.orientationId, row);
    }
    return Array.from(byOrientation.values());
  }
}
