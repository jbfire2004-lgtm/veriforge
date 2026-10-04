import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerAssignmentService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // ASSIGN WORKER
  // ---------------------------------------------------------
  async assign(data: {
    workerId: number;
    equipmentId?: number;
    siteId?: number;
    companyId?: number;
    assignedBy?: number;
  }) {
    return this.prisma.workerAssignment.create({
      data: {
        workerId: data.workerId,
        equipmentId: data.equipmentId ?? null,
        siteId: data.siteId ?? null,
        companyId: data.companyId ?? null,
        assignedBy: data.assignedBy ?? null,
      },
      include: {
        worker: true,
        equipment: true,
        site: true,
        company: true,
      },
    });
  }

  // ---------------------------------------------------------
  // END ASSIGNMENT
  // ---------------------------------------------------------
  async endAssignment(id: number) {
    const existing = await this.prisma.workerAssignment.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Assignment not found');

    return this.prisma.workerAssignment.update({
      where: { id },
      data: { endedAt: new Date() },
    });
  }

  // ---------------------------------------------------------
  // ACTIVE ASSIGNMENTS FOR WORKER
  // ---------------------------------------------------------
  async activeForWorker(workerId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { workerId, endedAt: null },
      include: {
        equipment: true,
        site: true,
        company: true,
      },
    });
  }

  // ---------------------------------------------------------
  // HISTORY FOR WORKER
  // ---------------------------------------------------------
  async historyForWorker(workerId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { workerId },
      orderBy: { assignedAt: 'desc' },
      include: {
        equipment: true,
        site: true,
        company: true,
      },
    });
  }

  // ---------------------------------------------------------
  // ACTIVE ASSIGNMENTS FOR EQUIPMENT
  // ---------------------------------------------------------
  async activeForEquipment(equipmentId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { equipmentId, endedAt: null },
      include: { worker: true },
    });
  }

  // ---------------------------------------------------------
  // ACTIVE ASSIGNMENTS FOR SITE
  // ---------------------------------------------------------
  async activeForSite(siteId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { siteId, endedAt: null },
      include: { worker: true },
    });
  }

  // ---------------------------------------------------------
  // ACTIVE ASSIGNMENTS FOR COMPANY
  // ---------------------------------------------------------
  async activeForCompany(companyId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { companyId, endedAt: null },
      include: { worker: true },
    });
  }
}
