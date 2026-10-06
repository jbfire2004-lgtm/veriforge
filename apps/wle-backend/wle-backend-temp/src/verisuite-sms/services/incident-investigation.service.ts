import { Injectable } from '@nestjs/common';
import { Prisma, SmsAiModelTier, SmsAiSource, SmsAiTone, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { parseDateRange, parseMulti, parseSmsPage } from '../common/sms-pagination';
import { SMS_BEHAVIORS } from '../constants';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';
import { evaluateDangerousOccurrences } from './dangerous-occurrence.engine';

const PACKAGE_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.SUPERVISOR,
];

@Injectable()
export class IncidentInvestigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly anon: SmsAnonymizationService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      title: string;
      type: string;
      severity: string;
      description?: string;
      occurredAt: string;
      location?: string;
      people?: unknown[];
      equipment?: unknown[];
      clientRequestId?: string;
      regionCode?: string;
    },
  ) {
    if (
      !body.projectId ||
      !body.title ||
      !body.type ||
      !body.severity ||
      !body.occurredAt
    ) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'projectId, title, type, severity, and occurredAt are required',
      );
    }

    const project = await this.prisma.project
      .findFirst({
        where: { id: body.projectId, companyId: scope.companyId },
        include: { site: true, company: true },
      })
      .catch(() => null);

    const regionCode =
      body.regionCode ||
      project?.site?.region ||
      project?.company?.province ||
      'CA-AB';

    const doAssessment = evaluateDangerousOccurrences(
      [body.title, body.description, body.location].filter(Boolean).join(' '),
      regionCode,
    );

    const incident = await this.prisma.incident.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.type,
        severity: body.severity,
        status: 'OPEN',
        companyId: scope.companyId,
        createdById: scope.userId,
        metadata: {
          projectId: body.projectId,
          occurredAt: body.occurredAt,
          location: body.location,
          people: body.people ?? [],
          equipment: body.equipment ?? [],
          clientRequestId: body.clientRequestId,
          sifPotential: ['CRITICAL', 'FATALITY', 'HIGH'].includes(
            body.severity.toUpperCase(),
          ),
          dangerousOccurrence: doAssessment,
          ohsReportingRequired: doAssessment.mustReportAny,
        } as Prisma.InputJsonValue,
      },
    });

    await this.ingestion.enqueue(
      scope.companyId,
      'incident.changed',
      { incidentId: incident.id },
      body.projectId,
    );
    await this.audit.log({
      scope,
      action: 'record.create',
      entityType: 'incidents',
      entityId: String(incident.id),
      payload: {
        dangerousOccurrenceCodes: doAssessment.codes,
        mustReport: doAssessment.mustReportAny,
      },
    });

    const meta = incident.metadata as {
      sifPotential?: boolean;
      ohsReportingRequired?: boolean;
    } | null;
    return {
      id: String(incident.id),
      sorEventId: String(incident.id),
      status: 'open',
      sifPotential: !!meta?.sifPotential,
      ohsReportingRequired: !!meta?.ohsReportingRequired || doAssessment.mustReportAny,
      dangerousOccurrence: doAssessment,
      rowVersion: 1,
    };
  }

  async smartLog(
    scope: SmsRequestScope,
    query: {
      type?: string;
      severity?: string;
      status?: string;
      q?: string;
      dateFrom?: string;
      dateTo?: string;
      cursor?: string;
      limit?: string;
      sort?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    if (query.q && (query.q.length < 2 || query.q.length > 100)) {
      throw new SmsException('VALIDATION_ERROR', 'q must be 2–100 characters');
    }
    const range = parseDateRange(query.dateFrom, query.dateTo);
    const types = parseMulti(query.type);
    const severities = parseMulti(query.severity);

    const where = {
      companyId: scope.companyId,
      ...(types ? { category: { in: types } } : {}),
      ...(severities ? { severity: { in: severities } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query.q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(range.gte || range.lte
        ? { createdAt: { gte: range.gte, lte: range.lte } }
        : {}),
    };

    const cursorId = cursor && /^\d+$/.test(cursor) ? Number(cursor) : undefined;
    const rows = await this.prisma.incident.findMany({
      where,
      orderBy:
        query.sort === 'severity:desc'
          ? { severity: 'desc' }
          : { createdAt: 'desc' },
      take,
      ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
    });

    const items = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      type: r.category,
      severity: r.severity,
      status: r.status,
      occurredAt: r.createdAt.toISOString(),
      location: null as string | null,
    }));

    const all = await this.prisma.incident.groupBy({
      by: ['severity'],
      where: { companyId: scope.companyId },
      _count: { _all: true },
    });
    const typeFacets = await this.prisma.incident.groupBy({
      by: ['category'],
      where: { companyId: scope.companyId },
      _count: { _all: true },
    });

    return {
      items,
      facets: [
        {
          field: 'severity',
          buckets: all.map((a) => ({
            value: a.severity,
            count: a._count._all,
          })),
        },
        {
          field: 'type',
          buckets: typeFacets
            .filter((t) => t.category)
            .map((t) => ({
              value: t.category as string,
              count: t._count._all,
            })),
        },
      ],
      totals: { count: items.length },
      nextCursor:
        items.length === take ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  async list(scope: SmsRequestScope, cursor?: string, take = 25) {
    return this.smartLog(scope, { cursor, limit: String(take) });
  }

  async get(scope: SmsRequestScope, incidentId: string) {
    this.assertPackageRole(scope, incidentId);
    const idNum = Number(incidentId);
    if (!Number.isFinite(idNum)) {
      throw new SmsException('NOT_FOUND', 'Incident not found');
    }
    const incident = await this.prisma.incident.findFirst({
      where: { id: idNum, companyId: scope.companyId },
    });
    if (!incident) throw new SmsException('NOT_FOUND', 'Incident not found');

    await this.audit.log({
      scope,
      action: 'investigation.package.view',
      entityType: 'investigation_package',
      entityId: incidentId,
    });

    const linkedActions = await this.prisma.smsCorrectiveAction.findMany({
      where: {
        companyId: scope.companyId,
        sourceModule: 'incident',
        sourceRecordId: incidentId,
        deletedAt: null,
      },
      take: 50,
    });

    const meta = (incident.metadata ?? {}) as {
      investigation?: {
        status?: string;
        rootCauseIds?: string[];
        findings?: unknown[];
        rowVersion?: number;
      };
      projectId?: number;
    };
    const inv = meta.investigation ?? {};

    const links = await this.prisma.smsRecordLink.findMany({
      where: {
        companyId: scope.companyId,
        OR: [
          { fromType: 'incident', fromId: incidentId },
          { toType: 'incident', toId: incidentId },
        ],
      },
      take: 50,
    });

    const meetingIds = links
      .filter((l) => l.toType === 'meeting' || l.fromType === 'meeting')
      .map((l) => (l.toType === 'meeting' ? l.toId : l.fromId));
    const flhaIds = links
      .filter((l) => l.toType === 'flha' || l.fromType === 'flha')
      .map((l) => (l.toType === 'flha' ? l.toId : l.fromId));

    const [linkedMeetings, linkedFlha] = await Promise.all([
      meetingIds.length
        ? this.prisma.smsSafetyMeeting.findMany({
            where: {
              id: { in: meetingIds },
              companyId: scope.companyId,
              deletedAt: null,
            },
            take: 20,
          })
        : Promise.resolve([]),
      flhaIds.length
        ? this.prisma.smsFlhaRecord.findFirst({
            where: {
              id: { in: flhaIds },
              companyId: scope.companyId,
              deletedAt: null,
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      event: incident,
      findings: inv.findings ?? [],
      rootCauses: (inv.rootCauseIds ?? []).map((id) => ({ id })),
      linkedActions,
      linkedMeetings,
      linkedFlha,
      investigation: {
        status: inv.status ?? 'open',
        rowVersion: inv.rowVersion ?? 1,
        rootCauseIds: inv.rootCauseIds ?? [],
      },
    };
  }

  async getInvestigationPackage(scope: SmsRequestScope, incidentId: string) {
    this.assertPackageRole(scope, incidentId);
    const detail = await this.get(scope, incidentId);
    return {
      incidentId,
      header: {
        id: detail.event.id,
        status: detail.event.status,
      },
      packageAcl: 'investigator|site_hse|company_safety|pm_policy',
      investigation: detail.investigation,
    };
  }

  async updateInvestigation(
    scope: SmsRequestScope,
    incidentId: string,
    body: {
      rowVersion: number;
      status?: string;
      rootCauseIds?: string[];
      findings?: unknown[];
      acceptSuggestionIds?: string[];
    },
  ) {
    this.assertPackageRole(scope, incidentId);
    if (body.rowVersion == null) {
      throw new SmsException('VALIDATION_ERROR', 'rowVersion is required');
    }
    if (body.status === 'closed' && !(body.rootCauseIds?.length)) {
      throw new SmsException(
        'BUSINESS_RULE',
        'Incomplete close-out: rootCauseIds required',
      );
    }
    const idNum = Number(incidentId);
    const incident = await this.prisma.incident.findFirst({
      where: { id: idNum, companyId: scope.companyId },
    });
    if (!incident) throw new SmsException('NOT_FOUND', 'Incident not found');

    const existingMeta = (incident.metadata ?? {}) as {
      investigation?: { rowVersion?: number };
    };
    const currentRv = existingMeta.investigation?.rowVersion ?? 1;
    if (body.rowVersion !== currentRv) {
      throw new SmsException(
        'CONFLICT',
        `Stale rowVersion: expected ${currentRv}, got ${body.rowVersion}`,
        { code: 'row_version_conflict', expected: currentRv },
      );
    }

    const meta = {
      ...((incident.metadata as object) ?? {}),
      investigation: {
        status: body.status ?? 'in_progress',
        rootCauseIds: body.rootCauseIds ?? [],
        findings: body.findings ?? [],
        rowVersion: body.rowVersion + 1,
      },
    };

    await this.prisma.incident.update({
      where: { id: idNum },
      data: {
        status: body.status === 'closed' ? 'CLOSED' : incident.status,
        metadata: meta as Prisma.InputJsonValue,
      },
    });

    for (const sid of body.acceptSuggestionIds ?? []) {
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId: sid,
        behaviorId: SMS_BEHAVIORS.INVESTIGATION,
        actorUserId: scope.userId,
        decision: 'accepted',
        entityType: 'incidents',
        entityId: incidentId,
      });
    }

    return {
      status: body.status ?? 'in_progress',
      rootCauseIds: body.rootCauseIds ?? [],
      rowVersion: body.rowVersion + 1,
    };
  }

  async investigationHelper(
    scope: SmsRequestScope,
    incidentId: string,
    body?: { descriptionOverride?: string },
  ) {
    await this.getInvestigationPackage(scope, incidentId);
    const input = {
      incidentId,
      companyId: scope.companyId,
      descriptionOverride: body?.descriptionOverride,
    };
    const result = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.INVESTIGATION,
      input,
      async () => {
        const narrative =
          body?.descriptionOverride ??
          `Incident ${incidentId} helper — factors only, no blame as fact.`;
        const redacted = this.anon.redactForLlm(narrative);
        return {
          behaviorId: SMS_BEHAVIORS.INVESTIGATION,
          headline: 'Investigation helper checklist',
          body: redacted.ok
            ? 'Review timeline, energy sources, control failures, and competency gaps.'
            : 'Deterministic checklist only (LLM redaction aborted).',
          confidence: redacted.ok ? 0.72 : 0.65,
          tone: SmsAiTone.caution,
          modelTier: SmsAiModelTier.D0,
          source: redacted.ok ? SmsAiSource.rules : SmsAiSource.fallback,
          pageContext: 'incidents',
          evidenceRefsJson: { incidentId, redactionOk: redacted.ok },
          payloadJson: {
            howTo: [
              'Establish timeline',
              'Map energy sources',
              'Verify controls at time of event',
            ],
            questions: [
              'What changed before the event?',
              'Were energy controls verified?',
            ],
            evidenceChecklist: [
              'Photos',
              'FLHA / JHA',
              'Training records',
              'Witness statements (ACL)',
            ],
          },
        };
      },
      'incidents',
    );
    const full = (result.insights[0]?.payloadJson ?? {}) as {
      howTo?: string[];
      questions?: string[];
      evidenceChecklist?: string[];
    };
    return {
      howTo: full.howTo ?? [],
      questions: full.questions ?? [],
      evidenceChecklist: full.evidenceChecklist ?? [],
      draftTimeline: null,
      suggestionId: result.insights[0]?.id,
      modelId: 'sms-d0-investigation-1.0',
    };
  }

  async suggestRootCauses(
    scope: SmsRequestScope,
    incidentId: string,
    body?: { findings?: unknown[]; pathway?: string },
  ) {
    await this.getInvestigationPackage(scope, incidentId);
    const taxonomy = [
      {
        label: 'Energy control gap',
        confidence: 0.88,
        taxonomyId: 'energy_control_gap',
        rationale: 'Control verification incomplete',
        contributingFactors: ['LOTO', 'verification'],
      },
      {
        label: 'Procedure deviation',
        confidence: 0.71,
        taxonomyId: 'procedure_deviation',
        rationale: 'Steps skipped in work pack',
        contributingFactors: ['procedure'],
      },
      {
        label: 'Competency / authorization gap',
        confidence: 0.64,
        taxonomyId: 'competency_gap',
        rationale: 'Auth gap correlated',
        contributingFactors: ['training'],
      },
    ].filter((t) => t.confidence >= 0.6);

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.ROOT_CAUSE,
      { incidentId, findings: body?.findings, pathway: body?.pathway },
      async () => ({
        behaviorId: SMS_BEHAVIORS.ROOT_CAUSE,
        headline: 'Suggested root-cause taxonomy links',
        body: 'Top matches from deterministic taxonomy linker.',
        confidence: taxonomy[0]?.confidence ?? 0.6,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.scorer,
        pageContext: 'incidents',
        payloadJson: { suggestedRootCauses: taxonomy },
      }),
      'incidents',
    );

    return {
      suggestedRootCauses: taxonomy,
      suggestionId: insight.insights[0]?.id,
    };
  }

  async getMetrics(scope: SmsRequestScope) {
    return this.prisma.smsIncidentMetric.findFirst({
      where: {
        companyId: scope.companyId,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        deletedAt: null,
      },
      orderBy: { periodEnd: 'desc' },
    });
  }

  private assertPackageRole(scope: SmsRequestScope, incidentId: string) {
    if (!PACKAGE_ROLES.includes(scope.role)) {
      void this.audit.log({
        scope,
        action: 'authz.deny',
        entityType: 'investigation_package',
        entityId: incidentId,
        payload: { reason: 'role' },
      });
      throw new SmsException('FORBIDDEN', 'Investigation package access denied');
    }
  }
}
