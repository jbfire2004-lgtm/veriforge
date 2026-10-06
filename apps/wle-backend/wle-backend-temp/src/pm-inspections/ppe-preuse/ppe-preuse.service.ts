import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../../safety-intelligence/cail/cail-scope.service';
import type { CreatePpePreUseDto } from './create-ppe-preuse.dto';
import {
  computePpePreUseOverall,
  PPE_PREUSE_CHECKLIST,
} from './ppe-preuse.constants';

@Injectable()
export class PpePreUseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: CailScopeService,
  ) {}

  checklist() {
    return PPE_PREUSE_CHECKLIST;
  }

  async create(dto: CreatePpePreUseDto, actor: CailActor) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const companyId = dto.companyId ?? actor.companyId ?? project.companyId;
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const known = new Set(PPE_PREUSE_CHECKLIST.map((i) => i.id));
    for (const item of dto.items) {
      if (!known.has(item.id)) {
        throw new BadRequestException(`Unknown checklist item: ${item.id}`);
      }
    }

    const overallResult = computePpePreUseOverall(dto.items);
    if (overallResult === 'fail' && !dto.removedFromService) {
      throw new BadRequestException(
        'Damaged or failed PPE must be removed from service before submit',
      );
    }
    if (overallResult === 'pass' && !dto.acknowledgedSafeToWork) {
      throw new BadRequestException(
        'Acknowledge kit is safe to work before submit',
      );
    }

    return this.prisma.ppePreUseInspection.create({
      data: {
        projectId: dto.projectId,
        companyId,
        workerUserId: actor.id,
        workerId: dto.workerId,
        locationNote: dto.locationNote,
        taskType: dto.taskType,
        overallResult,
        items: dto.items as unknown as Prisma.InputJsonValue,
        deficiencies: dto.deficiencies,
        removedFromService: dto.removedFromService ?? false,
        acknowledgedSafeToWork: dto.acknowledgedSafeToWork ?? false,
        inspectedAt: dto.inspectedAt ? new Date(dto.inspectedAt) : new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        workerUser: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async list(
    actor: CailActor,
    filters: { projectId?: number; companyId?: number },
  ) {
    const where: Prisma.PpePreUseInspectionWhereInput = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.companyId) where.companyId = filters.companyId;

    if (!this.scope.isPrime(actor) && actor.companyId) {
      where.companyId = actor.companyId;
    }

    return this.prisma.ppePreUseInspection.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        workerUser: { select: { id: true, username: true, email: true } },
      },
      orderBy: { inspectedAt: 'desc' },
      take: 200,
    });
  }

  async getById(id: string, actor: CailActor) {
    const row = await this.prisma.ppePreUseInspection.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, companyId: true } },
        company: { select: { id: true, name: true } },
        workerUser: { select: { id: true, username: true, email: true } },
        worker: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    if (!row) throw new NotFoundException('PPE pre-use inspection not found');
    if (
      !this.scope.isPrime(actor) &&
      actor.companyId &&
      row.companyId !== actor.companyId
    ) {
      throw new ForbiddenException('Not permitted to view this inspection');
    }
    return row;
  }
}
