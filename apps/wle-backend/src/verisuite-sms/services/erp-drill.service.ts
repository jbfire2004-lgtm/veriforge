import { Injectable } from '@nestjs/common';
import { Prisma, SmsDrillRosterStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import type { SmsRequestScope } from '../types';
import {
  ERP_DRILL_TYPES,
  buildDrillSummary,
  defaultAttendanceSeed,
  getDrillType,
  seedChecklist,
  type DrillAttendancePerson,
  type DrillChecklistState,
  type DrillIssue,
  type DrillTimelineEvent,
  type ErpDrillSummaryReport,
  type ErpDrillTypeId,
} from './erp-drill.catalog';

type StartDrillBody = {
  drillType: ErpDrillTypeId;
  trackEveryone?: boolean;
  musterPoint?: string;
  title?: string;
  facilitator?: string;
  projectName?: string;
  attendance?: Array<{
    id: string;
    name: string;
    role?: string;
    crew?: string;
  }>;
};

type PatchDrillBody = {
  checklist?: DrillChecklistState[];
  timeline?: DrillTimelineEvent[];
  issues?: DrillIssue[];
  attendance?: DrillAttendancePerson[];
  musterPoint?: string;
  facilitator?: string;
};

@Injectable()
export class ErpDrillService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
  ) {}

  catalog() {
    return {
      drillTypes: ERP_DRILL_TYPES.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        defaultDurationMin: t.defaultDurationMin,
        checklist: t.checklist,
      })),
    };
  }

  async start(scope: SmsRequestScope, erpId: string, body: StartDrillBody) {
    const typeDef = getDrillType(body.drillType);
    if (!typeDef) {
      throw new SmsException('VALIDATION_ERROR', 'Invalid drill type');
    }

    const erp = await this.prisma.smsErpRecord.findFirst({
      where: { id: erpId, companyId: scope.companyId, deletedAt: null },
    });
    if (!erp) throw new SmsException('NOT_FOUND', 'ERP not found');

    const startedAt = new Date();
    const checklist = seedChecklist(body.drillType);
    const timeline: DrillTimelineEvent[] = [
      {
        id: `evt-${startedAt.getTime()}`,
        at: startedAt.toISOString(),
        kind: 'started',
        label: `${typeDef.label} drill started`,
        detail: body.title,
      },
    ];

    const attendanceSeed =
      body.attendance?.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role ?? 'Worker',
        crew: a.crew ?? 'Crew',
        status: 'expected' as const,
        markedAt: null,
      })) ?? defaultAttendanceSeed();

    const session = await this.prisma.smsErpDrillSession.create({
      data: {
        erpRecordId: erpId,
        startedAt,
        status: 'in_progress',
        trackEveryone: body.trackEveryone ?? false,
        drillType: body.drillType,
        checklistJson: checklist as unknown as Prisma.InputJsonValue,
        timelineJson: timeline as unknown as Prisma.InputJsonValue,
        issuesJson: [] as unknown as Prisma.InputJsonValue,
        summaryJson: {
          title: body.title ?? `ERP Drill — ${typeDef.label}`,
          musterPoint: body.musterPoint ?? erp.musterPoint ?? 'Primary muster',
          facilitator: body.facilitator ?? 'Site supervisor',
          projectName: body.projectName ?? 'Project',
        } as unknown as Prisma.InputJsonValue,
      },
    });

    const roster = [];
    for (const person of attendanceSeed) {
      const row = await this.prisma.smsErpDrillRoster.create({
        data: {
          sessionId: session.id,
          personKey: person.id,
          displayNameRedacted: person.name,
          sourcesJson: ['meeting_sign_in', 'daily_site_log'],
          status: SmsDrillRosterStatus.expected,
          signInRefsJson: {
            role: person.role,
            crew: person.crew,
          } as unknown as Prisma.InputJsonValue,
        },
      });
      roster.push({
        personId: row.personKey,
        displayName: row.displayNameRedacted,
        role: person.role,
        crew: person.crew,
        status: row.status,
        markedAt: null,
      });
    }

    await this.audit.log({
      scope,
      action: 'erp.drill',
      entityType: 'erp_drill_sessions',
      entityId: session.id,
      payload: { erpId, drillType: body.drillType },
    });

    return {
      drillId: session.id,
      erpId,
      drillType: body.drillType,
      drillTypeLabel: typeDef.label,
      startedAt: startedAt.toISOString(),
      musterPoint: body.musterPoint ?? erp.musterPoint ?? 'Primary muster',
      facilitator: body.facilitator ?? 'Site supervisor',
      checklist,
      timeline,
      attendance: attendanceSeed,
      issues: [] as DrillIssue[],
      roster,
    };
  }

  async patch(scope: SmsRequestScope, drillId: string, body: PatchDrillBody) {
    const session = await this.loadOwnedSession(scope, drillId);
    if (session.status !== 'in_progress') {
      throw new SmsException('VALIDATION_ERROR', 'Drill is not in progress');
    }

    const data: Prisma.SmsErpDrillSessionUpdateInput = {};
    if (body.checklist) {
      data.checklistJson = body.checklist as unknown as Prisma.InputJsonValue;
    }
    if (body.timeline) {
      data.timelineJson = body.timeline as unknown as Prisma.InputJsonValue;
    }
    if (body.issues) {
      data.issuesJson = body.issues as unknown as Prisma.InputJsonValue;
    }

    if (body.musterPoint || body.facilitator) {
      const meta = (session.summaryJson as Record<string, unknown>) ?? {};
      data.summaryJson = {
        ...meta,
        ...(body.musterPoint ? { musterPoint: body.musterPoint } : {}),
        ...(body.facilitator ? { facilitator: body.facilitator } : {}),
      } as unknown as Prisma.InputJsonValue;
    }

    if (body.attendance) {
      for (const person of body.attendance) {
        const status = person.status as SmsDrillRosterStatus;
        await this.prisma.smsErpDrillRoster.upsert({
          where: {
            sessionId_personKey: {
              sessionId: drillId,
              personKey: person.id,
            },
          },
          create: {
            sessionId: drillId,
            personKey: person.id,
            displayNameRedacted: person.name,
            status,
            sourcesJson: ['manual'],
            signInRefsJson: {
              role: person.role,
              crew: person.crew,
              markedAt: person.markedAt,
            } as unknown as Prisma.InputJsonValue,
          },
          update: {
            status,
            displayNameRedacted: person.name,
            signInRefsJson: {
              role: person.role,
              crew: person.crew,
              markedAt: person.markedAt,
            } as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    const updated = await this.prisma.smsErpDrillSession.update({
      where: { id: drillId },
      data,
      include: { roster: true },
    });

    return this.serializeSession(updated);
  }

  async complete(scope: SmsRequestScope, drillId: string, body?: PatchDrillBody) {
    if (body) {
      await this.patch(scope, drillId, body);
    }
    const session = await this.loadOwnedSession(scope, drillId);
    const summary = this.buildSummaryFromSession(session);
    const endedAt = new Date(summary.endedAt);

    const updated = await this.prisma.smsErpDrillSession.update({
      where: { id: drillId },
      data: {
        status: 'completed',
        endedAt,
        outcomeScore: summary.scores.overall,
        failedGatesJson: summary.findings as unknown as Prisma.InputJsonValue,
        summaryJson: summary as unknown as Prisma.InputJsonValue,
        checklistJson: summary.checklist as unknown as Prisma.InputJsonValue,
        timelineJson: summary.timeline as unknown as Prisma.InputJsonValue,
        issuesJson: summary.issues as unknown as Prisma.InputJsonValue,
      },
      include: { roster: true, erpRecord: true },
    });

    await this.prisma.smsErpRecord.update({
      where: { id: updated.erpRecordId },
      data: { lastDrillAt: endedAt },
    });

    await this.audit.log({
      scope,
      action: 'erp.drill.complete',
      entityType: 'erp_drill_sessions',
      entityId: drillId,
      payload: { score: summary.scores.overall },
    });

    return { ...this.serializeSession(updated), summary };
  }

  async getSummary(scope: SmsRequestScope, drillId: string) {
    const session = await this.loadOwnedSession(scope, drillId);
    if (session.summaryJson && session.status === 'completed') {
      return session.summaryJson as ErpDrillSummaryReport;
    }
    return this.buildSummaryFromSession(session);
  }

  private async loadOwnedSession(scope: SmsRequestScope, drillId: string) {
    const session = await this.prisma.smsErpDrillSession.findFirst({
      where: { id: drillId },
      include: { erpRecord: true, roster: true },
    });
    if (!session || session.erpRecord.companyId !== scope.companyId) {
      throw new SmsException('NOT_FOUND', 'Drill not found');
    }
    return session;
  }

  private buildSummaryFromSession(
    session: Awaited<ReturnType<ErpDrillService['loadOwnedSession']>>,
  ): ErpDrillSummaryReport {
    const meta = (session.summaryJson as Record<string, unknown>) ?? {};
    const checklist = (Array.isArray(session.checklistJson)
      ? session.checklistJson
      : []) as DrillChecklistState[];
    const timeline = (Array.isArray(session.timelineJson)
      ? session.timelineJson
      : []) as DrillTimelineEvent[];
    const issues = (Array.isArray(session.issuesJson)
      ? session.issuesJson
      : []) as DrillIssue[];

    const attendance: DrillAttendancePerson[] = session.roster.map((r) => {
      const refs = (r.signInRefsJson as Record<string, unknown>) ?? {};
      return {
        id: r.personKey,
        name: r.displayNameRedacted,
        role: typeof refs.role === 'string' ? refs.role : 'Worker',
        crew: typeof refs.crew === 'string' ? refs.crew : 'Crew',
        status: r.status as DrillAttendancePerson['status'],
        markedAt:
          typeof refs.markedAt === 'string'
            ? refs.markedAt
            : r.status !== 'expected'
              ? r.updatedAt.toISOString()
              : null,
      };
    });

    const drillType = (session.drillType as ErpDrillTypeId) || 'evacuation';

    return buildDrillSummary({
      drillType,
      title: typeof meta.title === 'string' ? meta.title : undefined,
      musterPoint:
        typeof meta.musterPoint === 'string'
          ? meta.musterPoint
          : session.erpRecord.musterPoint ?? undefined,
      projectName:
        typeof meta.projectName === 'string' ? meta.projectName : undefined,
      erpId: session.erpRecordId,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? new Date().toISOString(),
      checklist,
      timeline,
      attendance,
      issues,
      facilitator:
        typeof meta.facilitator === 'string' ? meta.facilitator : undefined,
    });
  }

  private serializeSession(
    session: {
      id: string;
      erpRecordId: string;
      drillType: string | null;
      startedAt: Date;
      endedAt: Date | null;
      status: string;
      checklistJson: Prisma.JsonValue | null;
      timelineJson: Prisma.JsonValue | null;
      issuesJson: Prisma.JsonValue | null;
      summaryJson: Prisma.JsonValue | null;
      outcomeScore: Prisma.Decimal | null;
      roster: Array<{
        personKey: string;
        displayNameRedacted: string;
        status: SmsDrillRosterStatus;
        signInRefsJson: Prisma.JsonValue | null;
        updatedAt: Date;
      }>;
    },
  ) {
    const meta = (session.summaryJson as Record<string, unknown>) ?? {};
    return {
      drillId: session.id,
      erpId: session.erpRecordId,
      drillType: session.drillType,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
      outcomeScore:
        session.outcomeScore != null ? Number(session.outcomeScore) : null,
      musterPoint:
        typeof meta.musterPoint === 'string' ? meta.musterPoint : null,
      facilitator:
        typeof meta.facilitator === 'string' ? meta.facilitator : null,
      checklist: session.checklistJson,
      timeline: session.timelineJson,
      issues: session.issuesJson,
      summary: session.status === 'completed' ? session.summaryJson : null,
      attendance: session.roster.map((r) => {
        const refs = (r.signInRefsJson as Record<string, unknown>) ?? {};
        return {
          id: r.personKey,
          name: r.displayNameRedacted,
          role: typeof refs.role === 'string' ? refs.role : 'Worker',
          crew: typeof refs.crew === 'string' ? refs.crew : 'Crew',
          status: r.status,
          markedAt:
            typeof refs.markedAt === 'string' ? refs.markedAt : null,
        };
      }),
    };
  }
}
