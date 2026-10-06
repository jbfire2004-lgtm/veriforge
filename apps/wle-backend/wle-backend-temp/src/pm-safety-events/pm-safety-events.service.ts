import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PmRcaMethod,
  PmSafetyEventSeverity,
  PmSafetyEventStatus,
  PmSafetyEventType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
import { PmSafetyEventsCailService } from './pm-safety-events-cail.service';
import { PmSafetyEventsIngestionService } from './pm-safety-events-ingestion.service';
import { PmSafetyEventsEquipmentService } from './pm-safety-events-equipment.service';
import { PmSafetyEventsLibraryService } from './pm-safety-events-library.service';
import { PmInvestigationCapaIntegrationService } from './pm-investigation-capa-integration.service';
import type { TaprootPathway } from './rca.engine';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';
import { evaluateDangerousOccurrences } from '../verisuite-sms/services/dangerous-occurrence.engine';

const eventInclude = {
  injuries: true,
  people: true,
  equipmentLinks: {
    include: { equipment: { select: { id: true, name: true } } },
  },
  witnesses: { include: { statements: true } },
  statements: true,
  attachments: true,
  rootCauses: true,
  contributingFactors: true,
  correctiveActions: true,
  investigation: true,
  createdBy: { select: { id: true, username: true } },
  company: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.PmSafetyEventInclude;

@Injectable()
export class PmSafetyEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classifier: EventClassificationEngine,
    private readonly riskEngine: SeverityRiskEngine,
    private readonly rca: RcaEngine,
    private readonly cail: PmSafetyEventsCailService,
    private readonly ingestion: PmSafetyEventsIngestionService,
    private readonly equipment: PmSafetyEventsEquipmentService,
    private readonly library: PmSafetyEventsLibraryService,
    private readonly capaIntegration: PmInvestigationCapaIntegrationService,
    private readonly auditLog: AuditLogService,
  ) {}

  private async audit(
    eventId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmSafetyEventAuditLog.create({
      data: {
        eventId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: PmSafetyEventStatus;
    eventType?: PmSafetyEventType;
  }) {
    return this.prisma.pmSafetyEvent.findMany({
      where: {
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.eventType ? { eventType: filters.eventType } : {}),
      },
      include: eventInclude,
      orderBy: { occurredAt: 'desc' },
      take: 100,
    });
  }

  async get(id: string) {
    const row = await this.prisma.pmSafetyEvent.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...eventInclude,
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!row) throw new NotFoundException('Event not found');
    return row;
  }

  async createDraft(input: {
    companyId: number;
    projectId: number;
    createdByUserId: number;
    eventType?: PmSafetyEventType;
    title: string;
    description?: string;
    siteId?: number;
    occurredAt?: Date;
    locationNote?: string;
    latitude?: number;
    longitude?: number;
    clientSyncId?: string;
    intakeWizardStep?: number;
    pmInspectionId?: string;
    severity?: PmSafetyEventSeverity;
    mandatoryInvestigation?: boolean;
    regionCode?: string;
  }) {
    await this.library.ensureLibraries(input.companyId);

    const classification = this.classifier.classifyType(
      input.description ?? input.title,
      input.eventType,
    );

    const risk = this.riskEngine.score({
      eventType: classification.eventType,
      description: input.description,
    });

    const heca = this.classifier.suggestHecaCategory(
      input.description ?? input.title,
    );

    const project = await this.prisma.project
      .findFirst({
        where: { id: input.projectId, companyId: input.companyId },
        include: { site: true, company: true },
      })
      .catch(() => null);

    const regionCode =
      input.regionCode ||
      project?.site?.region ||
      project?.company?.province ||
      'CA-AB';

    const dangerousOccurrence = evaluateDangerousOccurrences(
      [input.title, input.description, input.locationNote]
        .filter(Boolean)
        .join(' '),
      regionCode,
    );

    const event = await this.prisma.pmSafetyEvent.create({
      data: {
        companyId: input.companyId,
        projectId: input.projectId,
        siteId: input.siteId,
        createdByUserId: input.createdByUserId,
        eventType: classification.eventType,
        title: input.title,
        description: input.description,
        occurredAt: input.occurredAt ?? new Date(),
        locationNote: input.locationNote,
        latitude: input.latitude,
        longitude: input.longitude,
        clientSyncId: input.clientSyncId,
        intakeWizardStep: input.intakeWizardStep ?? 1,
        pmInspectionId: input.pmInspectionId,
        severity: input.severity ?? risk.severity,
        mandatoryInvestigation:
          input.mandatoryInvestigation ??
          (risk.requiresSupervisorReview || dangerousOccurrence.mustReportAny),
        likelihood: risk.likelihood,
        riskScore: risk.riskScore,
        requiresSupervisorReview:
          risk.requiresSupervisorReview ||
          dangerousOccurrence.supervisorReviewRequired,
        hecaCategoryCode: heca,
        status: 'draft',
        dangerousOccurrenceJson:
          dangerousOccurrence as unknown as Prisma.InputJsonValue,
      },
      include: eventInclude,
    });

    await this.audit(event.id, 'created', input.createdByUserId, {
      classification,
      risk,
      dangerousOccurrence: {
        flagged: dangerousOccurrence.flagged,
        codes: dangerousOccurrence.codes,
        mustReportAny: dangerousOccurrence.mustReportAny,
        framework: dangerousOccurrence.framework.frameworkLabel,
      },
    });
    await this.auditLog.logAudit(
      { id: input.createdByUserId, companyId: input.companyId },
      AuditAction.INCIDENT_CREATED,
      {
        type: AuditEntityType.PM_SAFETY_EVENT,
        id: event.id,
        tenantId: input.companyId,
      },
      {
        eventType: event.eventType,
        severity: event.severity,
        ohsReportingRequired: dangerousOccurrence.mustReportAny,
      },
    );
    return {
      ...event,
      dangerousOccurrence,
    };
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      eventType: PmSafetyEventType;
      siteId: number;
      locationNote: string;
      weatherJson: Record<string, unknown>;
      propertyDamageJson: Record<string, unknown>;
      environmentalImpactJson: Record<string, unknown>;
      intakeWizardStep: number;
      occurredAt: Date | string;
      severity: PmSafetyEventSeverity;
    }>,
    actorId?: number,
  ) {
    const existing = await this.get(id);
    if (existing.status === 'closed' || existing.status === 'locked') {
      throw new BadRequestException('Closed or locked events are not editable');
    }

    const description = data.description ?? existing.description ?? '';
    const eventType = data.eventType ?? existing.eventType;
    const classification = this.classifier.classifyType(description, eventType);
    const injuries = await this.prisma.pmSafetyEventInjury.findMany({
      where: { eventId: id },
    });
    const risk = this.riskEngine.score({
      eventType: classification.eventType,
      description,
      hasInjury: injuries.length > 0,
      medicalAid: injuries.some((i) => i.medicalAid),
      lostTime: injuries.some((i) => i.lostTime),
      equipmentFailure: existing.eventType === 'equipment_failure',
    });

    const project = await this.prisma.project
      .findFirst({
        where: { id: existing.projectId },
        include: { site: true, company: true },
      })
      .catch(() => null);
    const regionCode =
      project?.site?.region || project?.company?.province || 'CA-AB';
    const dangerousOccurrence = evaluateDangerousOccurrences(
      [
        data.title ?? existing.title,
        description,
        data.locationNote ?? existing.locationNote,
      ]
        .filter(Boolean)
        .join(' '),
      regionCode,
    );

    const occurredAt =
      data.occurredAt == null
        ? undefined
        : data.occurredAt instanceof Date
          ? data.occurredAt
          : new Date(data.occurredAt);

    const updated = await this.prisma.pmSafetyEvent.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.eventType ? { eventType: data.eventType } : {}),
        ...(data.siteId !== undefined ? { siteId: data.siteId } : {}),
        ...(data.locationNote !== undefined
          ? { locationNote: data.locationNote }
          : {}),
        ...(data.weatherJson
          ? { weatherJson: data.weatherJson as Prisma.InputJsonValue }
          : {}),
        ...(data.propertyDamageJson
          ? {
              propertyDamageJson:
                data.propertyDamageJson as Prisma.InputJsonValue,
            }
          : {}),
        ...(data.environmentalImpactJson
          ? {
              environmentalImpactJson:
                data.environmentalImpactJson as Prisma.InputJsonValue,
            }
          : {}),
        ...(data.intakeWizardStep !== undefined
          ? { intakeWizardStep: data.intakeWizardStep }
          : {}),
        ...(occurredAt && !Number.isNaN(occurredAt.getTime())
          ? { occurredAt }
          : {}),
        eventType: classification.eventType,
        severity: data.severity ?? risk.severity,
        likelihood: risk.likelihood,
        riskScore: risk.riskScore,
        requiresSupervisorReview:
          risk.requiresSupervisorReview ||
          dangerousOccurrence.supervisorReviewRequired,
        mandatoryInvestigation:
          existing.mandatoryInvestigation || dangerousOccurrence.mustReportAny,
        hecaCategoryCode: this.classifier.suggestHecaCategory(description),
        dangerousOccurrenceJson:
          dangerousOccurrence as unknown as Prisma.InputJsonValue,
      },
      include: eventInclude,
    });

    await this.snapshotVersion(id, actorId);
    return { ...updated, dangerousOccurrence };
  }

  private async snapshotVersion(eventId: string, authorId?: number) {
    const event = await this.get(eventId);
    const last = await this.prisma.pmSafetyEventVersion.findFirst({
      where: { eventId },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version ?? 0) + 1;
    await this.prisma.pmSafetyEventVersion.create({
      data: {
        eventId,
        version,
        authorId,
        snapshot: event as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async addInjury(
    eventId: string,
    data: {
      workerId?: number;
      bodyPart?: string;
      injuryType?: string;
      treatment?: string;
      firstAid?: boolean;
      medicalAid?: boolean;
      lostTime?: boolean;
      modifiedWork?: boolean;
      returnToWorkPlan?: string;
      wcbClaimNumber?: string;
      wcbStatus?: string;
      notes?: string;
    },
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventInjury.create({
      data: { eventId, ...data },
    });
  }

  async addPerson(
    eventId: string,
    data: {
      workerId?: number;
      role: string;
      name?: string;
      companyId?: number;
      notes?: string;
    },
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventPerson.create({
      data: { eventId, ...data },
    });
  }

  async linkEquipment(
    eventId: string,
    equipmentId: number,
    failureNotes?: string,
    conditionScore?: number,
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventEquipment.upsert({
      where: { eventId_equipmentId: { eventId, equipmentId } },
      create: { eventId, equipmentId, failureNotes, conditionScore },
      update: { failureNotes, conditionScore },
    });
  }

  async addWitness(
    eventId: string,
    data: { name: string; contact?: string; workerId?: number },
    capturedByUserId?: number,
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventWitness.create({
      data: { eventId, ...data, capturedByUserId },
    });
  }

  async addStatement(
    eventId: string,
    data: {
      witnessId?: string;
      statementText: string;
      signatureData?: string;
      clientSyncId?: string;
    },
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventStatement.create({
      data: {
        eventId,
        witnessId: data.witnessId,
        statementText: data.statementText,
        signatureData: data.signatureData,
        signedAt: data.signatureData ? new Date() : undefined,
        clientSyncId: data.clientSyncId,
      },
    });
  }

  async addAttachment(
    eventId: string,
    data: {
      injuryId?: string;
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      coreFileId?: number;
      clientSyncId?: string;
    },
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventAttachment.create({
      data: { eventId, ...data },
    });
  }

  async addContributingFactor(
    eventId: string,
    data: {
      label: string;
      libraryCode?: string;
      category?: string;
      notes?: string;
    },
  ) {
    await this.get(eventId);
    return this.prisma.pmSafetyEventContributingFactor.create({
      data: { eventId, ...data },
    });
  }

  async addRootCause(
    eventId: string,
    data: {
      method?: PmRcaMethod;
      description: string;
      category?: string;
      libraryCode?: string;
      whyChain?: string[];
      fishboneJson?: Record<string, unknown>;
      taprootJson?: Record<string, unknown>;
      pathway?: TaprootPathway;
      responsibleParty?: 'contractor' | 'supervisor' | 'company' | 'worker';
      dispatchContractor?: boolean;
    },
    actorId?: number,
  ) {
    const event = await this.get(eventId);
    const method = data.method ?? (data.pathway ? 'taproot' : 'five_why');
    const pathway =
      data.pathway ?? (data.category as TaprootPathway | undefined);

    const whyChain =
      data.whyChain ??
      (method === 'five_why'
        ? this.rca.buildFiveWhyChain(
            event.description ?? event.title,
            data.description,
          )
        : []);

    const taprootJson =
      method === 'taproot' && pathway
        ? this.capaIntegration.buildTaprootJson(
            pathway,
            data.description,
            event.contributingFactors.map((f) => f.label),
          )
        : data.taprootJson ?? {};

    const rootCause = await this.prisma.pmSafetyEventRootCause.create({
      data: {
        eventId,
        method,
        description: data.description,
        category: data.category ?? pathway,
        libraryCode: data.libraryCode,
        whyChain: whyChain as Prisma.InputJsonValue,
        fishboneJson: (data.fishboneJson ?? {}) as Prisma.InputJsonValue,
        taprootJson: taprootJson as Prisma.InputJsonValue,
      },
    });

    if (actorId) {
      await this.capaIntegration.createFromRootCause({
        eventId,
        rootCauseId: rootCause.id,
        description: data.description,
        pathway,
        responsibleParty:
          data.responsibleParty ??
          (pathway === 'equipment_failure' ? 'contractor' : 'supervisor'),
        actorId,
        linkToInspection:
          data.dispatchContractor ?? pathway === 'equipment_failure',
      });
    } else {
      await this.generateCorrectiveForRootCause(
        event,
        rootCause.id,
        data.description,
        actorId,
      );
    }

    await this.auditLog.logAudit(
      { id: actorId ?? null, companyId: event.companyId },
      AuditAction.INCIDENT_RCA_ADDED,
      {
        type: AuditEntityType.PM_SAFETY_EVENT,
        id: eventId,
        tenantId: event.companyId,
      },
      { rootCauseId: rootCause.id, method },
    );

    return rootCause;
  }

  async suggestRootCauses(eventId: string) {
    const event = await this.get(eventId);
    const lib = await this.library.rootCauses(event.companyId);
    const factors = event.contributingFactors.map((f) => f.label);
    const historical = await this.prisma.pmSafetyEventRootCause.findMany({
      where: { event: { companyId: event.companyId } },
      select: { libraryCode: true },
      take: 50,
    });
    return this.rca.suggestRootCauses({
      description: event.description ?? event.title,
      eventType: event.eventType,
      contributingFactors: factors,
      guidedAnswers: (event.investigation?.guidedAnswersJson ?? {}) as Record<
        string,
        string
      >,
      library: lib,
      historicalCodes: historical
        .map((h) => h.libraryCode)
        .filter((c): c is string => !!c),
    });
  }

  private async generateCorrectiveForRootCause(
    event: Prisma.PmSafetyEventGetPayload<{ include: typeof eventInclude }>,
    rootCauseId: string,
    description: string,
    actorId?: number,
  ) {
    const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const capa = await this.prisma.pmSafetyEventCorrectiveAction.create({
      data: {
        eventId: event.id,
        rootCauseId,
        title: `CAPA: ${description.slice(0, 80)}`,
        description,
        dueAt,
        status: 'open',
      },
    });

    const entry = await this.cail.emitFromEvent({
      projectId: event.projectId,
      ownerCompanyId: event.companyId,
      eventId: event.id,
      sourceItemId: capa.id,
      title: capa.title,
      description,
      severity: event.severity,
      createdByUserId: actorId,
      siteId: event.siteId ?? undefined,
      dueDate: dueAt,
    });

    await this.prisma.pmSafetyEventCorrectiveAction.update({
      where: { id: capa.id },
      data: { cailEntryId: entry.id },
    });
  }

  async addTimelineEntry(
    eventId: string,
    data: { timestamp?: Date; description: string; actorId?: number },
  ) {
    await this.get(eventId);
    await this.audit(eventId, 'timeline', data.actorId, {
      timestamp: (data.timestamp ?? new Date()).toISOString(),
      description: data.description,
    });
    return { eventId, ...data, timestamp: data.timestamp ?? new Date() };
  }

  async listTimeline(eventId: string) {
    const logs = await this.prisma.pmSafetyEventAuditLog.findMany({
      where: { eventId, eventType: 'timeline' },
      orderBy: { createdAt: 'asc' },
      include: { actor: { select: { id: true, username: true } } },
    });
    return logs.map((l) => {
      const p = (l.payload ?? {}) as Record<string, unknown>;
      return {
        id: l.id,
        incidentId: eventId,
        timestamp: p.timestamp ?? l.createdAt.toISOString(),
        description: p.description ?? '',
        actorId: l.actorId,
        actorName: l.actor?.username,
      };
    });
  }

  async close(id: string, actorId: number) {
    const event = await this.get(id);
    if (!['approved', 'locked', 'submitted'].includes(event.status)) {
      throw new BadRequestException(
        'Event must be approved or submitted before closeout',
      );
    }

    const openCapa = event.correctiveActions.filter(
      (c) => c.status !== 'closed' && c.status !== 'verified',
    );
    const unassigned = openCapa.filter((c) => !c.assignedUserId);
    if (unassigned.length > 0) {
      throw new BadRequestException(
        'All open corrective actions must be assigned before close',
      );
    }

    if (['medium', 'high', 'critical'].includes(event.severity)) {
      if (event.rootCauses.length === 0) {
        throw new BadRequestException(
          'RCA required for medium+ severity before close',
        );
      }
    }

    await this.prisma.pmSafetyEvent.update({
      where: { id },
      data: { status: 'closed', closedAt: new Date() },
    });
    await this.audit(id, 'closed', actorId);
    await this.auditLog.logAudit(
      { id: actorId, companyId: event.companyId },
      AuditAction.INCIDENT_STATUS_CHANGED,
      {
        type: AuditEntityType.PM_SAFETY_EVENT,
        id,
        tenantId: event.companyId,
      },
      { from: event.status, to: 'closed' },
    );
    return this.get(id);
  }

  async submit(id: string, actorId: number) {
    const event = await this.get(id);
    if (event.status !== 'draft') {
      throw new BadRequestException('Only draft events can be submitted');
    }

    if (['medium', 'high', 'critical'].includes(event.severity)) {
      if (event.rootCauses.length === 0) {
        throw new BadRequestException(
          'Root cause analysis required for medium or higher severity',
        );
      }
    }

    const status: PmSafetyEventStatus = event.requiresSupervisorReview
      ? 'review_required'
      : 'submitted';

    await this.prisma.pmSafetyEvent.update({
      where: { id },
      data: { status, submittedAt: new Date() },
    });

    await this.cail.emitFromEvent({
      projectId: event.projectId,
      ownerCompanyId: event.companyId,
      eventId: id,
      sourceItemId: 'submit',
      title: `Event reported: ${event.title}`,
      description: event.description ?? undefined,
      severity: event.severity,
      createdByUserId: actorId,
      siteId: event.siteId ?? undefined,
    });

    await this.ingestion.ingestToSifHeca(id, actorId);
    await this.equipment.applyLockoutsForEvent(id, actorId);

    if (
      event.severity === 'high' ||
      event.severity === 'critical' ||
      event.injuries.some((i) => i.medicalAid || i.lostTime)
    ) {
      await this.prisma.pmSafetyEventCorrectiveAction.create({
        data: {
          eventId: id,
          title: 'Immediate supervisor review and site control verification',
          description:
            'Auto-generated for high-severity or medical/lost-time event',
          status: 'open',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    await this.audit(id, 'submitted', actorId);
    await this.auditLog.logAudit(
      { id: actorId, companyId: event.companyId },
      AuditAction.INCIDENT_STATUS_CHANGED,
      {
        type: AuditEntityType.PM_SAFETY_EVENT,
        id,
        tenantId: event.companyId,
      },
      { from: 'draft', to: status },
    );
    return this.get(id);
  }

  async review(
    id: string,
    action: 'approve' | 'reject' | 'request_changes',
    actorId: number,
    notes?: string,
  ) {
    const event = await this.get(id);
    if (event.status !== 'review_required' && event.status !== 'submitted') {
      throw new BadRequestException('Event not in review state');
    }

    let status: PmSafetyEventStatus;
    if (action === 'approve') status = 'approved';
    else if (action === 'reject') status = 'rejected';
    else status = 'draft';

    await this.prisma.pmSafetyEvent.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'locked' : status,
        reviewNotes: notes,
        reviewedByUserId: actorId,
        reviewedAt: new Date(),
        ...(action === 'approve' ? { closedAt: new Date() } : {}),
      },
    });

    await this.audit(id, `review_${action}`, actorId, { notes });
    await this.auditLog.logAudit(
      { id: actorId, companyId: event.companyId },
      AuditAction.INCIDENT_STATUS_CHANGED,
      {
        type: AuditEntityType.PM_SAFETY_EVENT,
        id,
        tenantId: event.companyId,
      },
      {
        from: event.status,
        to: action === 'approve' ? 'locked' : status,
        action,
      },
    );
    return this.get(id);
  }

  async workerAccessCheck(workerId: number, projectId: number) {
    const criticalInvolvement = await this.prisma.pmSafetyEventPerson.count({
      where: {
        workerId,
        event: {
          projectId,
          deletedAt: null,
          severity: 'critical',
          status: { notIn: ['closed', 'approved', 'locked'] },
        },
      },
    });

    const openCapa = await this.prisma.pmSafetyEventCorrectiveAction.count({
      where: {
        status: 'open',
        event: {
          projectId,
          people: { some: { workerId } },
        },
      },
    });

    const allowed = criticalInvolvement === 0 && openCapa === 0;
    return {
      allowed,
      criticalEventsWithoutClearance: criticalInvolvement,
      openCorrectiveActions: openCapa,
    };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    companyId: number;
    projectId: number;
    createdByUserId: number;
    title: string;
    description?: string;
    eventType?: PmSafetyEventType;
    siteId?: number;
    answers?: Record<string, unknown>;
    injuries?: Array<Record<string, unknown>>;
    equipmentIds?: number[];
    submitted?: boolean;
  }) {
    const existing = await this.prisma.pmSafetyEvent.findUnique({
      where: { clientSyncId: payload.clientSyncId },
    });
    if (existing) {
      if (payload.submitted && existing.status === 'draft') {
        return this.submit(existing.id, payload.createdByUserId);
      }
      return this.get(existing.id);
    }

    const created = await this.createDraft({
      companyId: payload.companyId,
      projectId: payload.projectId,
      createdByUserId: payload.createdByUserId,
      title: payload.title,
      description: payload.description,
      eventType: payload.eventType,
      siteId: payload.siteId,
      clientSyncId: payload.clientSyncId,
      intakeWizardStep: 5,
    });

    if (payload.injuries) {
      for (const inj of payload.injuries) {
        await this.addInjury(created.id, inj as never);
      }
    }
    if (payload.equipmentIds) {
      for (const eqId of payload.equipmentIds) {
        await this.linkEquipment(created.id, eqId);
      }
    }

    if (payload.submitted) {
      return this.submit(created.id, payload.createdByUserId);
    }
    return this.get(created.id);
  }
}
