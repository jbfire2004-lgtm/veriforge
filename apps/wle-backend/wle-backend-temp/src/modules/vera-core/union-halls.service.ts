import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { UnionMembershipStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { InactivationService } from './inactivation.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';

@Injectable()
export class UnionHallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyLinks: CompanyLinksService,
    private readonly inactivation: InactivationService,
    @Optional() private readonly events?: EventBusService,
  ) {}

  async listHalls() {
    return this.prisma.unionHall.findMany({ orderBy: { name: 'asc' } });
  }

  async createHall(data: {
    name: string;
    localNumber?: string;
    region?: string;
  }) {
    return this.prisma.unionHall.create({ data });
  }

  async listMembers(unionHallId: number, activeOnly = true) {
    return this.prisma.unionMembership.findMany({
      where: {
        unionHallId,
        ...(activeOnly ? { status: UnionMembershipStatus.ACTIVE } : {}),
      },
      include: { worker: true },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async addMember(
    unionHallId: number,
    data: {
      firstName: string;
      lastName: string;
      memberNumber?: string;
      email?: string;
      phone?: string;
    },
  ) {
    const worker = await this.prisma.worker.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        unionNumber: data.memberNumber,
      },
    });

    return this.prisma.unionMembership.create({
      data: {
        unionHallId,
        workerId: worker.id,
        memberNumber: data.memberNumber,
        status: UnionMembershipStatus.ACTIVE,
      },
      include: { worker: true, unionHall: true },
    });
  }

  async dispatchWorker(
    unionHallId: number,
    workerId: number,
    companyId: number,
    dispatchedBy?: number,
    notes?: string,
  ) {
    const membership = await this.prisma.unionMembership.findFirst({
      where: {
        unionHallId,
        workerId,
        status: UnionMembershipStatus.ACTIVE,
      },
    });
    if (!membership)
      throw new NotFoundException('Active union membership required');

    const dispatch = await this.prisma.unionDispatch.create({
      data: {
        unionHallId,
        workerId,
        companyId,
        dispatchedBy: dispatchedBy ?? null,
        notes,
      },
    });

    await this.companyLinks.linkWorker(workerId, companyId, {
      deactivateOtherCompanies: true,
    });

    this.events?.emit({
      name: DomainEvent.UNION_DISPATCH,
      occurredAt: new Date().toISOString(),
      companyId,
      entityType: 'union_dispatch',
      entityId: dispatch.id,
      actorId: dispatchedBy ?? undefined,
      data: { unionHallId, workerId },
    });

    return dispatch;
  }

  async recallWorker(unionHallId: number, workerId: number, companyId: number) {
    await this.prisma.unionDispatch.updateMany({
      where: {
        unionHallId,
        workerId,
        companyId,
        recalledAt: null,
      },
      data: { recalledAt: new Date() },
    });

    await this.inactivation.deactivateWorkerAtCompany(
      workerId,
      companyId,
      'UNION_RECALL',
    );

    return { unionHallId, workerId, companyId, recalled: true };
  }
}
