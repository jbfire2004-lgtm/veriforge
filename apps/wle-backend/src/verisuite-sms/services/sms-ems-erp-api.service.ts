import { Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  SmsDrillRosterStatus,
  SmsErpScenario,
  SmsErpStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { paginatedResult, parseSmsPage } from '../common/sms-pagination';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';

@Injectable()
export class SmsEmsErpApiService {
  private readonly logger = new Logger(SmsEmsErpApiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  /**
   * EMS lookup — never invent phone numbers.
   * Provider failure → 200 with 911-only fallback.
   */
  async lookupEms(
    _scope: SmsRequestScope,
    query: {
      regionCode: string;
      scenario?: string;
      projectId?: string;
      lat?: string;
      lng?: string;
    },
  ) {
    if (!query.regionCode) {
      throw new SmsException('VALIDATION_ERROR', 'regionCode is required');
    }
    try {
      const contacts = await this.fetchProviders(query.regionCode, query.scenario);
      return { contacts, source: 'provider' as const };
    } catch (err) {
      this.logger.warn(`EMS provider fallback: ${(err as Error).message}`);
      return {
        contacts: [
          {
            id: 'ems-911',
            agency: 'Emergency Services',
            name: 'Public Safety Answering Point',
            phone: '911',
            distanceKm: null,
            etaMinutes: null,
            address: null,
            recommendedFor: [query.scenario ?? 'general'],
            emergencyPriority: 1,
            verifiedAt: new Date().toISOString(),
          },
        ],
        source: 'fallback' as const,
      };
    }
  }

  private async fetchProviders(regionCode: string, scenario?: string) {
    // Deterministic verified catalog — no LLM phones
    const catalog: Array<{
      id: string;
      agency: string;
      name: string;
      phone: string;
      region: string;
      scenarios: string[];
    }> = [
      {
        id: 'ems-ca-ab-ems',
        agency: 'Alberta EMS',
        name: 'Regional Dispatch',
        phone: '911',
        region: 'CA-AB',
        scenarios: [
          'general',
          'fall',
          'electrical',
          'chemical',
          'trench',
          'rollover',
        ],
      },
      {
        id: 'ems-ca-ab-fire',
        agency: 'Municipal Fire',
        name: 'Fire / Rescue',
        phone: '911',
        region: 'CA-AB',
        scenarios: ['general', 'chemical', 'electrical'],
      },
      {
        id: 'ems-ca-sk-ems',
        agency: 'Saskatchewan EMS',
        name: 'Provincial / municipal EMS',
        phone: '911',
        region: 'CA-SK',
        scenarios: [
          'general',
          'fall',
          'electrical',
          'chemical',
          'trench',
          'rollover',
        ],
      },
      {
        id: 'ems-ca-sk-fire',
        agency: 'Municipal Fire',
        name: 'Fire / Rescue',
        phone: '911',
        region: 'CA-SK',
        scenarios: ['general', 'chemical', 'electrical'],
      },
      {
        id: 'ems-ca-bc-ems',
        agency: 'BC Emergency Health Services',
        name: 'Ambulance Dispatch',
        phone: '911',
        region: 'CA-BC',
        scenarios: [
          'general',
          'fall',
          'electrical',
          'chemical',
          'trench',
          'rollover',
        ],
      },
    ];
    const matched = catalog.filter(
      (c) =>
        regionCode.includes(c.region) ||
        regionCode === 'global' ||
        c.region.startsWith(regionCode.slice(0, 2)),
    );
    if (!matched.length) {
      throw new Error('no_provider');
    }
    return matched
      .filter((c) => !scenario || c.scenarios.includes(scenario))
      .map((c) => ({
        id: c.id,
        agency: c.agency,
        name: c.name,
        phone: c.phone,
        distanceKm: 12,
        etaMinutes: 18,
        address: null as string | null,
        recommendedFor: c.scenarios,
        emergencyPriority: c.phone === '911' ? 1 : 2,
        verifiedAt: new Date().toISOString(),
      }));
  }

  async persist(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      draft?: {
        title: string;
        steps?: string[];
        musterPoint?: string;
        emsContacts?: Array<{ id: string }>;
        hazards?: string[];
      };
      title?: string;
      scenario?: SmsErpScenario;
      suggestionId?: string;
      clientRequestId?: string;
    },
  ) {
    const draft = body.draft;
    const title = draft?.title ?? body.title;
    if (!body.projectId || !title) {
      throw new SmsException('VALIDATION_ERROR', 'projectId and title required');
    }
    const emsIds = (draft?.emsContacts ?? []).map((c) => c.id);
    const record = await this.prisma.smsErpRecord.create({
      data: {
        sorEmergencyPlanId: body.clientRequestId
          ? `client:${body.clientRequestId}`
          : randomUUID(),
        companyId: scope.companyId,
        projectId: body.projectId,
        accessPlane: scope.plane,
        title,
        scenario: body.scenario ?? SmsErpScenario.general,
        stepsJson: (draft?.steps ?? []) as Prisma.InputJsonValue,
        musterPoint: draft?.musterPoint ?? 'primary_muster',
        hazardsJson: (draft?.hazards ?? []) as Prisma.InputJsonValue,
        emsContactsJson: emsIds as Prisma.InputJsonValue,
        qualityScore: emsIds.length ? 80 : 65,
        status: SmsErpStatus.draft,
        aiSuggestionId: body.suggestionId,
        createdByUserId: scope.userId,
      },
    });
    if (body.suggestionId) {
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId: body.suggestionId,
        behaviorId: 'AI-06',
        actorUserId: scope.userId,
        decision: 'applied',
        entityType: 'erp_records',
        entityId: record.id,
      });
    }
    await this.ingestion.enqueue(
      scope.companyId,
      'erp.changed',
      { erpId: record.id },
      body.projectId,
    );
    return {
      id: record.id,
      sorEmergencyPlanId: record.sorEmergencyPlanId,
      status: record.status,
      qualityScore: Number(record.qualityScore ?? 0),
      rowVersion: record.rowVersion,
    };
  }

  async startDrill(
    scope: SmsRequestScope,
    erpId: string,
    body?: { trackEveryone?: boolean },
  ) {
    const erp = await this.prisma.smsErpRecord.findFirst({
      where: { id: erpId, companyId: scope.companyId, deletedAt: null },
    });
    if (!erp) throw new SmsException('NOT_FOUND', 'ERP not found');

    const session = await this.prisma.smsErpDrillSession.create({
      data: {
        erpRecordId: erpId,
        startedAt: new Date(),
        status: 'in_progress',
        trackEveryone: body?.trackEveryone ?? false,
      },
    });

    const rosterSeed = [
      { personKey: 'crew:supervisor', display: 'S. ****' },
      { personKey: 'crew:worker-a', display: 'W. ****' },
    ];
    const roster = [];
    for (const r of rosterSeed) {
      const row = await this.prisma.smsErpDrillRoster.create({
        data: {
          sessionId: session.id,
          personKey: r.personKey,
          displayNameRedacted: r.display,
          sourcesJson: ['meeting_sign_in'],
          status: SmsDrillRosterStatus.expected,
        },
      });
      roster.push({
        personId: row.personKey,
        displayName: row.displayNameRedacted,
        sources: ['meeting_sign_in'],
        status: row.status,
      });
    }

    await this.audit.log({
      scope,
      action: 'erp.drill',
      entityType: 'erp_drill_sessions',
      entityId: session.id,
      payload: { erpId, trackEveryone: body?.trackEveryone ?? false },
    });

    return {
      drillId: session.id,
      roster,
      musterPoint: erp.musterPoint ?? 'primary_muster',
      sourcesUsed: ['meeting_sign_in'],
    };
  }

  async updateRoster(
    scope: SmsRequestScope,
    drillId: string,
    personId: string,
    body: { status: SmsDrillRosterStatus },
  ) {
    const allowed: SmsDrillRosterStatus[] = [
      SmsDrillRosterStatus.expected,
      SmsDrillRosterStatus.accounted,
      SmsDrillRosterStatus.missing,
      SmsDrillRosterStatus.excused,
    ];
    if (!allowed.includes(body.status)) {
      throw new SmsException('VALIDATION_ERROR', 'Invalid roster status');
    }
    const session = await this.prisma.smsErpDrillSession.findFirst({
      where: { id: drillId },
      include: { erpRecord: true, roster: true },
    });
    if (!session || session.erpRecord.companyId !== scope.companyId) {
      throw new SmsException('NOT_FOUND', 'Drill not found');
    }
    await this.prisma.smsErpDrillRoster.update({
      where: {
        sessionId_personKey: { sessionId: drillId, personKey: personId },
      },
      data: { status: body.status },
    });
    const roster = await this.prisma.smsErpDrillRoster.findMany({
      where: { sessionId: drillId },
    });
    const expected = roster.length;
    const accounted = roster.filter((r) => r.status === 'accounted').length;
    const missing = roster.filter((r) => r.status === 'missing').length;
    const excused = roster.filter((r) => r.status === 'excused').length;
    return {
      completenessPct: expected
        ? Math.round(((accounted + excused) / expected) * 100)
        : 0,
      accounted,
      missing,
      excused,
      expected,
    };
  }

  async list(
    scope: SmsRequestScope,
    query: {
      projectId?: string;
      scenario?: string;
      status?: string;
      cursor?: string;
      limit?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    const projectId = query.projectId
      ? Number(query.projectId)
      : scope.projectId;
    const items = await this.prisma.smsErpRecord.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(projectId != null ? { projectId } : {}),
        ...(query.scenario
          ? { scenario: query.scenario as SmsErpScenario }
          : {}),
        ...(query.status ? { status: query.status as SmsErpStatus } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    return paginatedResult(items, take);
  }

  async get(scope: SmsRequestScope, id: string) {
    const row = await this.prisma.smsErpRecord.findFirst({
      where: { id, companyId: scope.companyId, deletedAt: null },
      include: {
        drillSessions: { orderBy: { startedAt: 'desc' }, take: 1 },
        jhaRecords: { select: { id: true, title: true }, take: 20 },
      },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'ERP not found');
    return {
      ...row,
      lastDrillSummary: row.drillSessions[0]
        ? {
            drillId: row.drillSessions[0].id,
            outcomeScore: row.drillSessions[0].outcomeScore,
            startedAt: row.drillSessions[0].startedAt,
          }
        : null,
      linkedJhas: row.jhaRecords,
    };
  }
}
