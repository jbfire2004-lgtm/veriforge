import { Injectable } from '@nestjs/common';
import {
  AssignmentStatus,
  LinkComplianceStatus,
  ProjectStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type WorkerInactivationReason =
  | 'END_ASSIGNMENT'
  | 'REMOVED_FROM_PROJECT'
  | 'UNION_RECALL'
  | 'PROJECT_CLOSED'
  | 'NEW_COMPANY_LINK';

export type EquipmentInactivationReason =
  | 'END_ASSIGNMENT'
  | 'REMOVED_FROM_PROJECT'
  | 'INSPECTION_FAILED'
  | 'PROJECT_CLOSED'
  | 'NEW_COMPANY_LINK';

@Injectable()
export class InactivationService {
  constructor(private readonly prisma: PrismaService) {}

  async deactivateWorkerAtCompany(
    workerId: number,
    companyId: number,
    reason: WorkerInactivationReason,
  ) {
    const now = new Date();
    await this.prisma.companyLink.updateMany({
      where: { workerId, companyId, active: true },
      data: { active: false, endDate: now },
    });
    if (reason === 'NEW_COMPANY_LINK') {
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { companyId },
      });
    } else if (reason !== 'REMOVED_FROM_PROJECT') {
      const activeElsewhere = await this.prisma.companyLink.findFirst({
        where: { workerId, active: true, companyId: { not: companyId } },
      });
      if (!activeElsewhere) {
        await this.prisma.worker.update({
          where: { id: workerId },
          data: { companyId: null },
        });
      }
    }
    await this.prisma.projectAssignment.updateMany({
      where: {
        workerId,
        companyId,
        status: AssignmentStatus.ACTIVE,
      },
      data: {
        status: AssignmentStatus.REMOVED,
        endedAt: now,
      },
    });
    return { workerId, companyId, reason, deactivatedAt: now };
  }

  async deactivateEquipmentAtCompany(
    equipmentId: number,
    companyId: number,
    reason: EquipmentInactivationReason,
  ) {
    const now = new Date();
    const complianceStatus =
      reason === 'INSPECTION_FAILED'
        ? LinkComplianceStatus.LOCKED_OUT
        : undefined;
    await this.prisma.equipmentLink.updateMany({
      where: { equipmentId, companyId, active: true },
      data: {
        active: false,
        endDate: now,
        ...(complianceStatus ? { complianceStatus } : {}),
      },
    });
    if (reason === 'NEW_COMPANY_LINK') {
      await this.prisma.equipment.update({
        where: { id: equipmentId },
        data: { companyId },
      });
    } else if (reason !== 'REMOVED_FROM_PROJECT') {
      const activeElsewhere = await this.prisma.equipmentLink.findFirst({
        where: { equipmentId, active: true, companyId: { not: companyId } },
      });
      if (!activeElsewhere) {
        await this.prisma.equipment.update({
          where: { id: equipmentId },
          data: { companyId: null },
        });
      }
    }
    await this.prisma.equipmentProjectAssignment.updateMany({
      where: {
        equipmentId,
        companyId,
        status: AssignmentStatus.ACTIVE,
      },
      data: {
        status: AssignmentStatus.REMOVED,
        endedAt: now,
      },
    });
    return { equipmentId, companyId, reason, deactivatedAt: now };
  }

  async closeProject(projectId: number) {
    const now = new Date();
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.CLOSED, endDate: now },
    });
    await this.prisma.projectAssignment.updateMany({
      where: { projectId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.COMPLETED, endedAt: now },
    });
    await this.prisma.equipmentProjectAssignment.updateMany({
      where: { projectId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.COMPLETED, endedAt: now },
    });
    const workerIds = await this.prisma.projectAssignment.findMany({
      where: { projectId },
      select: { workerId: true },
      distinct: ['workerId'],
    });
    for (const { workerId } of workerIds) {
      const otherActive = await this.prisma.projectAssignment.count({
        where: {
          workerId,
          companyId: project.companyId,
          status: AssignmentStatus.ACTIVE,
          projectId: { not: projectId },
        },
      });
      if (otherActive === 0) {
        await this.deactivateWorkerAtCompany(
          workerId,
          project.companyId,
          'PROJECT_CLOSED',
        );
      }
    }
    const equipmentIds = await this.prisma.equipmentProjectAssignment.findMany({
      where: { projectId },
      select: { equipmentId: true },
      distinct: ['equipmentId'],
    });
    for (const { equipmentId } of equipmentIds) {
      const otherActive = await this.prisma.equipmentProjectAssignment.count({
        where: {
          equipmentId,
          companyId: project.companyId,
          status: AssignmentStatus.ACTIVE,
          projectId: { not: projectId },
        },
      });
      if (otherActive === 0) {
        await this.deactivateEquipmentAtCompany(
          equipmentId,
          project.companyId,
          'PROJECT_CLOSED',
        );
      }
    }
    return project;
  }

  async lockoutEquipment(equipmentId: number, reason: string) {
    const now = new Date();
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        safetyStatus: 'UNSAFE',
        lockedOutAt: now,
        lockoutReason: reason,
      },
    });
    await this.prisma.equipmentLink.updateMany({
      where: { equipmentId, active: true },
      data: { complianceStatus: LinkComplianceStatus.LOCKED_OUT },
    });
    return { equipmentId, lockedOutAt: now, reason };
  }
}
