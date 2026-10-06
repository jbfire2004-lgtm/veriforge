import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AdoptionEventService } from '../adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../adoption-analytics/adoption-analytics.constants';
import { OrientationLinkingService } from '../orientation/orientation-linking.service';
import { OrientationAccessService } from '../orientation/orientation-access.service';
import { AssignmentStatus, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from './inactivation.service';
import { CompetencyService } from '../competency/competency.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import {
  workerAssignedEvent,
  workerRemovedEvent,
} from '../vera-event-bus/publishers/vera-event-publishers';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
    private readonly competency: CompetencyService,
    @Optional() private readonly adoption?: AdoptionEventService,
    @Optional() private readonly orientationLinking?: OrientationLinkingService,
    @Optional() private readonly orientationAccess?: OrientationAccessService,
    @Optional() private readonly events?: EventBusService,
  ) {}

  async listByCompany(companyId: number, status?: ProjectStatus) {
    return this.prisma.project.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: { site: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    companyId: number;
    name: string;
    code?: string;
    siteId?: number;
    startDate?: Date;
  }) {
    const project = await this.prisma.project.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        code: data.code,
        siteId: data.siteId,
        startDate: data.startDate,
        status: ProjectStatus.ACTIVE,
      },
      include: { site: true },
    });
    if (this.adoption) {
      this.adoption.track({
        companyId: data.companyId,
        event: ADOPTION_EVENT_TYPES.PROJECT_CREATED,
        metadata: { projectId: project.id },
      });
    }
    return project;
  }

  async assignWorker(
    projectId: number,
    workerId: number,
    assignedBy?: number,
    equipmentId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.status !== ProjectStatus.ACTIVE) {
      throw new NotFoundException('Project not found or closed');
    }

    const companyLink = await this.prisma.companyLink.findFirst({
      where: {
        workerId,
        companyId: project.companyId,
        active: true,
      },
    });
    if (!companyLink) {
      throw new BadRequestException('Worker must be active under company');
    }

    if (this.orientationAccess) {
      await this.orientationAccess.assertWorkerCanBeAssigned(
        workerId,
        projectId,
      );
    }

    if (equipmentId) {
      await this.competency.assertEligible(workerId, equipmentId);
    }

    const existing = await this.prisma.projectAssignment.findFirst({
      where: {
        projectId,
        workerId,
        status: AssignmentStatus.ACTIVE,
      },
    });
    if (existing) return existing;

    const assignment = await this.prisma.projectAssignment.create({
      data: {
        projectId,
        workerId,
        companyId: project.companyId,
        assignedBy: assignedBy ?? null,
        status: AssignmentStatus.ACTIVE,
      },
      include: { worker: true, project: true },
    });
    if (this.orientationLinking) {
      void this.orientationLinking.onProjectAssignment(workerId, projectId);
    }

    this.events?.emit(
      workerAssignedEvent({
        projectId,
        workerId,
        companyId: project.companyId,
        assignedBy,
      }),
    );
    this.events?.emit({
      name: DomainEvent.PROJECT_UPDATED,
      occurredAt: new Date().toISOString(),
      companyId: project.companyId,
      projectId,
      entityType: 'project',
      entityId: projectId,
      data: { action: 'worker_assigned', workerId },
    });

    return assignment;
  }

  async removeWorker(projectId: number, workerId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const now = new Date();
    await this.prisma.projectAssignment.updateMany({
      where: { projectId, workerId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.REMOVED, endedAt: now },
    });

    const otherActive = await this.prisma.projectAssignment.count({
      where: {
        workerId,
        companyId: project.companyId,
        status: AssignmentStatus.ACTIVE,
      },
    });
    if (otherActive === 0) {
      await this.inactivation.deactivateWorkerAtCompany(
        workerId,
        project.companyId,
        'REMOVED_FROM_PROJECT',
      );
    }

    this.events?.emit(
      workerRemovedEvent({
        projectId,
        workerId,
        companyId: project.companyId,
      }),
    );
    this.events?.emit({
      name: DomainEvent.PROJECT_UPDATED,
      occurredAt: now.toISOString(),
      companyId: project.companyId,
      projectId,
      entityType: 'project',
      entityId: projectId,
      data: { action: 'worker_removed', workerId },
    });

    return { projectId, workerId, removedAt: now };
  }

  async assignEquipment(
    projectId: number,
    equipmentId: number,
    assignedBy?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.status !== ProjectStatus.ACTIVE) {
      throw new NotFoundException('Project not found or closed');
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (equipment?.lockedOutAt) {
      throw new BadRequestException('Equipment is locked out');
    }

    const equipmentLink = await this.prisma.equipmentLink.findFirst({
      where: {
        equipmentId,
        companyId: project.companyId,
        active: true,
        complianceStatus: { not: 'LOCKED_OUT' },
      },
    });
    if (!equipmentLink) {
      throw new BadRequestException('Equipment must be active under company');
    }

    const activeOperators = await this.prisma.equipmentLinkWorker.findMany({
      where: {
        equipmentLink: {
          equipmentId,
          companyId: project.companyId,
          active: true,
        },
      },
      select: { workerId: true },
    });
    if (activeOperators.length > 0) {
      const checks = await Promise.all(
        activeOperators.map((op) =>
          this.competency.checkWorkerEquipment(op.workerId, equipmentId),
        ),
      );
      const anyEligible = checks.some((c) => c.eligible);
      if (!anyEligible) {
        throw new BadRequestException(
          'No assigned operator has valid competency for this equipment',
        );
      }
    }

    return this.prisma.equipmentProjectAssignment.create({
      data: {
        projectId,
        equipmentId,
        companyId: project.companyId,
        assignedBy: assignedBy ?? null,
        status: AssignmentStatus.ACTIVE,
      },
      include: { equipment: true, project: true },
    });
  }

  async removeEquipment(projectId: number, equipmentId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const now = new Date();
    await this.prisma.equipmentProjectAssignment.updateMany({
      where: { projectId, equipmentId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.REMOVED, endedAt: now },
    });

    const otherActive = await this.prisma.equipmentProjectAssignment.count({
      where: {
        equipmentId,
        companyId: project.companyId,
        status: AssignmentStatus.ACTIVE,
      },
    });
    if (otherActive === 0) {
      await this.inactivation.deactivateEquipmentAtCompany(
        equipmentId,
        project.companyId,
        'REMOVED_FROM_PROJECT',
      );
    }
    return { projectId, equipmentId, removedAt: now };
  }

  async close(projectId: number) {
    return this.inactivation.closeProject(projectId);
  }
}
