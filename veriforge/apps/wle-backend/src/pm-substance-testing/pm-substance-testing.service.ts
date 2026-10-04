import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmSubstanceTestResultOutcome,
  PmSubstanceTestStatus,
  PmSubstanceTestType,
  PmSubstanceSpecimenType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmSubstanceTestingComplianceService } from './pm-substance-testing-compliance.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';

const testInclude = {
  worker: {
    select: { id: true, firstName: true, lastName: true, companyId: true },
  },
  project: { select: { id: true, name: true } },
  incidentEvent: { select: { id: true, title: true, eventType: true } },
  result: true,
  custodyTransfers: {
    orderBy: { sequenceNumber: 'asc' as const },
    include: { signature: true },
  },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  createdBy: { select: { id: true, username: true } },
  der: { select: { id: true, username: true } },
} satisfies Prisma.PmSubstanceTestEventInclude;

@Injectable()
export class PmSubstanceTestingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: PmSubstanceTestingComplianceService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
  ) {}

  async list(filters: {
    companyId?: number;
    projectId?: number;
    workerId?: number;
    status?: PmSubstanceTestStatus;
    testType?: PmSubstanceTestType;
  }) {
    return this.prisma.pmSubstanceTestEvent.findMany({
      where: {
        deletedAt: null,
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.workerId ? { workerId: filters.workerId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.testType ? { testType: filters.testType } : {}),
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        result: { select: { outcome: true, recordedAt: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async get(id: string) {
    const event = await this.prisma.pmSubstanceTestEvent.findFirst({
      where: { id, deletedAt: null },
      include: testInclude,
    });
    if (!event) throw new NotFoundException('Test event not found');
    return event;
  }

  async create(
    data: {
      companyId: number;
      projectId?: number;
      workerId: number;
      testType: PmSubstanceTestType;
      specimenType?: PmSubstanceSpecimenType;
      scheduledAt?: string;
      incidentEventId?: string;
      poolId?: string;
      suspicionNotes?: string;
      suspicionObservedByUserId?: number;
      collectionSiteNote?: string;
      derUserId?: number;
      clientSyncId?: string;
    },
    createdByUserId: number,
  ) {
    if (
      data.testType === 'reasonable_suspicion' &&
      !data.suspicionNotes?.trim()
    ) {
      throw new BadRequestException(
        'Suspicion notes required for reasonable suspicion tests',
      );
    }

    if (data.clientSyncId) {
      const existing = await this.prisma.pmSubstanceTestEvent.findUnique({
        where: { clientSyncId: data.clientSyncId },
      });
      if (existing) return this.get(existing.id);
    }

    const event = await this.prisma.pmSubstanceTestEvent.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        workerId: data.workerId,
        testType: data.testType,
        specimenType: data.specimenType ?? 'urine',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        status: 'scheduled',
        incidentEventId: data.incidentEventId,
        poolId: data.poolId,
        suspicionNotes: data.suspicionNotes,
        suspicionObservedByUserId: data.suspicionObservedByUserId,
        collectionSiteNote: data.collectionSiteNote,
        derUserId: data.derUserId,
        createdByUserId,
        clientSyncId: data.clientSyncId,
      },
      include: testInclude,
    });

    const workerName = `${event.worker.firstName} ${event.worker.lastName}`;
    await this.compliance.notifyTestScheduled({
      testEventId: event.id,
      companyId: data.companyId,
      workerName,
      testType: data.testType,
      scheduledAt: event.scheduledAt ?? undefined,
      projectName: event.project?.name,
    });

    if (data.testType === 'post_incident' && data.incidentEventId) {
      await this.linkToInvestigation(data.incidentEventId, event.id);
    }

    return event;
  }

  async createRandomFromPool(
    poolId: string,
    actorId: number,
    options?: { projectId?: number; scheduledAt?: string },
  ) {
    const pool = await this.prisma.pmSubstanceTestPool.findUnique({
      where: { id: poolId },
      include: {
        members: {
          where: { active: true },
          include: { worker: true },
        },
      },
    });
    if (!pool?.active)
      throw new NotFoundException('Pool not found or inactive');
    if (!pool.members.length)
      throw new BadRequestException('Pool has no active members');

    const idx = Math.floor(Math.random() * pool.members.length);
    const member = pool.members[idx]!;

    return this.create(
      {
        companyId: pool.companyId,
        projectId: options?.projectId ?? pool.projectId ?? undefined,
        workerId: member.workerId,
        testType: 'random',
        poolId,
        scheduledAt: options?.scheduledAt,
      },
      actorId,
    );
  }

  async updateStatus(id: string, status: PmSubstanceTestStatus) {
    await this.get(id);
    return this.prisma.pmSubstanceTestEvent.update({
      where: { id },
      data: { status },
      include: testInclude,
    });
  }

  async recordResult(
    testEventId: string,
    data: {
      outcome: PmSubstanceTestResultOutcome;
      mroNotes?: string;
      alcoholLevel?: number;
      substancePanel?: string;
    },
    actorId: number,
  ) {
    const event = await this.get(testEventId);
    if (event.result) {
      throw new BadRequestException('Result already recorded for this test');
    }

    const result = await this.prisma.pmSubstanceTestResult.create({
      data: {
        testEventId,
        outcome: data.outcome,
        recordedByUserId: actorId,
        mroNotes: data.mroNotes,
        alcoholLevel: data.alcoholLevel,
        substancePanel: data.substancePanel,
      },
    });

    await this.prisma.pmSubstanceTestEvent.update({
      where: { id: testEventId },
      data: { status: 'completed' },
    });

    const workerName = `${event.worker.firstName} ${event.worker.lastName}`;
    const complianceJson = await this.compliance.applyResultCompliance({
      testEventId,
      workerId: event.workerId,
      companyId: event.companyId,
      projectId: event.projectId ?? undefined,
      outcome: data.outcome,
      testType: event.testType,
      actorId,
      workerName,
      projectName: event.project?.name,
    });

    await this.prisma.pmSubstanceTestResult.update({
      where: { id: result.id },
      data: {
        complianceApplied: true,
        complianceJson: complianceJson as Prisma.InputJsonValue,
      },
    });

    this.ecosystem?.emitSubstanceTestCompleted({
      testEventId,
      companyId: event.companyId,
      projectId: event.projectId ?? undefined,
      outcome: data.outcome,
      workerId: event.workerId,
      actorId,
    });

    return this.get(testEventId);
  }

  async createFromIncident(
    incidentEventId: string,
    data: {
      workerId: number;
      specimenType?: PmSubstanceSpecimenType;
      scheduledAt?: string;
    },
    actorId: number,
  ) {
    const incident = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: incidentEventId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.create(
      {
        companyId: incident.companyId,
        projectId: incident.projectId,
        workerId: data.workerId,
        testType: 'post_incident',
        specimenType: data.specimenType,
        scheduledAt: data.scheduledAt,
        incidentEventId,
      },
      actorId,
    );
  }

  async listByWorker(workerId: number) {
    return this.list({ workerId });
  }

  async listByIncident(incidentEventId: string) {
    return this.prisma.pmSubstanceTestEvent.findMany({
      where: { incidentEventId, deletedAt: null },
      include: {
        result: true,
        worker: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async dashboard(companyId: number, projectId?: number) {
    const where = {
      companyId,
      deletedAt: null,
      ...(projectId ? { projectId } : {}),
    };

    const [pending, nonNegative, recent, byType] = await Promise.all([
      this.prisma.pmSubstanceTestEvent.count({
        where: { ...where, status: { notIn: ['completed', 'cancelled'] } },
      }),
      this.prisma.pmSubstanceTestResult.count({
        where: {
          outcome: { in: ['non_negative', 'refusal', 'tampered'] },
          testEvent: where,
        },
      }),
      this.prisma.pmSubstanceTestEvent.findMany({
        where,
        include: {
          worker: { select: { firstName: true, lastName: true } },
          result: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.pmSubstanceTestEvent.groupBy({
        by: ['testType'],
        where,
        _count: true,
      }),
    ]);

    return { pending, nonNegative, recent, byType };
  }

  private async linkToInvestigation(
    incidentEventId: string,
    testEventId: string,
  ) {
    const inv = await this.prisma.pmSafetyEventInvestigation.findUnique({
      where: { eventId: incidentEventId },
    });
    if (!inv) return;

    const answers = (inv.guidedAnswersJson as Record<string, string>) ?? {};
    answers.substance_test_id = testEventId;
    await this.prisma.pmSafetyEventInvestigation.update({
      where: { eventId: incidentEventId },
      data: {
        guidedAnswersJson: answers as Prisma.InputJsonValue,
        status: inv.status === 'closed' ? inv.status : 'evidence_gathering',
      },
    });
  }
}
