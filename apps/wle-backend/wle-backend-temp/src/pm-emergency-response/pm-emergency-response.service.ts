import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  MusterEventStatus,
  PmEmergencyEventStatus,
  PmEmergencyEventType,
  PmEmergencyNotificationChannel,
  PmEmergencyPlanStatus,
  PmEmergencyPlanType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { EmergencyWorkflowEngine } from './emergency-workflow.engine';
import { MusterGeofenceEngine, MusterPoint } from './muster-geofence.engine';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';

@Injectable()
export class PmEmergencyResponseService {
  private readonly workflow = new EmergencyWorkflowEngine();
  private readonly geofence = new MusterGeofenceEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmEmergencyCailIntelligenceService,
    @Optional() private readonly notifications?: NotificationsService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
  ) {}

  private async audit(
    entityType: string,
    entityId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmEmergencyAuditLog.create({
      data: {
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ---------- Plans ----------

  listPlans(filters: {
    companyId: number;
    siteId?: number;
    projectId?: number;
    planType?: PmEmergencyPlanType;
  }) {
    return this.prisma.emergencyPlan.findMany({
      where: {
        companyId: filters.companyId,
        siteId: filters.siteId,
        projectId: filters.projectId,
        planType: filters.planType,
        deletedAt: null,
        active: true,
      },
      orderBy: { title: 'asc' },
    });
  }

  async createPlan(
    data: {
      companyId: number;
      siteId: number;
      projectId?: number;
      title: string;
      planType?: PmEmergencyPlanType;
      contentJson?: Record<string, unknown>;
      rolesJson?: unknown[];
      musterPointsJson?: MusterPoint[];
      responseStepsJson?: unknown[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const plan = await this.prisma.emergencyPlan.create({
      data: {
        companyId: data.companyId,
        siteId: data.siteId,
        projectId: data.projectId,
        title: data.title,
        planType: data.planType ?? 'evacuation',
        status: 'draft',
        contentJson: (data.contentJson ?? {}) as Prisma.InputJsonValue,
        rolesJson: (data.rolesJson ?? []) as Prisma.InputJsonValue,
        musterPointsJson: (data.musterPointsJson ??
          []) as Prisma.InputJsonValue,
        responseStepsJson: (data.responseStepsJson ??
          []) as Prisma.InputJsonValue,
        clientSyncId: data.clientSyncId,
      },
    });
    await this.audit('plan', plan.id, 'created', actorId);
    return plan;
  }

  async publishPlan(id: string, actorId?: number) {
    const plan = await this.prisma.emergencyPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.status !== 'published') {
      if (plan.status === 'draft') {
        this.workflow.assertPlanTransition('draft', 'review');
        this.workflow.assertPlanTransition('review', 'approved');
        this.workflow.assertPlanTransition('approved', 'published');
      } else {
        this.workflow.assertPlanTransition(plan.status, 'published');
      }
    }
    await this.prisma.pmEmergencyPlanVersion.create({
      data: {
        planId: id,
        version: plan.versionNum,
        snapshot: plan as unknown as Prisma.InputJsonValue,
        authorId: actorId,
      },
    });
    const updated = await this.prisma.emergencyPlan.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    });
    await this.audit('plan', id, 'published', actorId);
    return updated;
  }

  async acknowledgePlan(data: {
    planId: string;
    workerId: number;
    signatureData?: string;
    clientSyncId?: string;
  }) {
    return this.prisma.pmEmergencyPlanAcknowledgment.upsert({
      where: {
        planId_workerId: { planId: data.planId, workerId: data.workerId },
      },
      create: data,
      update: {
        acknowledgedAt: new Date(),
        signatureData: data.signatureData,
      },
    });
  }

  // ---------- Emergency events ----------

  async declareEmergency(
    data: {
      companyId: number;
      siteId: number;
      projectId?: number;
      eventType: PmEmergencyEventType;
      title: string;
      description?: string;
      declaredByUserId?: number;
      autoMuster?: boolean;
      lockSiteAccess?: boolean;
      requirePublishedPlan?: boolean;
    },
    actorId?: number,
  ) {
    if (data.requirePublishedPlan !== false) {
      const plan = await this.prisma.emergencyPlan.findFirst({
        where: {
          companyId: data.companyId,
          siteId: data.siteId,
          status: 'published',
          deletedAt: null,
          active: true,
          OR: [
            ...(data.projectId ? [{ projectId: data.projectId }] : []),
            { projectId: null },
          ],
        },
      });
      if (!plan) {
        throw new BadRequestException(
          'Published emergency plan required before declaring an emergency',
        );
      }
    }

    const event = await this.prisma.pmEmergencyEvent.create({
      data: {
        companyId: data.companyId,
        siteId: data.siteId,
        projectId: data.projectId,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        declaredByUserId: data.declaredByUserId ?? actorId,
        status: 'declared',
        timelineJson: [
          {
            at: new Date().toISOString(),
            action: 'declared',
            actorId,
          },
        ] as Prisma.InputJsonValue,
      },
    });

    if (data.lockSiteAccess !== false && data.projectId) {
      await this.prisma.pmSiteEmergencyLock.create({
        data: {
          projectId: data.projectId,
          emergencyEventId: event.id,
          active: true,
        },
      });
    }

    await this.dispatchNotifications({
      companyId: data.companyId,
      emergencyEventId: event.id,
      triggerType: 'emergency_declared',
      title: `EMERGENCY: ${data.title}`,
      body: data.description ?? data.title,
      channels: ['in_app', 'push', 'email', 'sms'],
    });

    if (data.autoMuster !== false) {
      await this.startMuster(
        {
          companyId: data.companyId,
          siteId: data.siteId,
          projectId: data.projectId,
          emergencyEventId: event.id,
          triggeredByUser: actorId,
          notes: `Auto-muster for ${data.title}`,
        },
        actorId,
      );
      await this.prisma.pmEmergencyEvent.update({
        where: { id: event.id },
        data: { status: 'muster_in_progress' },
      });
    }

    await this.audit('event', event.id, 'declared', actorId);
    return event;
  }

  async transitionEvent(
    id: string,
    to: PmEmergencyEventStatus,
    actorId?: number,
  ) {
    const event = await this.prisma.pmEmergencyEvent.findUnique({
      where: { id },
    });
    if (!event) throw new NotFoundException('Event not found');
    this.workflow.assertEventTransition(event.status, to);

    const update: Prisma.PmEmergencyEventUpdateInput = { status: to };
    if (to === 'all_clear') update.allClearAt = new Date();
    if (to === 'closed') update.closedAt = new Date();

    const updated = await this.prisma.pmEmergencyEvent.update({
      where: { id },
      data: update,
    });

    if (to === 'all_clear' && event.projectId) {
      await this.prisma.pmSiteEmergencyLock.updateMany({
        where: { emergencyEventId: id, active: true },
        data: { active: false, unlockedAt: new Date() },
      });
      await this.dispatchNotifications({
        companyId: event.companyId,
        emergencyEventId: id,
        triggerType: 'all_clear',
        title: 'All clear',
        body: `Emergency "${event.title}" — all clear issued`,
        channels: ['in_app', 'push'],
      });
    }

    await this.audit('event', id, `status_${to}`, actorId);
    return updated;
  }

  async addEventAttachment(
    emergencyEventId: string,
    data: {
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      clientSyncId?: string;
    },
  ) {
    return this.prisma.pmEmergencyEventAttachment.create({
      data: { emergencyEventId, ...data },
    });
  }

  // ---------- Muster ----------

  async startMuster(
    data: {
      companyId: number;
      siteId: number;
      projectId?: number;
      emergencyEventId?: string;
      triggeredByUser?: number;
      notes?: string;
      expectedWorkerIds?: number[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const active = await this.prisma.musterEvent.findFirst({
      where: {
        siteId: data.siteId,
        status: { in: ['activated', 'accounting'] },
      },
    });
    if (active) {
      throw new BadRequestException('Muster already active for this site');
    }

    const expected =
      data.expectedWorkerIds ??
      (await this.resolveExpectedWorkers(data.projectId, data.siteId));

    const muster = await this.prisma.musterEvent.create({
      data: {
        companyId: data.companyId,
        siteId: data.siteId,
        projectId: data.projectId,
        emergencyEventId: data.emergencyEventId,
        triggeredByUser: data.triggeredByUser ?? actorId,
        notes: data.notes,
        status: MusterEventStatus.activated,
        expectedWorkerIds: expected as Prisma.InputJsonValue,
        missingWorkerIds: expected as Prisma.InputJsonValue,
        clientSyncId: data.clientSyncId,
      },
    });

    await this.dispatchNotifications({
      companyId: data.companyId,
      musterEventId: muster.id,
      emergencyEventId: data.emergencyEventId,
      triggerType: 'muster_started',
      title: 'MUSTER — Report to muster point',
      body: data.notes ?? 'Site muster activated',
      channels: ['in_app', 'push', 'sms', 'safety_station'],
    });

    await this.audit('muster', muster.id, 'started', actorId);
    return muster;
  }

  private async resolveExpectedWorkers(
    projectId?: number,
    siteId?: number,
  ): Promise<number[]> {
    if (projectId) {
      const assignments = await this.prisma.projectAssignment.findMany({
        where: { projectId, endedAt: null },
        select: { workerId: true },
      });
      return assignments.map((a) => a.workerId);
    }
    if (siteId) {
      const onSite = await this.prisma.workerAssignment.findMany({
        where: { siteId, endedAt: null },
        select: { workerId: true },
      });
      return onSite.map((a) => a.workerId);
    }
    return [];
  }

  async getActiveMuster(siteId: number) {
    const muster = await this.prisma.musterEvent.findFirst({
      where: {
        siteId,
        status: { in: ['activated', 'accounting'] },
      },
      include: {
        checkins: {
          include: {
            worker: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        emergencyEvent: true,
      },
      orderBy: { triggeredAt: 'desc' },
    });
    if (!muster) return null;
    await this.refreshMissingWorkers(muster.id);
    return this.prisma.musterEvent.findUnique({
      where: { id: muster.id },
      include: {
        checkins: {
          include: {
            worker: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  private async refreshMissingWorkers(musterEventId: string) {
    const muster = await this.prisma.musterEvent.findUnique({
      where: { id: musterEventId },
      include: { checkins: true },
    });
    if (!muster) return;

    const expected = Array.isArray(muster.expectedWorkerIds)
      ? (muster.expectedWorkerIds as number[])
      : [];
    const checked = new Set(muster.checkins.map((c) => c.workerId));
    const missing = expected.filter((id) => !checked.has(id));

    const prevMissing = Array.isArray(muster.missingWorkerIds)
      ? (muster.missingWorkerIds as number[])
      : [];

    await this.prisma.musterEvent.update({
      where: { id: musterEventId },
      data: { missingWorkerIds: missing as Prisma.InputJsonValue },
    });

    const newMissing = missing.filter((id) => !prevMissing.includes(id));
    if (newMissing.length > 0) {
      await this.dispatchNotifications({
        companyId: muster.companyId,
        musterEventId,
        triggerType: 'missing_worker',
        title: 'Missing worker(s) at muster',
        body: `Workers not checked in: ${newMissing.join(', ')}`,
        channels: ['in_app', 'push', 'sms'],
        escalationLevel: 1,
      });
    }
  }

  async musterCheckIn(data: {
    musterEventId: string;
    workerId: number;
    method?: string;
    musterPointCode?: string;
    lat?: number;
    lng?: number;
    supervisorOverride?: boolean;
    clientSyncId?: string;
  }) {
    const event = await this.prisma.musterEvent.findUnique({
      where: { id: data.musterEventId },
      include: { site: true },
    });
    if (!event) throw new NotFoundException('Muster not found');
    if (event.status === 'all_clear' || event.status === 'cancelled') {
      throw new BadRequestException('Muster is closed');
    }

    let identityVerified = !!data.supervisorOverride;
    if (
      data.lat != null &&
      data.lng != null &&
      event.site?.latitude != null &&
      event.site?.longitude != null
    ) {
      const plans = await this.prisma.emergencyPlan.findMany({
        where: { siteId: event.siteId, status: 'published', deletedAt: null },
        take: 1,
      });
      const points = (plans[0]?.musterPointsJson as MusterPoint[]) ?? [
        {
          code: 'default',
          label: 'Site muster',
          lat: event.site.latitude!,
          lng: event.site.longitude!,
          radiusMeters: 100,
        },
      ];
      const nearest = this.geofence.nearestMusterPoint(
        { lat: data.lat, lng: data.lng },
        points,
      );
      if (
        nearest &&
        nearest.distanceMeters <= (nearest.point.radiusMeters ?? 75)
      ) {
        identityVerified = true;
        data.musterPointCode = nearest.point.code;
      }
    }

    await this.prisma.musterEvent.update({
      where: { id: data.musterEventId },
      data: { status: MusterEventStatus.accounting },
    });

    const checkin = await this.prisma.musterCheckin.upsert({
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
        musterPointCode: data.musterPointCode,
        identityVerified,
        supervisorOverride: data.supervisorOverride ?? false,
        geoJson:
          data.lat != null
            ? ({ lat: data.lat, lng: data.lng } as Prisma.InputJsonValue)
            : undefined,
        clientSyncId: data.clientSyncId,
      },
      update: {
        checkedInAt: new Date(),
        method: data.method ?? 'manual',
        musterPointCode: data.musterPointCode,
        identityVerified,
        supervisorOverride: data.supervisorOverride ?? false,
      },
    });

    await this.refreshMissingWorkers(data.musterEventId);
    return checkin;
  }

  mapWorkflowPhase(status: PmEmergencyEventStatus): string {
    if (status === 'closed' || status === 'cancelled') return 'closed';
    if (status === 'all_clear') return 'all_clear';
    if (
      status === 'muster_in_progress' ||
      status === 'evacuation_in_progress' ||
      status === 'supervisor_review'
    ) {
      return 'muster_active';
    }
    if (status === 'declared' || status === 'active')
      return 'emergency_declared';
    return 'normal';
  }

  async getEventStatus(emergencyEventId: string) {
    const event = await this.prisma.pmEmergencyEvent.findUnique({
      where: { id: emergencyEventId },
      include: {
        musterSessions: {
          include: {
            checkins: {
              include: {
                worker: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { triggeredAt: 'desc' },
        },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!event) throw new NotFoundException('Emergency event not found');

    const muster = event.musterSessions[0] ?? null;
    const expected =
      muster && Array.isArray(muster.expectedWorkerIds)
        ? (muster.expectedWorkerIds as number[]).length
        : 0;
    const checkedIn = muster?.checkins?.length ?? 0;
    const missing =
      muster && Array.isArray(muster.missingWorkerIds)
        ? (muster.missingWorkerIds as number[]).length
        : 0;

    const musterCompliance = this.cail.musterComplianceScore(
      checkedIn,
      expected,
    );
    const siteLocked = event.projectId
      ? !!(await this.isSiteLocked(event.projectId))
      : false;

    return {
      emergency: event,
      workflowPhase: this.mapWorkflowPhase(event.status),
      muster,
      musterComplianceScore: musterCompliance,
      missingWorkerCount: missing,
      checkedInCount: checkedIn,
      expectedWorkerCount: expected,
      siteAccessLocked: siteLocked,
      canAllClear: missing === 0 || event.status === 'supervisor_review',
      canClose: event.status === 'all_clear',
      notificationsSent: event.notifications.filter((n) => n.status === 'sent')
        .length,
    };
  }

  async startMusterForEvent(
    emergencyEventId: string,
    body: Record<string, unknown>,
    actorId?: number,
  ) {
    const event = await this.prisma.pmEmergencyEvent.findUnique({
      where: { id: emergencyEventId },
    });
    if (!event) throw new NotFoundException('Emergency event not found');

    const muster = await this.startMuster(
      {
        companyId: event.companyId,
        siteId: event.siteId,
        projectId: event.projectId ?? undefined,
        emergencyEventId: event.id,
        notes: (body.notes as string) ?? `Muster for ${event.title}`,
        expectedWorkerIds: body.expectedWorkerIds as number[] | undefined,
      },
      actorId,
    );

    await this.transitionEvent(emergencyEventId, 'muster_in_progress', actorId);
    return muster;
  }

  async musterCheckInForEvent(
    emergencyEventId: string,
    data: {
      workerId: number;
      method?: string;
      lat?: number;
      lng?: number;
      musterPointCode?: string;
      supervisorOverride?: boolean;
      clientSyncId?: string;
    },
  ) {
    const muster = await this.prisma.musterEvent.findFirst({
      where: {
        emergencyEventId,
        status: { in: ['activated', 'accounting'] },
      },
      orderBy: { triggeredAt: 'desc' },
    });
    if (!muster)
      throw new NotFoundException('No active muster for this emergency');

    return this.musterCheckIn({
      musterEventId: muster.id,
      ...data,
    });
  }

  async allClearEmergency(
    emergencyEventId: string,
    actorId?: number,
    force = false,
  ) {
    const muster = await this.prisma.musterEvent.findFirst({
      where: {
        emergencyEventId,
        status: { in: ['activated', 'accounting'] },
      },
    });
    if (muster) {
      const missing = Array.isArray(muster.missingWorkerIds)
        ? (muster.missingWorkerIds as number[]).length
        : 0;
      if (missing > 0 && !force) {
        throw new BadRequestException(
          'Cannot issue all clear until all workers are accounted for (or use force: true)',
        );
      }
      await this.musterAllClear(muster.id, actorId);
    } else {
      await this.transitionEvent(emergencyEventId, 'all_clear', actorId);
    }
    return this.getEventStatus(emergencyEventId);
  }

  async closeEmergency(
    emergencyEventId: string,
    actorId?: number,
    force = false,
  ) {
    const status = await this.getEventStatus(emergencyEventId);
    if (status.missingWorkerCount > 0 && !force) {
      throw new BadRequestException(
        'Cannot close emergency until all workers accounted for',
      );
    }
    if (status.emergency.status !== 'all_clear' && !force) {
      throw new BadRequestException('Emergency must be all clear before close');
    }
    await this.transitionEvent(emergencyEventId, 'closed', actorId);
    return this.getEventStatus(emergencyEventId);
  }

  async musterAllClear(musterEventId: string, actorId?: number) {
    const muster = await this.prisma.musterEvent.update({
      where: { id: musterEventId },
      data: {
        status: MusterEventStatus.all_clear,
        allClearAt: new Date(),
        supervisorConfirmedAt: new Date(),
      },
    });

    if (muster.emergencyEventId) {
      await this.transitionEvent(muster.emergencyEventId, 'all_clear', actorId);
    }

    if (muster.projectId) {
      await this.prisma.pmSiteEmergencyLock.updateMany({
        where: { projectId: muster.projectId, active: true },
        data: { active: false, unlockedAt: new Date() },
      });
    }

    await this.audit('muster', musterEventId, 'all_clear', actorId);
    return muster;
  }

  // ---------- Emergency equipment ----------

  createEmergencyEquipment(data: {
    companyId: number;
    siteId?: number;
    projectId?: number;
    equipmentType: Prisma.PmEmergencyEquipmentCreateInput['equipmentType'];
    name: string;
    locationNote?: string;
    expiresAt?: Date;
  }) {
    return this.prisma.pmEmergencyEquipment.create({ data });
  }

  listEmergencyEquipment(companyId: number, siteId?: number) {
    return this.prisma.pmEmergencyEquipment.findMany({
      where: { companyId, siteId, active: true },
      include: {
        inspections: { orderBy: { inspectedAt: 'desc' }, take: 3 },
      },
    });
  }

  async recordEquipmentInspection(
    emergencyEquipmentId: string,
    data: { passed: boolean; notes?: string; inspectedByUserId?: number },
    actorId?: number,
  ) {
    const eq = await this.prisma.pmEmergencyEquipment.findUnique({
      where: { id: emergencyEquipmentId },
    });
    if (!eq) throw new NotFoundException('Emergency equipment not found');

    const insp = await this.prisma.pmEmergencyEquipmentInspection.create({
      data: {
        emergencyEquipmentId,
        passed: data.passed,
        notes: data.notes,
        inspectedByUserId: data.inspectedByUserId ?? actorId,
      },
    });

    const readiness = data.passed ? 100 : 30;
    await this.prisma.pmEmergencyEquipment.update({
      where: { id: emergencyEquipmentId },
      data: {
        readinessScore: readiness,
        lastInspectionAt: new Date(),
      },
    });

    if (!data.passed && this.capaAuto && eq.companyId) {
      await this.capaAuto.fromDocumentDeficiency({
        companyId: eq.companyId,
        sourceModule: 'emergency_equipment',
        sourceId: emergencyEquipmentId,
        title: `Failed emergency equipment inspection: ${eq.name}`,
        description: data.notes,
        severity: 'high',
        actorId: actorId ?? 1,
      });
    }

    return insp;
  }

  async scanEmergencyEquipment(companyId: number, actorId?: number) {
    const now = new Date();
    const items = await this.prisma.pmEmergencyEquipment.findMany({
      where: { companyId, active: true },
    });
    let capas = 0;
    for (const item of items) {
      if (item.expiresAt && item.expiresAt < now && this.capaAuto) {
        await this.capaAuto.fromDocumentDeficiency({
          companyId,
          sourceModule: 'emergency_equipment',
          sourceId: item.id,
          title: `Expired emergency equipment: ${item.name}`,
          severity: 'medium',
          actorId: actorId ?? 1,
        });
        capas++;
        await this.prisma.pmEmergencyEquipment.update({
          where: { id: item.id },
          data: { readinessScore: 0 },
        });
      }
    }
    return { scanned: items.length, capasCreated: capas };
  }

  // ---------- Notifications ----------

  private async dispatchNotifications(input: {
    companyId: number;
    emergencyEventId?: string;
    musterEventId?: string;
    triggerType: string;
    title: string;
    body: string;
    channels: PmEmergencyNotificationChannel[];
    escalationLevel?: number;
  }) {
    const supervisors = await this.prisma.user.findMany({
      where: {
        companyId: input.companyId,
        role: {
          in: [
            'SUPERVISOR',
            'PROJECT_MANAGER',
            'COMPANY_ADMIN',
            'ADMIN',
            'SUPER_ADMIN',
          ],
        },
      },
      take: 50,
    });

    for (const channel of input.channels) {
      for (const user of supervisors) {
        const row = await this.prisma.pmEmergencyNotification.create({
          data: {
            companyId: input.companyId,
            emergencyEventId: input.emergencyEventId,
            musterEventId: input.musterEventId,
            channel,
            triggerType: input.triggerType,
            recipientUserId: user.id,
            title: input.title,
            body: input.body,
            escalationLevel: input.escalationLevel ?? 0,
            status: 'pending',
          },
        });

        if (this.notifications && channel !== 'safety_station') {
          try {
            const mapChannel =
              channel === 'sms'
                ? 'SMS'
                : channel === 'email'
                ? 'EMAIL'
                : channel === 'push'
                ? 'PUSH'
                : 'IN_APP';
            await this.notifications.notifyUsers({
              userIds: [user.id],
              type: 'emergency',
              title: input.title,
              body: input.body,
              channels: [mapChannel as 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP'],
              companyId: input.companyId,
              dedupeKey: `emergency:${row.id}`,
            });
            await this.prisma.pmEmergencyNotification.update({
              where: { id: row.id },
              data: { status: 'sent', sentAt: new Date() },
            });
          } catch {
            await this.prisma.pmEmergencyNotification.update({
              where: { id: row.id },
              data: { status: 'failed' },
            });
          }
        } else if (channel === 'safety_station') {
          await this.prisma.pmEmergencyNotification.update({
            where: { id: row.id },
            data: { status: 'sent', sentAt: new Date() },
          });
        }
      }
    }
  }

  // ---------- Site access ----------

  async workerAccessCheck(workerId: number, projectId: number) {
    const lock = await this.prisma.pmSiteEmergencyLock.findFirst({
      where: { projectId, active: true },
      include: { emergencyEvent: true },
    });
    if (lock) {
      return {
        allowed: false,
        reason: `Site locked: ${lock.emergencyEvent.title}`,
        emergencyActive: true,
      };
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    const requiredPlans = await this.prisma.emergencyPlan.findMany({
      where: {
        requiresAckForAccess: true,
        status: 'published',
        deletedAt: null,
        companyId: project?.companyId,
        OR: [{ projectId }, { projectId: null }],
      },
      select: { id: true },
    });

    for (const p of requiredPlans) {
      const ack = await this.prisma.pmEmergencyPlanAcknowledgment.findUnique({
        where: { planId_workerId: { planId: p.id, workerId } },
      });
      if (!ack) {
        return {
          allowed: false,
          reason: 'Emergency plan acknowledgment required',
          emergencyActive: false,
        };
      }
    }

    const activeMuster = await this.prisma.musterEvent.findFirst({
      where: { projectId, status: { in: ['activated', 'accounting'] } },
    });
    if (activeMuster) {
      const missing = Array.isArray(activeMuster.missingWorkerIds)
        ? (activeMuster.missingWorkerIds as number[])
        : [];
      if (missing.includes(workerId)) {
        return {
          allowed: false,
          reason: 'Worker listed as missing at active muster',
          emergencyActive: true,
        };
      }
    }

    return { allowed: true, emergencyActive: false };
  }

  isSiteLocked(projectId: number) {
    return this.prisma.pmSiteEmergencyLock.findFirst({
      where: { projectId, active: true },
    });
  }

  // ---------- Analytics ----------

  async analytics(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const musters = await this.prisma.musterEvent.findMany({
      where: { projectId },
      include: {
        _count: { select: { checkins: true } },
        emergencyEvent: { select: { declaredAt: true } },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 10,
    });

    let avgMusterCompliance = 100;
    if (musters.length) {
      const scores = musters.map((m) => {
        const expected = Array.isArray(m.expectedWorkerIds)
          ? (m.expectedWorkerIds as number[]).length
          : 0;
        return this.cail.musterComplianceScore(m._count.checkins, expected);
      });
      avgMusterCompliance = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    }

    const equipment = await this.prisma.pmEmergencyEquipment.findMany({
      where: { companyId: project.companyId, active: true },
    });
    const readinessAvg =
      equipment.length > 0
        ? equipment.reduce((s, e) => s + e.readinessScore, 0) / equipment.length
        : 100;

    const openEvents = await this.prisma.pmEmergencyEvent.count({
      where: {
        projectId,
        status: { notIn: ['closed', 'cancelled', 'all_clear'] },
      },
    });

    const responseTimes = musters
      .filter((m) => m.emergencyEvent?.declaredAt)
      .map((m) =>
        Math.round(
          (m.triggeredAt.getTime() - m.emergencyEvent!.declaredAt.getTime()) /
            60000,
        ),
      );
    const avgResponseTimeMinutes =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          )
        : null;

    const missingPatterns = musters.reduce((sum, m) => {
      const missing = Array.isArray(m.missingWorkerIds)
        ? (m.missingWorkerIds as number[]).length
        : 0;
      return sum + missing;
    }, 0);

    const insights = await this.cail.projectInsights(projectId);

    return {
      avgMusterCompliance,
      equipmentReadinessAvg: Math.round(readinessAvg),
      openEmergencyEvents: openEvents,
      recentMusterCount: musters.length,
      projectEmergencyScore: Math.round(
        (avgMusterCompliance + readinessAvg) / 2,
      ),
      trends: {
        avgResponseTimeMinutes,
        totalMissingWorkerEvents: missingPatterns,
        musterComplianceTrend: avgMusterCompliance,
      },
      leadingIndicators: {
        musterGapRate: 1 - avgMusterCompliance / 100,
        lowReadinessEquipment: equipment.filter((e) => e.readinessScore < 70)
          .length,
        equipmentReadinessPct: Math.round(readinessAvg),
      },
      cailInsights: insights,
    };
  }

  // ---------- Offline sync ----------

  async syncBundle(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { site: true },
    });
    if (!project?.siteId) throw new NotFoundException('Project/site not found');

    const [plans, workers, equipment, emergencyEquipment] = await Promise.all([
      this.listPlans({
        companyId: project.companyId,
        siteId: project.siteId,
        projectId,
      }),
      this.prisma.projectAssignment.findMany({
        where: { projectId, endedAt: null },
        include: {
          worker: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
        },
      }),
      project.siteId
        ? this.prisma.equipment.findMany({
            where: { companyId: project.companyId },
            take: 100,
            select: { id: true, name: true, operationalStatus: true },
          })
        : [],
      this.listEmergencyEquipment(project.companyId, project.siteId),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      projectId,
      plans,
      roster: workers,
      equipment,
      emergencyEquipment,
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      checkins?: Array<{
        musterEventId: string;
        workerId: number;
        clientSyncId?: string;
        lat?: number;
        lng?: number;
      }>;
      events?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const counts = { checkins: 0, events: 0 };
    for (const c of payload.checkins ?? []) {
      if (c.clientSyncId) {
        const exists = await this.prisma.musterCheckin.findUnique({
          where: { clientSyncId: c.clientSyncId },
        });
        if (exists) continue;
      }
      await this.musterCheckIn({
        musterEventId: c.musterEventId,
        workerId: c.workerId,
        clientSyncId: c.clientSyncId,
        lat: c.lat,
        lng: c.lng,
        method: 'offline',
      });
      counts.checkins++;
    }
    return counts;
  }

  async stationPayload(companyId: number, siteId: number) {
    const activeMuster = await this.getActiveMuster(siteId);
    const activeEvents = await this.prisma.pmEmergencyEvent.findMany({
      where: { companyId, siteId, status: { notIn: ['closed', 'cancelled'] } },
      take: 5,
    });
    return {
      generatedAt: new Date().toISOString(),
      activeMuster,
      activeEvents,
    };
  }
}
