import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmDeficiencySeverity,
  PmInspectionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { replayOrConflict } from '../common/prisma-errors';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { InspectionTemplateEngine } from './inspection-template.engine';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import { PmInspectionsCailService } from './pm-inspections-cail.service';
import { PmInspectionsEquipmentService } from './pm-inspections-equipment.service';
import { PmInspectionsIngestionService } from './pm-inspections-ingestion.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmInspectionIncidentService } from './pm-inspection-incident.service';
import { PmInspectionMeetingService } from './pm-inspection-meeting.service';
import { PmInspectionCompletedEventService } from './pm-inspection-completed-event.service';
import type { ChecklistItemDef } from './pm-inspections.constants';
import {
  assertAllRequiredSignaturesPresent,
  assertEditableInspectionStatus,
  assertSignaturePayload,
  parseRequiredSignatures,
} from './pm-inspection-signature.util';
import { pruneHiddenChecklistAnswers } from './inspection-show-if';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';
import {
  isPhotoFirstTemplate,
  isSmartSiteTemplate,
  skipChecklistValidation,
} from './pm-inspection-kind.util';
import {
  parseInspectionSharing,
  type InspectionSharingConfig,
} from './pm-inspection-sharing.types';

const inspectionInclude = {
  template: true,
  deficiencies: true,
  signatures: {
    orderBy: { signedAt: 'asc' as const },
    include: {
      coreFile: { select: { id: true, publicUrl: true, mimeType: true } },
    },
  },
  attachments: true,
  correctiveActions: true,
  inspector: { select: { id: true, username: true, email: true } },
  equipment: { select: { id: true, name: true, catalogTypeKey: true } },
  worker: { select: { id: true, firstName: true, lastName: true } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.PmInspectionInclude;

@Injectable()
export class PmInspectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: PmInspectionTemplatesService,
    private readonly templateEngine: InspectionTemplateEngine,
    private readonly scoring: InspectionScoringEngine,
    private readonly deficiencyScoring: DeficiencyScoringEngine,
    private readonly cail: PmInspectionsCailService,
    private readonly equipment: PmInspectionsEquipmentService,
    private readonly ingestion: PmInspectionsIngestionService,
    private readonly inspectionIncidents: PmInspectionIncidentService,
    private readonly inspectionMeetings: PmInspectionMeetingService,
    private readonly completedEvents: PmInspectionCompletedEventService,
    private readonly auditLog: AuditLogService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
  ) {}

  private async audit(
    inspectionId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmInspectionAuditLog.create({
      data: {
        inspectionId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: PmInspectionStatus;
    equipmentId?: number;
  }) {
    return this.prisma.pmInspection.findMany({
      where: {
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.equipmentId ? { equipmentId: filters.equipmentId } : {}),
      },
      include: inspectionInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async get(id: string) {
    const row = await this.prisma.pmInspection.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...inspectionInclude,
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!row) throw new NotFoundException('Inspection not found');
    return row;
  }

  async createFromTemplate(input: {
    templateId: string;
    companyId: number;
    projectId: number;
    inspectorUserId: number;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    title?: string;
    locationNote?: string;
    clientSyncId?: string;
  }) {
    if (input.clientSyncId) {
      const existing = await this.prisma.pmInspection.findUnique({
        where: { clientSyncId: input.clientSyncId },
        include: inspectionInclude,
      });
      if (existing) {
        if (existing.companyId !== input.companyId) {
          throw new ForbiddenException('Cross-tenant inspection sync denied');
        }
        return existing;
      }
    }

    const template = await this.templates.get(input.templateId);
    if (template.status !== 'published') {
      throw new BadRequestException('Template must be published');
    }

    let inspection;
    try {
      inspection = await this.prisma.pmInspection.create({
        data: {
          templateId: template.id,
          templateVersion: template.version,
          companyId: input.companyId,
          projectId: input.projectId,
          siteId: input.siteId,
          equipmentId: input.equipmentId,
          workerId: input.workerId,
          inspectorUserId: input.inspectorUserId,
          title: input.title ?? template.name,
          locationNote: input.locationNote,
          status: isPhotoFirstTemplate(template) ? 'in_progress' : 'draft',
          clientSyncId: input.clientSyncId,
        },
        include: inspectionInclude,
      });
    } catch (err) {
      inspection = await replayOrConflict(err, async () => {
        if (!input.clientSyncId) return null;
        return this.prisma.pmInspection.findUnique({
          where: { clientSyncId: input.clientSyncId },
          include: inspectionInclude,
        });
      });
      return inspection;
    }

    await this.audit(inspection.id, 'created', input.inspectorUserId, {
      templateId: template.id,
    });
    await this.auditLog.logAudit(
      { id: input.inspectorUserId, companyId: input.companyId },
      AuditAction.INSPECTION_CREATED,
      {
        type: AuditEntityType.PM_INSPECTION,
        id: inspection.id,
        tenantId: input.companyId,
      },
      { templateId: template.id, projectId: input.projectId },
    );
    return inspection;
  }

  async saveAnswers(
    id: string,
    answers: Record<string, unknown>,
    actorId?: number,
  ) {
    const inspection = await this.get(id);
    if (!['draft', 'in_progress'].includes(inspection.status)) {
      throw new BadRequestException('Inspection is not editable');
    }

    const items = inspection.template.items as ChecklistItemDef[];
    const pruned = pruneHiddenChecklistAnswers(items, answers);
    if (!skipChecklistValidation(inspection.template)) {
      const errors = this.templateEngine.validateRequired(items, pruned);
      if (errors.length) {
        throw new BadRequestException(errors.join('; '));
      }
    }

    return this.prisma.pmInspection.update({
      where: { id },
      data: {
        answers: pruned as Prisma.InputJsonValue,
        status: 'in_progress',
      },
      include: inspectionInclude,
    });
  }

  async addSignature(
    inspectionId: string,
    data: {
      role: string;
      signatureData?: string;
      coreFileId?: number;
      signerName?: string;
      signerUserId?: number;
      clientSyncId?: string;
    },
  ) {
    const inspection = await this.get(inspectionId);
    assertEditableInspectionStatus(inspection.status);

    const required = parseRequiredSignatures(
      inspection.template.requiredSignatures,
    );
    const payload = assertSignaturePayload(data, required);

    const duplicate = await this.prisma.pmInspectionSignature.findFirst({
      where: { inspectionId, role: payload.role },
    });
    if (duplicate) {
      throw new BadRequestException(
        `Signature already recorded: ${payload.role}`,
      );
    }

    if (payload.coreFileId) {
      const file = await this.prisma.coreFile.findUnique({
        where: { id: payload.coreFileId },
      });
      if (!file || file.status !== 'COMPLETED') {
        throw new BadRequestException('Signature upload file not found');
      }
    }

    const created = await this.prisma.pmInspectionSignature.create({
      data: {
        inspectionId,
        role: payload.role,
        signatureData: payload.signatureData,
        coreFileId: payload.coreFileId,
        signerName: data.signerName,
        signerUserId: data.signerUserId,
        clientSyncId: data.clientSyncId,
      },
      include: {
        coreFile: { select: { id: true, publicUrl: true, mimeType: true } },
      },
    });

    await this.audit(inspectionId, 'signature_added', data.signerUserId, {
      role: payload.role,
      coreFileId: payload.coreFileId ?? null,
    });

    return created;
  }

  async addAttachment(
    inspectionId: string,
    data: {
      deficiencyId?: string;
      correctiveId?: string;
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      coreFileId?: number;
      annotationJson?: Record<string, unknown>;
      clientSyncId?: string;
    },
  ) {
    await this.get(inspectionId);
    return this.prisma.pmInspectionAttachment.create({
      data: {
        inspectionId,
        ...data,
        annotationJson: data.annotationJson as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  }

  async submit(id: string, actorId: number) {
    const inspection = await this.get(id);
    if (
      inspection.submittedAt ||
      !['draft', 'in_progress'].includes(inspection.status)
    ) {
      throw new BadRequestException('Inspection already submitted');
    }

    const items = inspection.template.items as ChecklistItemDef[];
    const answers = inspection.answers as Record<string, unknown>;
    const scoringRules = inspection.template.scoringRules as Record<
      string,
      unknown
    >;

    const reqSigs = parseRequiredSignatures(
      inspection.template.requiredSignatures,
    );
    const sigs = await this.prisma.pmInspectionSignature.findMany({
      where: { inspectionId: id },
    });
    assertAllRequiredSignaturesPresent(reqSigs, sigs);

    const score = this.scoring.score(
      inspection.template.scoringMode,
      items,
      answers,
      scoringRules,
    );

    if (isPhotoFirstTemplate(inspection.template)) {
      const attachments = await this.prisma.pmInspectionAttachment.findMany({
        where: { inspectionId: id },
        select: { annotationJson: true, mimeType: true, dataUrl: true },
      });
      const photos = attachments.filter(
        (a) => a.dataUrl || a.mimeType?.startsWith('image/'),
      );
      const atRiskCount = photos.filter((a) => {
        const ann = a.annotationJson as { safetyStatus?: string } | null;
        return ann?.safetyStatus === 'at_risk';
      }).length;

      score.passed = atRiskCount === 0;
      score.riskScore = Math.min(
        100,
        atRiskCount * 20 + (100 - score.scorePercent),
      );
      score.requiresSupervisorReview =
        atRiskCount > 0 || score.requiresSupervisorReview;
      if (isSmartSiteTemplate(inspection.template)) {
        score.scorePercent =
          atRiskCount === 0 ? 100 : Math.max(0, 100 - atRiskCount * 15);
      }
    }

    const status: PmInspectionStatus = score.requiresSupervisorReview
      ? 'review_required'
      : 'submitted';

    const updated = await this.prisma.pmInspection.update({
      where: { id },
      data: {
        scorePercent: score.scorePercent,
        passed: score.passed,
        riskScore: score.riskScore,
        requiresSupervisorReview: score.requiresSupervisorReview,
        status,
        submittedAt: new Date(),
      },
      include: inspectionInclude,
    });

    await this.createDeficienciesFromFailedItems(
      updated,
      items,
      score.failedItemIds,
      actorId,
    );

    if (updated.equipmentId) {
      await this.equipment.applyLockoutIfNeeded(id, actorId);
    }

    await this.audit(id, 'submitted', actorId, {
      score,
    });
    await this.auditLog.logAudit(
      { id: actorId, companyId: updated.companyId },
      AuditAction.INSPECTION_SUBMITTED,
      {
        type: AuditEntityType.PM_INSPECTION,
        id,
        tenantId: updated.companyId,
      },
      {
        scorePercent: score.scorePercent,
        passed: score.passed,
        status,
      },
    );

    await this.completedEvents.emitOnceOnSubmit({
      inspectionId: id,
      companyId: updated.companyId,
      projectId: updated.projectId,
      actorId,
      score,
      signatures: sigs,
      checklistItems: items,
    });

    await this.processPostSubmitAutomations(id, actorId);

    return this.get(id);
  }

  /** Auto-draft PM incident on critical findings; auto-draft safety meeting on failed inspection. */
  private async processPostSubmitAutomations(
    inspectionId: string,
    actorId: number,
  ) {
    try {
      const incident =
        await this.inspectionIncidents.createDraftIfCriticalOnSubmit(
          inspectionId,
          actorId,
        );
      if (incident && !incident.existing) {
        await this.audit(inspectionId, 'auto_escalated_to_incident', actorId, {
          eventId: incident.eventId,
        });
        const insp = await this.prisma.pmInspection.findUnique({
          where: { id: inspectionId },
          select: { companyId: true },
        });
        await this.auditLog.logAudit(
          { id: actorId, companyId: insp?.companyId ?? null },
          AuditAction.INSPECTION_AUTO_INCIDENT,
          {
            type: AuditEntityType.PM_INSPECTION,
            id: inspectionId,
            tenantId: insp?.companyId,
          },
          { eventId: incident.eventId, auto: true },
        );
      }
    } catch {
      /* safety-events unavailable or duplicate race */
    }

    try {
      const meeting = await this.inspectionMeetings.createDraftIfFailedOnSubmit(
        inspectionId,
        actorId,
      );
      if (meeting && !meeting.existing) {
        await this.audit(inspectionId, 'auto_safety_meeting', actorId, {
          meetingId: meeting.meetingId,
        });
        const insp = await this.prisma.pmInspection.findUnique({
          where: { id: inspectionId },
          select: { companyId: true },
        });
        await this.auditLog.logAudit(
          { id: actorId, companyId: insp?.companyId ?? null },
          AuditAction.INSPECTION_AUTO_MEETING,
          {
            type: AuditEntityType.PM_INSPECTION,
            id: inspectionId,
            tenantId: insp?.companyId,
          },
          { meetingId: meeting.meetingId, auto: true },
        );
      }
    } catch {
      /* safety-meetings unavailable or duplicate race */
    }
  }

  private async createDeficienciesFromFailedItems(
    inspection: Prisma.PmInspectionGetPayload<{
      include: typeof inspectionInclude;
    }>,
    items: ChecklistItemDef[],
    failedItemIds: string[],
    actorId: number,
  ) {
    for (const itemId of failedItemIds) {
      const item = items.find((i) => i.id === itemId);
      if (!item) continue;

      const severity = this.deficiencyScoring.severityForFailedItem(
        item,
        inspection.template.category,
      );
      const dueAt = this.deficiencyScoring.dueDateFor(severity);

      const deficiency = await this.prisma.pmInspectionDeficiency.create({
        data: {
          inspectionId: inspection.id,
          itemId,
          title: `Failed: ${item.label}`,
          description:
            String(
              (inspection.answers as Record<string, unknown>)[
                `${itemId}_notes`
              ] ?? '',
            ) || undefined,
          severity,
          category: inspection.template.category,
          dueAt,
          autoGenerated: true,
        },
      });

      if (this.capaAuto) {
        await this.capaAuto.fromInspectionDeficiency(deficiency.id, actorId);
      } else {
        const cailEntry = await this.cail.emitFromDeficiency({
          projectId: inspection.projectId,
          ownerCompanyId: inspection.companyId,
          inspectionId: inspection.id,
          deficiencyId: deficiency.id,
          title: deficiency.title,
          description: deficiency.description ?? undefined,
          severity,
          createdByUserId: actorId,
          siteId: inspection.siteId ?? undefined,
          equipmentId: inspection.equipmentId ?? undefined,
          workerId: inspection.workerId ?? undefined,
          dueDate: dueAt,
        });
        await this.prisma.pmInspectionDeficiency.update({
          where: { id: deficiency.id },
          data: { cailEntryId: cailEntry.id },
        });
      }

      if (PmInspectionsEquipmentService.severityRequiresLockout(severity)) {
        await this.equipment.applyLockoutIfNeeded(inspection.id, actorId);
      }

      await this.ingestion.ingestDeficiencyToSif(deficiency.id, actorId);
    }
  }

  async review(
    id: string,
    action: 'approve' | 'reject' | 'request_changes',
    actorId: number,
    notes?: string,
  ) {
    const inspection = await this.get(id);
    if (
      inspection.status !== 'review_required' &&
      inspection.status !== 'submitted'
    ) {
      throw new BadRequestException('Inspection not in review state');
    }

    let status: PmInspectionStatus;
    if (action === 'approve') status = 'approved';
    else if (action === 'reject') status = 'rejected';
    else status = 'in_progress';

    await this.prisma.pmInspection.update({
      where: { id },
      data: {
        status,
        reviewNotes: notes,
        reviewedByUserId: actorId,
        reviewedAt: new Date(),
        ...(action === 'approve' ? { closedAt: new Date() } : {}),
      },
    });

    await this.audit(id, `review_${action}`, actorId, { notes });
    return this.get(id);
  }

  async createManualDeficiency(
    inspectionId: string,
    data: {
      itemId: string;
      title: string;
      description?: string;
      severity?: PmDeficiencySeverity;
      assignedUserId?: number;
      assignedWorkerId?: number;
      subcontractorCompanyId?: number;
    },
    actorId?: number,
  ) {
    const inspection = await this.get(inspectionId);
    const severity = data.severity ?? 'medium';
    const deficiency = await this.prisma.pmInspectionDeficiency.create({
      data: {
        inspectionId,
        itemId: data.itemId,
        title: data.title,
        description: data.description,
        severity,
        category: inspection.template.category,
        status:
          data.assignedUserId || data.assignedWorkerId ? 'assigned' : 'open',
        assignedUserId: data.assignedUserId,
        assignedWorkerId: data.assignedWorkerId,
        subcontractorCompanyId: data.subcontractorCompanyId,
        dueAt: this.deficiencyScoring.dueDateFor(severity),
        autoGenerated: false,
      },
    });

    const cailEntry = await this.cail.emitFromDeficiency({
      projectId: inspection.projectId,
      ownerCompanyId: inspection.companyId,
      inspectionId,
      deficiencyId: deficiency.id,
      title: data.title,
      description: data.description,
      severity,
      createdByUserId: actorId,
      siteId: inspection.siteId ?? undefined,
      equipmentId: inspection.equipmentId ?? undefined,
      assignedUserId: data.assignedUserId,
      dueDate: deficiency.dueAt ?? undefined,
    });

    await this.prisma.pmInspectionDeficiency.update({
      where: { id: deficiency.id },
      data: { cailEntryId: cailEntry.id },
    });

    if (actorId) {
      await this.ingestion.ingestDeficiencyToSif(deficiency.id, actorId);
    }
    return deficiency;
  }

  async verifyDeficiency(deficiencyId: string, actorId: number) {
    const def = await this.prisma.pmInspectionDeficiency.findUnique({
      where: { id: deficiencyId },
    });
    if (!def) throw new NotFoundException('Deficiency not found');

    return this.prisma.pmInspectionDeficiency.update({
      where: { id: deficiencyId },
      data: {
        status: 'closed',
        verifiedAt: new Date(),
        closedAt: new Date(),
      },
    });
  }

  async analytics(projectId: number) {
    const since90 = new Date(Date.now() - 90 * 86400000);
    const [total, failed, openDef, byCategory, recent90, closed90] =
      await Promise.all([
        this.prisma.pmInspection.count({
          where: { projectId, deletedAt: null },
        }),
        this.prisma.pmInspection.count({
          where: { projectId, deletedAt: null, passed: false },
        }),
        this.prisma.pmInspectionDeficiency.count({
          where: {
            inspection: { projectId, deletedAt: null },
            status: { not: 'closed' },
          },
        }),
        this.prisma.pmInspectionDeficiency.groupBy({
          by: ['severity'],
          where: { inspection: { projectId, deletedAt: null } },
          _count: true,
        }),
        this.prisma.pmInspection.count({
          where: { projectId, deletedAt: null, createdAt: { gte: since90 } },
        }),
        this.prisma.pmInspectionDeficiency.count({
          where: {
            inspection: { projectId, deletedAt: null },
            closedAt: { gte: since90 },
          },
        }),
      ]);

    const templateDist = await this.prisma.pmInspection.groupBy({
      by: ['templateId'],
      where: { projectId, deletedAt: null },
      _count: true,
    });

    const inspectorDist = await this.prisma.pmInspection.groupBy({
      by: ['inspectorUserId'],
      where: { projectId, deletedAt: null },
      _count: true,
    });

    return {
      totalInspections: total,
      failedInspections: failed,
      openDeficiencies: openDef,
      deficiencyBySeverity: byCategory,
      inspectionsByTemplate: templateDist,
      passRate: total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
      trends: {
        inspections90d: recent90,
        deficienciesClosed90d: closed90,
        deficiencyRate90d:
          recent90 > 0
            ? Math.round((openDef / Math.max(1, openDef + closed90)) * 100)
            : 0,
      },
      complianceScore:
        total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
      inspectorCount: inspectorDist.length,
    };
  }

  async workerAccessCheck(workerId: number, projectId: number) {
    const critical = await this.prisma.pmInspectionDeficiency.count({
      where: {
        status: { not: 'closed' },
        severity: 'critical',
        inspection: { projectId, workerId },
      },
    });

    const assignedEquipment = await this.prisma.equipmentAssignment.findMany({
      where: { workerId, endedAt: null, equipmentId: { not: null } },
      select: { equipmentId: true },
    });
    const equipmentIds = assignedEquipment
      .map((a) => a.equipmentId)
      .filter((id): id is number => id != null);

    const overdueEquipment =
      equipmentIds.length > 0
        ? await this.prisma.equipment.count({
            where: {
              id: { in: equipmentIds },
              nextInspectionAt: { lt: new Date() },
            },
          })
        : 0;

    const openCriticalOnEquipment =
      equipmentIds.length > 0
        ? await this.prisma.pmInspectionDeficiency.count({
            where: {
              status: { not: 'closed' },
              severity: 'critical',
              inspection: { projectId, equipmentId: { in: equipmentIds } },
            },
          })
        : 0;

    const allowed =
      critical === 0 && openCriticalOnEquipment === 0 && overdueEquipment === 0;
    return {
      allowed,
      openCriticalDeficiencies: critical + openCriticalOnEquipment,
      overdueEquipmentCount: overdueEquipment,
    };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    templateId: string;
    companyId: number;
    projectId: number;
    inspectorUserId: number;
    answers: Record<string, unknown>;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    signatures?: Array<{
      role: string;
      signatureData?: string;
      coreFileId?: number;
      clientSyncId?: string;
    }>;
    submitted?: boolean;
  }) {
    const existing = await this.prisma.pmInspection.findUnique({
      where: { clientSyncId: payload.clientSyncId },
    });
    if (existing) {
      if (existing.companyId !== payload.companyId) {
        throw new ForbiddenException('Cross-tenant inspection sync denied');
      }
      if (payload.submitted && existing.status === 'draft') {
        await this.saveAnswers(
          existing.id,
          payload.answers,
          payload.inspectorUserId,
        );
        return this.submit(existing.id, payload.inspectorUserId);
      }
      return this.get(existing.id);
    }

    const created = await this.createFromTemplate({
      templateId: payload.templateId,
      companyId: payload.companyId,
      projectId: payload.projectId,
      inspectorUserId: payload.inspectorUserId,
      siteId: payload.siteId,
      equipmentId: payload.equipmentId,
      workerId: payload.workerId,
      clientSyncId: payload.clientSyncId,
    });

    await this.saveAnswers(
      created.id,
      payload.answers,
      payload.inspectorUserId,
    );

    if (payload.signatures) {
      for (const sig of payload.signatures) {
        await this.addSignature(created.id, sig);
      }
    }

    if (payload.submitted) {
      return this.submit(created.id, payload.inspectorUserId);
    }
    return this.get(created.id);
  }

  async escalateToIncident(
    inspectionId: string,
    actorId: number,
    body?: { title?: string; description?: string },
  ) {
    const inspection = await this.get(inspectionId);
    const result =
      await this.inspectionIncidents.createDraftIncidentFromInspection(
        inspection,
        actorId,
        {
          title: body?.title,
          description: body?.description,
          auto: false,
        },
      );

    if (!result.existing) {
      await this.audit(inspectionId, 'escalated_to_incident', actorId, {
        eventId: result.eventId,
      });
      await this.auditLog.logAudit(
        { id: actorId, companyId: inspection.companyId },
        AuditAction.INSPECTION_ESCALATED,
        {
          type: AuditEntityType.PM_INSPECTION,
          id: inspectionId,
          tenantId: inspection.companyId,
        },
        { eventId: result.eventId, auto: false },
      );
    }

    return {
      inspectionId,
      eventId: result.eventId,
      existing: result.existing,
      event: result.event,
    };
  }

  async updateSharing(id: string, sharing: Partial<InspectionSharingConfig>) {
    const inspection = await this.get(id);
    const current = parseInspectionSharing(
      (inspection as { sharingJson?: unknown }).sharingJson,
    );
    const next = { ...current, ...sharing };
    return this.prisma.pmInspection.update({
      where: { id },
      data: { sharingJson: next as Prisma.InputJsonValue },
      include: inspectionInclude,
    });
  }
}
