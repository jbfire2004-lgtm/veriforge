import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MusterEventStatus, PmEmergencyPlanType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans(siteId: number) {
    return this.prisma.emergencyPlan.findMany({
      where: { siteId, active: true },
      orderBy: { title: 'asc' },
    });
  }

  async createPlan(data: {
    companyId?: number;
    siteId: number;
    title: string;
    planType?: string;
    contentJson?: Record<string, unknown>;
  }) {
    let companyId = data.companyId;
    if (!companyId) {
      const project = await this.prisma.project.findFirst({
        where: { siteId: data.siteId },
        select: { companyId: true },
      });
      companyId = project?.companyId ?? 1;
    }
    return this.prisma.emergencyPlan.create({
      data: {
        companyId,
        siteId: data.siteId,
        title: data.title,
        planType: (data.planType as PmEmergencyPlanType) ?? 'evacuation',
        contentJson: (data.contentJson ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async triggerMuster(data: {
    siteId: number;
    projectId?: number;
    triggeredByUser?: number;
    notes?: string;
  }) {
    const active = await this.prisma.musterEvent.findFirst({
      where: {
        siteId: data.siteId,
        status: { in: ['activated', 'accounting'] },
      },
    });
    if (active) {
      throw new BadRequestException('Muster already active for this site');
    }

    const project = await this.prisma.project.findFirst({
      where: data.projectId ? { id: data.projectId } : { siteId: data.siteId },
      select: { companyId: true },
    });
    return this.prisma.musterEvent.create({
      data: {
        companyId: project?.companyId ?? 1,
        siteId: data.siteId,
        projectId: data.projectId,
        triggeredByUser: data.triggeredByUser,
        notes: data.notes,
        status: MusterEventStatus.activated,
      },
    });
  }

  async getActiveMuster(siteId: number) {
    return this.prisma.musterEvent.findFirst({
      where: {
        siteId,
        status: { in: ['activated', 'accounting'] },
      },
      include: {
        checkins: {
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async checkIn(data: {
    musterEventId: string;
    workerId: number;
    method?: string;
  }) {
    const event = await this.prisma.musterEvent.findUnique({
      where: { id: data.musterEventId },
    });
    if (!event) throw new NotFoundException('Muster event not found');
    if (event.status === 'all_clear' || event.status === 'cancelled') {
      throw new BadRequestException('Muster is closed');
    }

    await this.prisma.musterEvent.update({
      where: { id: data.musterEventId },
      data: { status: MusterEventStatus.accounting },
    });

    return this.prisma.musterCheckin.upsert({
      where: {
        musterEventId_workerId: {
          musterEventId: data.musterEventId,
          workerId: data.workerId,
        },
      },
      create: {
        musterEventId: data.musterEventId,
        workerId: data.workerId,
        method: data.method ?? 'manual',
      },
      update: { checkedInAt: new Date(), method: data.method ?? 'manual' },
    });
  }

  async allClear(musterEventId: string) {
    return this.prisma.musterEvent.update({
      where: { id: musterEventId },
      data: {
        status: MusterEventStatus.all_clear,
        allClearAt: new Date(),
      },
    });
  }

  async listMusterHistory(siteId: number, limit = 20) {
    return this.prisma.musterEvent.findMany({
      where: { siteId },
      include: { _count: { select: { checkins: true } } },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
    });
  }
}
