import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentService } from '../assignment/assignment.service';

@Injectable()
export class AssignmentSchedulerService {
  constructor(
    private prisma: PrismaService,
    private assignment: AssignmentService,
  ) {}

  // ---------------------------------------------------------
  // CREATE A SCHEDULED ASSIGNMENT
  // ---------------------------------------------------------
  async schedule(data: {
    workerId: number;
    equipmentId?: number;
    siteId?: number;
    companyId?: number;
    assignedBy?: number;
    startAt: Date;
    endAt?: Date;
  }) {
    if (!data.startAt) {
      throw new BadRequestException('startAt is required');
    }

    // Prevent overlapping schedules
    const overlap = await this.prisma.workerAssignment.findFirst({
      where: {
        workerId: data.workerId,
        endedAt: null,
        OR: [
          {
            startAt: { lte: data.startAt },
            endAt: { gte: data.startAt },
          },
          {
            startAt: { lte: data.endAt ?? data.startAt },
            endAt: { gte: data.endAt ?? data.startAt },
          },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException(
        'Worker already scheduled during this time',
      );
    }

    return this.prisma.workerAssignment.create({
      data: {
        workerId: data.workerId,
        equipmentId: data.equipmentId ?? null,
        siteId: data.siteId ?? null,
        companyId: data.companyId ?? null,
        assignedBy: data.assignedBy ?? null,
        startAt: data.startAt,
        endAt: data.endAt ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // CALENDAR VIEW
  // ---------------------------------------------------------
  async calendar(workerId: number) {
    return this.prisma.workerAssignment.findMany({
      where: { workerId },
      orderBy: { startAt: 'asc' },
      include: {
        equipment: true,
        site: true,
        company: true,
      },
    });
  }

  // ---------------------------------------------------------
  // AUTO‑START SCHEDULED ASSIGNMENTS
  // ---------------------------------------------------------
  async autoStart() {
    const now = new Date();

    const toStart = await this.prisma.workerAssignment.findMany({
      where: {
        startAt: { lte: now },
        autoStarted: false,
      },
    });

    for (const a of toStart) {
      await this.assignment.assign({
        workerId: a.workerId,
        equipmentId: a.equipmentId ?? undefined,
        siteId: a.siteId ?? undefined,
        companyId: a.companyId ?? undefined,
        assignedBy: a.assignedBy ?? undefined,
      });

      await this.prisma.workerAssignment.update({
        where: { id: a.id },
        data: { autoStarted: true },
      });
    }

    return { started: toStart.length };
  }

  // ---------------------------------------------------------
  // AUTO‑END SCHEDULED ASSIGNMENTS
  // ---------------------------------------------------------
  async autoEnd() {
    const now = new Date();

    const toEnd = await this.prisma.workerAssignment.findMany({
      where: {
        endAt: { lte: now },
        endedAt: null,
        autoEnded: false,
      },
    });

    for (const a of toEnd) {
      await this.assignment.end(a.id);

      await this.prisma.workerAssignment.update({
        where: { id: a.id },
        data: { autoEnded: true },
      });
    }

    return { ended: toEnd.length };
  }
}
