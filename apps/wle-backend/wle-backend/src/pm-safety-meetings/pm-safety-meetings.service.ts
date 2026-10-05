import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SafetyMeetingAttendeeStatus,
  SafetyMeetingReviewStatus,
  SafetyMeetingStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { MeetingWorkflowEngine } from './meeting-workflow.engine';
import { PmSafetyMeetingsCailService } from './pm-safety-meetings-cail.service';
import { PmSafetyMeetingsTemplatesService } from './pm-safety-meetings-templates.service';
import { INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME } from './pm-safety-meetings.constants';

const meetingInclude = {
  topics: { orderBy: { sortOrder: 'asc' as const } },
  attendees: {
    include: {
      worker: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  signatures: true,
  attachments: true,
  correctiveLinks: {
    include: {
      correctiveAction: { select: { id: true, title: true, status: true } },
    },
  },
  template: true,
  facilitator: { select: { id: true, firstName: true, lastName: true } },
};

@Injectable()
export class PmSafetyMeetingsService {
  private readonly workflow = new MeetingWorkflowEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmSafetyMeetingsCailService,
    private readonly capa: PmCorrectiveActionsService,
    private readonly templates: PmSafetyMeetingsTemplatesService,
  ) {}

  private async audit(
    meetingId: string,
    eventType: string,
    actorId?: number,
    payload?: unknown,
  ) {
    await this.prisma.safetyMeetingAuditLog.create({
      data: {
        meetingId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: SafetyMeetingStatus;
    meetingType?: string;
  }) {
    return this.prisma.safetyMeeting.findMany({
      where: {
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.meetingType
          ? { meetingType: filters.meetingType as never }
          : {}),
      },
      include: meetingInclude,
      orderBy: { scheduledAt: 'desc' },
      take: 100,
    });
  }

  async get(id: string) {
    const row = await this.prisma.safetyMeeting.findFirst({
      where: { id, deletedAt: null },
      include: meetingInclude,
    });
    if (!row) throw new NotFoundException('Meeting not found');
    return row;
  }

  async createFromInspection(inspectionId: string, createdByUserId: number) {
    const existing = await this.prisma.safetyMeeting.findFirst({
      where: { pmInspectionId: inspectionId, deletedAt: null },
      include: meetingInclude,
    });
    if (existing) {
      return { meeting: existing, existing: true as const };
    }

    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      include: {
        template: true,
        deficiencies: true,
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const reviewTemplate =
      await this.templates.ensureInspectionFailureReviewTemplate(
        inspection.companyId,
        inspection.projectId,
      );

    const agendaItems = Array.isArray(reviewTemplate.agendaJson)
      ? (reviewTemplate.agendaJson as Array<{
          title?: string;
          isHighRisk?: boolean;
          discussionPoints?: string[];
        }>)
      : [];

    const templateTopics = agendaItems
      .filter((row) => row?.title?.trim())
      .map((row) => ({
        title: row.title!.trim(),
        isHighRisk: Boolean(row.isHighRisk),
        sourceModule: 'inspection_template',
        sourceId: reviewTemplate.id,
      }));

    const deficiencyTopics = inspection.deficiencies.map((d) => ({
      title: d.title,
      isHighRisk: d.severity === 'critical' || d.severity === 'high',
      sourceModule: 'inspection',
      sourceId: inspection.id,
    }));

    const inlineTopics =
      templateTopics.length + deficiencyTopics.length > 0
        ? [...templateTopics, ...deficiencyTopics]
        : [
            {
              title: `Review findings: ${
                inspection.title ?? inspection.template.name
              }`,
              isHighRisk: inspection.passed === false,
              sourceModule: 'inspection',
              sourceId: inspection.id,
            },
          ];

    const meeting = await this.create({
      companyId: inspection.companyId,
      projectId: inspection.projectId,
      siteId: inspection.siteId ?? undefined,
      templateId: reviewTemplate.id,
      meetingType: reviewTemplate.meetingType,
      title: `${INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME}: ${
        inspection.title ?? inspection.template.name
      }`,
      locationNote: inspection.locationNote ?? undefined,
      createdByUserId,
      pmInspectionId: inspectionId,
      inlineTopics,
    });

    return { meeting, existing: false as const };
  }

  async create(input: {
    companyId: number;
    projectId: number;
    siteId?: number;
    templateId?: string;
    meetingType: string;
    customMeetingTypeLabel?: string;
    title: string;
    scheduledAt?: string;
    locationNote?: string;
    supervisorUserId?: number;
    facilitatorWorkerId?: number;
    createdByUserId: number;
    pmInspectionId?: string;
    topicIds?: string[];
    inlineTopics?: {
      title: string;
      isHighRisk?: boolean;
      sourceModule?: string;
      sourceId?: string;
      discussionPoints?: string[];
      requiredControls?: string[];
      notes?: string;
    }[];
  }) {
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      throw new NotFoundException(
        `Project ${input.projectId} was not found. Open Safety Meetings from a project context or pass a valid projectId.`,
      );
    }

    const meeting = await this.prisma.safetyMeeting.create({
      data: {
        companyId: input.companyId || project.companyId,
        projectId: input.projectId,
        siteId: input.siteId ?? project.siteId ?? undefined,
        templateId: input.templateId,
        meetingType: input.meetingType as never,
        customMeetingTypeLabel: input.customMeetingTypeLabel,
        title: input.title,
        scheduledAt: input.scheduledAt
          ? new Date(input.scheduledAt)
          : undefined,
        locationNote: input.locationNote,
        supervisorUserId: input.supervisorUserId,
        facilitatorWorkerId: input.facilitatorWorkerId,
        createdByUserId: input.createdByUserId,
        pmInspectionId: input.pmInspectionId,
        status: 'draft',
      },
    });

    if (input.topicIds?.length) {
      const topics = await this.prisma.topicLibraryEntry.findMany({
        where: { id: { in: input.topicIds } },
      });
      for (let i = 0; i < topics.length; i++) {
        const t = topics[i];
        await this.prisma.safetyMeetingTopic.create({
          data: {
            meetingId: meeting.id,
            topicLibraryId: t.id,
            sortOrder: i,
            title: t.title,
            discussionPoints: t.discussionPoints ?? [],
            requiredControls: t.requiredControls ?? [],
            isHighRisk: t.isHighRisk,
          },
        });
        await this.prisma.topicLibraryEntry.update({
          where: { id: t.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    if (input.inlineTopics?.length) {
      const base = input.topicIds?.length ?? 0;
      for (let i = 0; i < input.inlineTopics.length; i++) {
        const t = input.inlineTopics[i];
        await this.prisma.safetyMeetingTopic.create({
          data: {
            meetingId: meeting.id,
            sortOrder: base + i,
            title: t.title,
            isHighRisk: t.isHighRisk ?? false,
            sourceModule: t.sourceModule,
            sourceId: t.sourceId,
            discussionPoints: t.discussionPoints ?? [],
            requiredControls: t.requiredControls ?? [],
            notes: t.notes,
          },
        });
      }
    }

    await this.audit(meeting.id, 'created', input.createdByUserId);
    return this.get(meeting.id);
  }

  async publish(meetingId: string, actorId: number) {
    return this.transition(meetingId, 'published', actorId);
  }

  async start(meetingId: string, actorId: number) {
    const m = await this.get(meetingId);
    const updated = await this.prisma.safetyMeeting.update({
      where: { id: meetingId },
      data: {
        status: 'in_progress',
        startedAt: m.startedAt ?? new Date(),
      },
    });
    await this.audit(meetingId, 'started', actorId);
    return updated;
  }

  async transition(
    meetingId: string,
    targetStatus: SafetyMeetingStatus,
    actorId: number,
  ) {
    const meeting = await this.get(meetingId);
    const hasHighRisk = meeting.topics.some((t) => t.isHighRisk);
    const hasSif = meeting.topics.some((t) =>
      String(t.title).toLowerCase().includes('sif'),
    );
    const present = meeting.attendees.filter((a) => a.status === 'present');
    const signed = meeting.signatures.filter((s) =>
      meeting.attendees.some(
        (a) =>
          a.status === 'present' &&
          (s.signerWorkerId === a.workerId || s.attendeeId === a.id),
      ),
    );

    const check = this.workflow.canTransition({
      currentStatus: meeting.status,
      targetStatus,
      meetingType: meeting.meetingType,
      hasHighRiskTopics: hasHighRisk,
      hasCorrectiveActions: meeting.correctiveLinks.length > 0,
      hasSifTopics: hasSif,
      attendeeCount: meeting.attendees.length,
      signedAttendeeCount: signed.length,
      reviewStatus: meeting.reviewStatus,
    });

    if (!check.allowed) {
      throw new BadRequestException(check.reason);
    }

    const requiresReview = this.workflow.requiresSupervisorReview({
      meetingType: meeting.meetingType,
      hasHighRiskTopics: hasHighRisk,
      hasCorrectiveActions: meeting.correctiveLinks.length > 0,
      hasSifTopics: hasSif,
    });

    const reviewStatus = this.workflow.deriveReviewStatus(
      requiresReview,
      meeting.reviewStatus,
    );

    const data: Prisma.SafetyMeetingUpdateInput = {
      status: targetStatus,
      requiresSupervisorReview: requiresReview,
      reviewStatus,
    };

    if (targetStatus === 'published') {
      data.scheduledAt = meeting.scheduledAt ?? new Date();
    }
    if (targetStatus === 'completed') {
      data.completedAt = new Date();
    }
    if (targetStatus === 'locked') {
      data.lockedAt = new Date();
    }

    await this.prisma.safetyMeeting.update({
      where: { id: meetingId },
      data,
    });

    if (targetStatus === 'completed' || targetStatus === 'reviewed') {
      await this.cail.ensureMeetingCail(meetingId, actorId);
    }

    await this.audit(meetingId, `status_${targetStatus}`, actorId);
    return this.get(meetingId);
  }

  async supervisorReview(
    meetingId: string,
    outcome: 'approved' | 'rejected' | 'changes_requested',
    actorId: number,
    notes?: string,
  ) {
    const meeting = await this.get(meetingId);
    if (!meeting.requiresSupervisorReview) {
      throw new BadRequestException('Supervisor review not required');
    }

    const statusMap: Record<string, SafetyMeetingReviewStatus> = {
      approved: 'approved',
      rejected: 'rejected',
      changes_requested: 'changes_requested',
    };

    await this.prisma.safetyMeeting.update({
      where: { id: meetingId },
      data: {
        reviewStatus: statusMap[outcome],
        reviewNotes: notes,
        reviewedAt: new Date(),
        reviewedByUserId: actorId,
        ...(outcome === 'approved' ? { status: 'reviewed' } : {}),
      },
    });

    await this.audit(meetingId, `review_${outcome}`, actorId, { notes });
    return this.get(meetingId);
  }

  async addAttendee(meetingId: string, workerId: number, actorId: number) {
    const row = await this.prisma.safetyMeetingAttendee.upsert({
      where: { meetingId_workerId: { meetingId, workerId } },
      create: { meetingId, workerId, status: 'expected' },
      update: {},
      include: { worker: true },
    });
    await this.audit(meetingId, 'attendee_added', actorId, { workerId });
    return row;
  }

  /**
   * Field sign-on: ensure attendee row → mark present → capture worker signature.
   * Used for toolbox / FLHA-style “I was on this project / at this talk” tracking.
   */
  async signOnWorker(input: {
    meetingId: string;
    workerId: number;
    actorId: number;
    signatureData?: string;
    signerName?: string;
  }) {
    const meeting = await this.get(input.meetingId);
    if (meeting.status === 'draft') {
      throw new BadRequestException(
        'Publish or start the meeting before workers can sign on.',
      );
    }
    if (['completed', 'reviewed', 'locked'].includes(meeting.status)) {
      throw new BadRequestException(
        `Cannot sign on — meeting is ${meeting.status}.`,
      );
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!worker) throw new NotFoundException(`Worker ${input.workerId} not found`);

    await this.addAttendee(input.meetingId, input.workerId, input.actorId);
    await this.checkInAttendee(input.meetingId, input.workerId, input.actorId);

    const attendee = await this.prisma.safetyMeetingAttendee.findUniqueOrThrow({
      where: {
        meetingId_workerId: {
          meetingId: input.meetingId,
          workerId: input.workerId,
        },
      },
    });

    const displayName =
      input.signerName?.trim() ||
      `${worker.firstName} ${worker.lastName}`.trim();

    const signature = await this.addSignature({
      meetingId: input.meetingId,
      attendeeId: attendee.id,
      role: 'WORKER',
      signerWorkerId: input.workerId,
      signatureData:
        input.signatureData?.trim() ||
        `digital_sign_on:${displayName}:${new Date().toISOString()}`,
      clientSyncId: `signon-${input.meetingId}-${input.workerId}-${Date.now()}`,
    });

    await this.audit(input.meetingId, 'worker_signed_on', input.actorId, {
      workerId: input.workerId,
      attendeeId: attendee.id,
      signatureId: signature.id,
      onProject: true,
    });

    return {
      meeting: await this.get(input.meetingId),
      attendee,
      signature,
      presence: {
        workerId: input.workerId,
        projectId: meeting.projectId,
        markedPresentAt: attendee.checkedInAt,
        source: 'safety_meeting_sign_on',
      },
    };
  }

  async checkInAttendee(meetingId: string, workerId: number, actorId: number) {
    // Ensure row exists so field kiosk can check in without a prior roster add
    await this.prisma.safetyMeetingAttendee.upsert({
      where: { meetingId_workerId: { meetingId, workerId } },
      create: { meetingId, workerId, status: 'expected' },
      update: {},
    });

    const training = await this.validateWorkerTraining(workerId, meetingId);
    const equipment = await this.validateWorkerEquipment(workerId, meetingId);

    const row = await this.prisma.safetyMeetingAttendee.update({
      where: { meetingId_workerId: { meetingId, workerId } },
      data: {
        status: 'present',
        checkedInAt: new Date(),
        trainingValid: training.valid,
        equipmentAuthorized: equipment.valid,
        identityVerified: true,
        verificationMethod: 'digital_checkin',
      },
      include: { worker: true },
    });
    await this.audit(meetingId, 'attendee_checked_in', actorId, {
      workerId,
      training,
      equipment,
    });
    return row;
  }

  async addSignature(input: {
    meetingId: string;
    attendeeId?: string;
    role: string;
    signerUserId?: number;
    signerWorkerId?: number;
    signatureData?: string;
    clientSyncId?: string;
  }) {
    if (input.clientSyncId) {
      const dup = await this.prisma.safetyMeetingSignature.findUnique({
        where: { clientSyncId: input.clientSyncId },
      });
      if (dup) return dup;
    }

    return this.prisma.safetyMeetingSignature.create({
      data: {
        meetingId: input.meetingId,
        attendeeId: input.attendeeId,
        role: input.role,
        signerUserId: input.signerUserId,
        signerWorkerId: input.signerWorkerId,
        signatureData: input.signatureData,
        clientSyncId: input.clientSyncId,
      },
    });
  }

  async createCapaFromMeeting(input: {
    meetingId: string;
    topicId?: string;
    title: string;
    description?: string;
    origin?: string;
    createdByUserId: number;
  }) {
    const meeting = await this.get(input.meetingId);
    const action = await this.capa.create({
      companyId: meeting.companyId,
      projectId: meeting.projectId,
      siteId: meeting.siteId ?? undefined,
      sourceModule: 'safety_meetings',
      sourceId: meeting.id,
      sourceItemId: input.topicId ?? '',
      title: input.title,
      description: input.description,
      createdByUserId: input.createdByUserId,
    });

    await this.prisma.safetyMeetingCorrectiveAction.create({
      data: {
        meetingId: meeting.id,
        topicId: input.topicId,
        correctiveActionId: action.id,
        origin: input.origin ?? 'discussion',
      },
    });

    await this.prisma.safetyMeeting.update({
      where: { id: meeting.id },
      data: {
        requiresSupervisorReview: true,
        reviewStatus:
          meeting.reviewStatus === 'not_required'
            ? 'pending'
            : meeting.reviewStatus,
      },
    });

    await this.audit(meeting.id, 'capa_created', input.createdByUserId, {
      actionId: action.id,
    });
    return action;
  }

  async workerMeetingAccess(workerId: number, projectId: number) {
    const requirements =
      await this.prisma.siteAccessMeetingRequirement.findMany({
        where: { projectId, active: true },
      });

    const denialReasons: string[] = [];
    const checks: Record<string, boolean> = {};

    for (const req of requirements) {
      const windowStart = new Date(
        Date.now() - req.windowHours * 60 * 60 * 1000,
      );
      const attended = await this.prisma.safetyMeetingAttendee.findFirst({
        where: {
          workerId,
          status: 'present',
          checkedInAt: { gte: windowStart },
          meeting: {
            projectId,
            meetingType: req.meetingType,
            status: { in: ['completed', 'reviewed', 'locked'] },
          },
        },
      });
      const key = `meeting_${req.meetingType}_${req.zoneCode}`;
      checks[key] = !!attended;
      if (!attended) {
        denialReasons.push(
          `Required ${req.meetingType} meeting not attended in last ${req.windowHours}h`,
        );
      }
    }

    return {
      granted: denialReasons.length === 0,
      denialReasons,
      checks,
    };
  }

  async syncOffline(body: Record<string, unknown>) {
    const clientSyncId = body.clientSyncId as string | undefined;
    if (clientSyncId) {
      const existing = await this.prisma.safetyMeeting.findUnique({
        where: { clientSyncId },
      });
      if (existing) {
        throw new ConflictException({
          code: 'SYNC_DUPLICATE',
          meetingId: existing.id,
        });
      }
    }

    const created = await this.create({
      companyId: body.companyId as number,
      projectId: body.projectId as number,
      siteId: body.siteId as number | undefined,
      meetingType: (body.meetingType as string) ?? 'toolbox_talk',
      title: (body.title as string) ?? 'Offline meeting',
      createdByUserId: (body.createdByUserId as number) ?? 0,
      topicIds: body.topicIds as string[] | undefined,
      facilitatorWorkerId: body.facilitatorWorkerId as number | undefined,
    });

    if (clientSyncId) {
      await this.prisma.safetyMeeting.update({
        where: { id: created.id },
        data: { clientSyncId },
      });
    }

    const attendees = (body.attendees as { workerId: number }[]) ?? [];
    for (const a of attendees) {
      await this.checkInAttendee(
        created.id,
        a.workerId,
        body.createdByUserId as number,
      );
    }

    const signatures =
      (body.signatures as {
        signerWorkerId?: number;
        signatureData?: string;
        clientSyncId?: string;
      }[]) ?? [];
    for (const s of signatures) {
      await this.addSignature({
        meetingId: created.id,
        role: 'attendee',
        signerWorkerId: s.signerWorkerId,
        signatureData: s.signatureData,
        clientSyncId: s.clientSyncId,
      });
    }

    if (body.complete === true) {
      await this.transition(
        created.id,
        'completed',
        body.createdByUserId as number,
      );
    }

    return this.get(created.id);
  }

  private async validateWorkerTraining(workerId: number, meetingId: string) {
    const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
      where: { id: meetingId },
      select: { projectId: true },
    });
    const records = await this.prisma.trainingRecord.findMany({
      where: {
        workerId,
        OR: [{ projectId: meeting.projectId }, { projectId: null }],
      },
    });
    const now = new Date();
    const valid = records.some((r) => !r.expiresAt || r.expiresAt > now);
    return { valid, recordCount: records.length };
  }

  private async validateWorkerEquipment(workerId: number, meetingId: string) {
    const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
      where: { id: meetingId },
      select: { projectId: true },
    });
    const lockouts = await this.prisma.equipmentLockout.count({
      where: {
        unlockedAt: null,
        equipment: {
          equipmentAssignments: {
            some: { workerId },
          },
        },
      },
    });
    return { valid: lockouts === 0, activeLockouts: lockouts };
  }

  async linkStation(meetingId: string, stationId: number) {
    return this.prisma.safetyMeeting.update({
      where: { id: meetingId },
      data: { safetyStationId: stationId },
    });
  }
}
