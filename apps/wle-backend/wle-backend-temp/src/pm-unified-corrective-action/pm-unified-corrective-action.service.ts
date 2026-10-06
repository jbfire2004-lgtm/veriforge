import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmCorrectiveActionLinkType,
  PmCorrectiveActionStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmUnifiedHazardControlService } from '../pm-unified-hazard-control/pm-unified-hazard-control.service';
import { PmWorkerSafetyProfileService } from '../pm-worker-safety-profile/pm-worker-safety-profile.service';
import { PmUnifiedCorrectiveActionCailService } from './pm-unified-corrective-action-cail.service';
import { CapaGenerationEngine } from './capa-generation.engine';
import { CapaEnforcementEngine } from './capa-enforcement.engine';
import { CapaPublishEngine } from './capa-publish.engine';
import { CrossModuleIntegrationEngine } from './cross-module-integration.engine';
import { CapaAssignmentEngine } from '../pm-corrective-actions/capa-assignment.engine';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';

@Injectable()
export class PmUnifiedCorrectiveActionService {
  private readonly generation = new CapaGenerationEngine();
  private readonly enforcement = new CapaEnforcementEngine();
  private readonly publish = new CapaPublishEngine();
  private readonly crossModule = new CrossModuleIntegrationEngine();
  private readonly assignmentRules = new CapaAssignmentEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly capa: PmCorrectiveActionsService,
    private readonly auto: PmCapaAutoGenerateService,
    private readonly cail: PmUnifiedCorrectiveActionCailService,
    @Optional() private readonly hazardControl?: PmUnifiedHazardControlService,
    @Optional() private readonly workerSafety?: PmWorkerSafetyProfileService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
  ) {}

  private async unifiedAudit(
    actionId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: actionId },
      select: { companyId: true, projectId: true },
    });
    await this.prisma.pmCorrectiveActionAuditLog.create({
      data: {
        actionId,
        eventType: `unified_${eventType}`,
        actorId,
        payload: {
          ...payload,
          companyId: action?.companyId,
          projectId: action?.projectId,
        } as Prisma.InputJsonValue,
      },
    });
  }

  async getDashboard(filters: { companyId: number; projectId?: number }) {
    const where = {
      companyId: filters.companyId,
      deletedAt: null,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };
    const now = new Date();

    const [total, open, overdue, critical, escalated] = await Promise.all([
      this.prisma.pmCorrectiveAction.count({ where }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...where,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...where,
          dueAt: { lt: now },
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...where,
          severityScore: { gte: 75 },
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: { ...where, escalationLevel: { gte: 2 } },
      }),
    ]);

    const analytics = filters.projectId
      ? await this.capa.analytics(filters.projectId)
      : { closureRate: 100 };

    const companyScore = this.cail.companyCapaScore({
      open,
      overdue,
      closureRate: (analytics as { closureRate?: number }).closureRate ?? 100,
      criticalOpen: critical,
    });

    const insights = await this.cail.insights(filters);

    return {
      companyId: filters.companyId,
      projectId: filters.projectId ?? null,
      metrics: {
        total,
        open,
        overdue,
        critical,
        escalated,
        companyCapaScore: companyScore,
      },
      cail: { insights },
    };
  }

  async createUnified(
    input: {
      companyId: number;
      projectId: number;
      siteId?: number;
      sourceModule: string;
      sourceId: string;
      sourceItemId?: string;
      title: string;
      description?: string;
      severity?: string;
      actionType?: string;
      hazardId?: string;
      controlId?: string;
      rootCauseId?: string;
      equipmentId?: number;
      workerId?: number;
      createdByUserId: number;
      assignUserId?: number;
      clientSyncId?: string;
      links?: Array<{ linkType: PmCorrectiveActionLinkType; linkedId: string }>;
      publish?: boolean;
    },
    actorId?: number,
  ) {
    const trigger = this.generation.buildTrigger({
      sourceModule: input.sourceModule,
      sourceId: input.sourceId,
      sourceItemId: input.sourceItemId,
      title: input.title,
      description: input.description,
      severity: (input.severity ?? 'medium') as 'medium',
      hazardId: input.hazardId,
      controlId: input.controlId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      linkTypes: (input.links ?? []).map((l) => ({
        linkType: l.linkType,
        linkedId: l.linkedId,
      })),
    });

    const action = await this.capa.create({
      companyId: input.companyId,
      projectId: input.projectId,
      siteId: input.siteId,
      sourceModule: input.sourceModule,
      sourceId: input.sourceId,
      sourceItemId: input.sourceItemId,
      title: input.title,
      description: input.description,
      severity: input.severity ?? trigger.severity,
      actionType: trigger.actionType,
      createdByUserId: input.createdByUserId,
      assignUserId: input.assignUserId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      sifLinked: trigger.sifLinked,
      hecaLinked: trigger.hecaLinked,
      clientSyncId: input.clientSyncId,
      publish: false,
    });

    await this.prisma.pmCorrectiveAction.update({
      where: { id: action.id },
      data: {
        hazardId: input.hazardId,
        controlId: input.controlId,
        rootCauseId: input.rootCauseId,
        severityLevel: trigger.severity,
        priorityLevel: this.generation.classify({ severity: trigger.severity })
          .priority,
        actionType: trigger.actionType,
        verificationRequirementsJson: {
          requiredRole: trigger.verificationRole,
          steps: [
            'review_evidence',
            'validate_completion',
            'confirm_effectiveness',
            'close',
          ],
        } as Prisma.InputJsonValue,
        evidenceRequirementsJson: {
          photos: true,
          signatures: trigger.severity === 'critical',
        } as Prisma.InputJsonValue,
      },
    });

    for (const link of input.links ?? []) {
      await this.addLink(action.id, link.linkType, link.linkedId);
    }
    if (input.hazardId) {
      await this.addLink(action.id, 'hazard', input.hazardId);
    }
    if (input.controlId) {
      await this.addLink(action.id, 'control', input.controlId);
    }

    if (input.publish !== false) {
      await this.publishAction(action.id, actorId ?? input.createdByUserId);
    }

    await this.unifiedAudit(action.id, 'created', actorId);
    this.ecosystem?.emitCapaCreated({
      actionId: action.id,
      companyId: input.companyId,
      projectId: input.projectId,
      title: input.title,
      actorId,
      sourceModule: input.sourceModule,
    });
    return this.capa.get(action.id);
  }

  async publishAction(actionId: string, actorId: number) {
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: actionId },
      include: { assignees: true },
    });
    if (!action) throw new NotFoundException('Corrective action not found');

    const pub = this.publish.evaluate({
      status: action.status,
      title: action.title,
      hasPrimaryAssignee: action.assignees.some((a) => a.role === 'primary'),
      verificationRequirements: action.verificationRequirementsJson as Record<
        string,
        unknown
      >,
    });
    if (!pub.canPublish)
      throw new BadRequestException(pub.violations.join('; '));

    await this.prisma.pmCorrectiveActionVersion.create({
      data: {
        id: randomUUID(),
        actionId,
        version: action.publishVersion,
        snapshotJson: action as unknown as Prisma.InputJsonValue,
        publishedById: actorId,
      },
    });

    await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: {
        status: pub.nextStatus,
        publishVersion: { increment: 1 },
        publishedAt: new Date(),
      },
    });

    await this.unifiedAudit(actionId, 'published', actorId);
    this.ecosystem?.emitCapaStatusChanged({
      actionId,
      companyId: action.companyId,
      projectId: action.projectId ?? undefined,
      status: pub.nextStatus,
      actorId,
    });
    return this.capa.get(actionId);
  }

  async addLink(
    actionId: string,
    linkType: PmCorrectiveActionLinkType,
    linkedId: string,
    meta?: Record<string, unknown>,
  ) {
    return this.prisma.pmCorrectiveActionLink.upsert({
      where: {
        actionId_linkType_linkedId: { actionId, linkType, linkedId },
      },
      create: {
        id: randomUUID(),
        actionId,
        linkType,
        linkedId,
        linkedMeta: (meta ?? {}) as Prisma.InputJsonValue,
      },
      update: { linkedMeta: (meta ?? {}) as Prisma.InputJsonValue },
    });
  }

  // ---------- Cross-module generation ----------

  async generateFromAllModules(projectId: number, actorId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const latestJha = await this.prisma.jhaFlha.findFirst({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });

    const results: Record<string, unknown> = {
      jha: latestJha ? await this.auto.fromJhaFlha(latestJha.id, actorId) : [],
      inspection: await this.auto.syncOpenFromModules(projectId, actorId),
      sif: [],
      hazardControl: [],
      pmTasks: [] as string[],
      training: [] as string[],
      equipment: [] as string[],
      emergency: [] as string[],
      sds: [] as string[],
      access: [] as string[],
    };

    if (this.hazardControl) {
      const unmapped = await this.prisma.pmUnifiedHazard.count({
        where: {
          projectId,
          status: 'published',
          deletedAt: null,
          controlLinks: { none: {} },
        },
      });
      if (unmapped > 0) {
        const created = await this.createUnified(
          {
            companyId: project.companyId,
            projectId,
            sourceModule: 'unified_hazard_control',
            sourceId: String(projectId),
            title: `Map controls for ${unmapped} published hazards`,
            description: 'Auto-generated from weak/missing control mapping',
            severity: 'high',
            createdByUserId: actorId,
            publish: true,
          },
          actorId,
        );
        results.hazardControl = [created.id];
      }
    }

    const blockedTasks = await this.prisma.pmPmTask.findMany({
      where: { projectId, status: 'blocked', deletedAt: null },
      take: 10,
    });
    for (const t of blockedTasks) {
      const row = await this.createUnified(
        {
          companyId: project.companyId,
          projectId,
          sourceModule: 'pm_task',
          sourceId: t.id,
          title: `Resolve safety blocker: ${t.title}`,
          description: t.blockedReason ?? undefined,
          severity: 'high',
          createdByUserId: actorId,
          links: [{ linkType: 'pm_task', linkedId: t.id }],
        },
        actorId,
      );
      (results.pmTasks as string[]).push((row as { id: string }).id);
    }

    const failures = await this.prisma.pmEquipmentFailure.findMany({
      where: {
        projectId,
        status: { notIn: ['closed', 'verified'] },
        correctiveActionId: null,
      },
      take: 10,
    });
    for (const f of failures) {
      const a = await this.auto.fromEquipmentFailure(f.id, actorId);
      if (a) (results.equipment as string[]).push(a.id);
    }

    const emergencies = await this.prisma.pmEmergencyEvent.findMany({
      where: {
        projectId,
        status: { in: ['declared', 'active', 'all_clear'] },
        closedAt: null,
      },
      take: 5,
    });
    for (const e of emergencies) {
      const a = await this.auto.fromEmergencyEvent(e.id, actorId);
      if (a) (results.emergency as string[]).push(a.id);
    }

    const now = new Date();
    const expiredTraining = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: {
        required: true,
        OR: [
          { status: { in: ['expired', 'missing', 'invalid'] } },
          { expiresAt: { lt: now } },
        ],
        worker: {
          projectAssignments: { some: { projectId, status: 'ACTIVE' } },
        },
      },
      take: 10,
    });
    for (const t of expiredTraining) {
      const a = await this.auto.fromTrainingGap(
        t.workerId,
        projectId,
        t.trainingCode,
        actorId,
      );
      if (a) (results.training as string[]).push(a.id);
    }

    const deniedAccess = await this.prisma.pmAccessAttempt.findMany({
      where: {
        projectId,
        decision: { in: ['denied', 'denied_with_reason'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    for (const att of deniedAccess) {
      if (!att.workerId) continue;
      const reasons = Array.isArray(att.denialReasons)
        ? att.denialReasons.join('; ')
        : 'Access denied';
      const a = await this.auto.fromAccessDenial(
        att.workerId,
        projectId,
        reasons,
        actorId,
      );
      if (a) (results.access as string[]).push(a.id);
    }

    return { projectId, results };
  }

  async generateFromSource(
    source: string,
    sourceId: string,
    actorId: number,
    extras?: { rootCauseId?: string; deficiencyId?: string },
  ) {
    switch (source) {
      case 'jha_flha':
        return this.auto.fromJhaFlha(sourceId, actorId);
      case 'inspection':
        return this.auto.fromInspectionDeficiency(
          extras?.deficiencyId ?? sourceId,
          actorId,
        );
      case 'incident':
        return this.auto.fromSafetyEvent(
          sourceId,
          extras?.rootCauseId ?? '',
          actorId,
        );
      case 'sif_heca':
        return this.auto.fromSifHecaEvent(sourceId, actorId);
      case 'equipment':
        return this.auto.fromEquipmentFailure(sourceId, actorId);
      case 'emergency':
        return this.auto.fromEmergencyEvent(sourceId, actorId);
      case 'training':
        return this.auto.fromTrainingGap(
          parseInt(extras?.rootCauseId ?? sourceId, 10),
          parseInt(extras?.deficiencyId ?? '0', 10) || 0,
          sourceId,
          actorId,
        );
      case 'sds':
        return this.auto.fromSdsGap(
          parseInt(extras?.rootCauseId ?? '1', 10),
          parseInt(extras?.deficiencyId ?? '0', 10) || 0,
          sourceId,
          actorId,
        );
      case 'site_access':
        return this.auto.fromAccessDenial(
          parseInt(sourceId, 10),
          parseInt(extras?.deficiencyId ?? '0', 10) || 0,
          extras?.rootCauseId ?? 'Access denied',
          actorId,
        );
      default:
        throw new BadRequestException(`Unknown source ${source}`);
    }
  }

  async updateUnified(
    actionId: string,
    body: {
      title?: string;
      description?: string;
      severityLevel?: string;
      priorityLevel?: string;
      dueAt?: string;
      hazardId?: string;
      controlId?: string;
      equipmentId?: number;
      workerId?: number;
    },
    actorId?: number,
  ) {
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: actionId },
    });
    if (!action || action.deletedAt)
      throw new NotFoundException('Corrective action not found');
    if (['verified', 'closed', 'cancelled'].includes(action.status)) {
      throw new BadRequestException('Cannot update closed corrective action');
    }

    const updated = await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: {
        title: body.title,
        description: body.description,
        severityLevel: body.severityLevel,
        priorityLevel: body.priorityLevel,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        hazardId: body.hazardId,
        controlId: body.controlId,
        equipmentId: body.equipmentId,
        workerId: body.workerId,
      },
    });

    await this.unifiedAudit(actionId, 'updated', actorId, body);
    return this.capa.get(updated.id);
  }

  async autoAssign(actionId: string, actorId?: number) {
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: actionId },
      include: { project: { include: { projectSafetyRoles: true } } },
    });
    if (!action) throw new NotFoundException('Corrective action not found');

    const safetyLead = action.project?.projectSafetyRoles?.find(
      (r) => r.role === 'company_safety_manager' || r.role === 'supervisor',
    );

    const suggestions = this.assignmentRules.suggest({
      severity: action.severityLevel,
      sourceModule: action.sourceModule,
      sifLinked: action.sourceModule === 'sif_heca',
      projectSafetyLeadId: safetyLead?.userId,
    });

    for (const s of suggestions) {
      if (s.userId) {
        await this.capa.assign(
          actionId,
          { userId: s.userId, role: s.role },
          actorId,
        );
      }
    }
    return { actionId, suggestions };
  }

  submitForVerification(actionId: string, actorId: number) {
    return this.capa.submitForVerification(actionId, actorId);
  }

  markInProgress(actionId: string, actorId?: number) {
    return this.capa.markInProgress(actionId, actorId);
  }

  addSignature(
    actionId: string,
    data: { role: string; signatureData?: string },
    actorId?: number,
  ) {
    return this.capa.addSignature(actionId, data, actorId);
  }

  async jhaApprovalGate(jhaFlhaId: string) {
    const openCapa = await this.prisma.pmCorrectiveAction.count({
      where: {
        deletedAt: null,
        status: { notIn: ['verified', 'closed', 'cancelled'] },
        OR: [
          { sourceModule: 'jha_flha', sourceId: jhaFlhaId },
          {
            moduleLinks: {
              some: { linkType: 'jha_flha', linkedId: jhaFlhaId },
            },
          },
        ],
      },
    });
    const sifOpen = await this.prisma.pmCorrectiveAction.count({
      where: {
        deletedAt: null,
        status: { notIn: ['verified', 'closed', 'cancelled'] },
        sourceModule: 'sif_heca',
        moduleLinks: { some: { linkType: 'jha_flha', linkedId: jhaFlhaId } },
      },
    });
    return this.crossModule.jhaApprovalGate(openCapa, sifOpen);
  }

  async pmTaskStartGate(projectId: number, workerId?: number) {
    const enforcement = await this.unifiedEnforcement({
      companyId: (await this.prisma.project.findUnique({
        where: { id: projectId },
      }))!.companyId,
      projectId,
      workerId,
    });
    return this.crossModule.pmTaskStartGate(
      enforcement.blocks.pmScheduling ? 1 : 0,
      enforcement.blocks.workerAccess ? 1 : 0,
    );
  }

  async revokeExpiredOverrides() {
    const result = await this.prisma.pmCorrectiveActionOverride.updateMany({
      where: { active: true, expiresAt: { lt: new Date() } },
      data: { active: false },
    });
    return { revoked: result.count };
  }

  getAction(actionId: string) {
    return this.capa.get(actionId);
  }

  async applyOfflineSync(
    companyId: number,
    projectId: number,
    payload: {
      actions?: Array<Record<string, unknown>>;
      verifications?: Array<{
        actionId: string;
        outcome: 'approve' | 'reject';
        role: string;
        notes?: string;
      }>;
      attachments?: Array<{
        actionId: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        phase?: string;
        clientSyncId?: string;
      }>;
      clientSyncId?: string;
    },
    actorId: number,
  ) {
    const applied: string[] = [];
    for (const row of payload.actions ?? []) {
      const syncId = String(row.clientSyncId ?? '');
      if (!syncId) continue;
      const existing = await this.prisma.pmCorrectiveAction.findUnique({
        where: { clientSyncId: syncId },
      });
      if (existing) {
        if (row.status === 'verification_pending') {
          await this.capa.submitForVerification(existing.id, actorId);
        }
        applied.push(existing.id);
        continue;
      }
      const created = await this.capa.syncOffline({
        clientSyncId: syncId,
        companyId,
        projectId,
        createdByUserId: actorId,
        title: String(row.title),
        description: row.description as string | undefined,
        sourceModule: String(row.sourceModule ?? 'manual'),
        sourceId: String(row.sourceId ?? syncId),
        severity: String(row.severity ?? 'medium'),
        publish: row.publish !== false,
      });
      applied.push(created.id);
    }

    for (const v of payload.verifications ?? []) {
      if (!v.actionId) continue;
      await this.verify(v.actionId, v, actorId);
      if (v.outcome === 'approve') {
        await this.closeDeficiencyOnVerify(v.actionId);
      }
      applied.push(v.actionId);
    }

    for (const att of payload.attachments ?? []) {
      if (!att.actionId) continue;
      await this.capa.addAttachment(
        att.actionId,
        {
          fileName: att.fileName,
          mimeType: att.mimeType,
          dataUrl: att.dataUrl,
          phase: att.phase,
          clientSyncId: att.clientSyncId,
        },
        actorId,
      );
      applied.push(att.actionId);
    }

    return {
      ok: true,
      applied: [...new Set(applied)],
      serverState: await this.buildOfflineBundle({ companyId, projectId }),
    };
  }

  async getCailBundle(filters: { companyId: number; projectId?: number }) {
    const dashboard = await this.getDashboard(filters);
    const metrics = dashboard.metrics as {
      open?: number;
      overdue?: number;
      critical?: number;
      companyCapaScore?: number;
    };

    const [
      insights,
      predictions,
      workerRiskScores,
      equipmentRiskScores,
      chronicDeficiencies,
      weakControls,
    ] = await Promise.all([
      this.cail.insights(filters),
      this.cail.predictCapaGeneration(filters),
      this.cail.workerRiskScoring(filters),
      this.cail.equipmentRiskScoring(filters),
      this.cail.chronicDeficiencyDetection(filters),
      this.cail.weakControlDetection(filters),
    ]);

    const projectCapaScore = filters.projectId
      ? await this.cail.projectCapaScore(filters.projectId)
      : null;

    return {
      insights,
      predictions,
      workerRiskScores,
      equipmentRiskScores,
      chronicDeficiencies,
      weakControls,
      companyCapaScore: metrics.companyCapaScore ?? null,
      projectCapaScore,
      overdueRiskScore: this.cail.overdueRiskScore({
        openCount: metrics.open ?? 0,
        overdueCount: metrics.overdue ?? 0,
        avgDaysToDue: 7,
        escalationLevelMax: 3,
      }),
    };
  }

  async getAnalyticsTrends(filters: { companyId: number; projectId?: number }) {
    const base = await this.getAnalytics(filters);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const where = {
      companyId: filters.companyId,
      deletedAt: null,
      createdAt: { gte: thirtyDaysAgo },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    const [created, closed, escalations] = await Promise.all([
      this.prisma.pmCorrectiveAction.count({ where }),
      this.prisma.pmCorrectiveAction.count({
        where: { ...where, status: { in: ['verified', 'closed'] } },
      }),
      this.prisma.pmCorrectiveActionEscalation.count({
        where: {
          triggeredAt: { gte: thirtyDaysAgo },
          action: filters.projectId ? { projectId: filters.projectId } : {},
        },
      }),
    ]);

    const overdueRisk = this.cail.overdueRiskScore({
      openCount: (base.metrics as { open?: number })?.open ?? 0,
      overdueCount: (base.metrics as { overdue?: number })?.overdue ?? 0,
      avgDaysToDue: 7,
      escalationLevelMax: 3,
    });

    return {
      ...base,
      trends: {
        created30d: created,
        closed30d: closed,
        escalations30d: escalations,
      },
      overdueRiskScore: overdueRisk,
      leadingIndicators: {
        overdueRate:
          created > 0
            ? Math.round(
                (((base.metrics as { overdue?: number })?.overdue ?? 0) /
                  created) *
                  100,
              )
            : 0,
        criticalOpen: (base.metrics as { critical?: number })?.critical ?? 0,
      },
    };
  }

  workerCapaList(workerId: number, projectId?: number) {
    return this.capa
      .list({
        projectId,
        overdueOnly: false,
      })
      .then((rows) =>
        rows.filter(
          (r) =>
            r.workerId === workerId ||
            r.assignees?.some((a) => a.workerId === workerId),
        ),
      );
  }

  equipmentCapaList(equipmentId: number, projectId?: number) {
    return this.capa
      .list({ projectId })
      .then((rows) => rows.filter((r) => r.equipmentId === equipmentId));
  }

  // ---------- Enforcement ----------

  async unifiedEnforcement(filters: {
    companyId: number;
    projectId?: number;
    workerId?: number;
    equipmentId?: number;
  }) {
    const openWhere = {
      companyId: filters.companyId,
      deletedAt: null,
      status: {
        notIn: [
          'verified',
          'closed',
          'cancelled',
        ] as PmCorrectiveActionStatus[],
      },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    let workerOpen = 0;
    let workerOverdue = 0;
    let workerCritical = 0;
    if (filters.workerId) {
      const w = await this.capa.workerAccessCheck(
        filters.workerId,
        filters.projectId ?? 0,
      );
      workerOpen = w.openAssigned;
      workerOverdue = w.overdueCount;
      workerCritical = w.criticalOpen;
    }

    const equipmentOpen = filters.equipmentId
      ? await this.prisma.pmCorrectiveAction.count({
          where: { ...openWhere, equipmentId: filters.equipmentId },
        })
      : 0;

    const projectCriticalOpen = await this.prisma.pmCorrectiveAction.count({
      where: { ...openWhere, severityScore: { gte: 75 } },
    });

    const emergencyActive = filters.projectId
      ? !!(await this.prisma.pmSiteEmergencyLock.findFirst({
          where: { projectId: filters.projectId, active: true },
        }))
      : false;

    const overrides = await this.prisma.pmCorrectiveActionOverride.findMany({
      where: {
        companyId: filters.companyId,
        active: true,
        expiresAt: { gt: new Date() },
        OR: [
          { projectId: null },
          { projectId: filters.projectId ?? undefined },
        ],
      },
    });

    return this.enforcement.evaluate({
      workerOpen,
      workerOverdue,
      workerCritical,
      equipmentOpen,
      projectCriticalOpen,
      emergencyActive,
      activeOverrides: overrides.map((o) => ({
        ruleType: o.ruleType,
        ruleKey: o.ruleKey,
      })),
    });
  }

  async createOverride(
    body: {
      companyId: number;
      projectId?: number;
      actionId?: string;
      ruleType: string;
      ruleKey: string;
      reason: string;
      expiresAt: string;
    },
    actorId: number,
  ) {
    return this.prisma.pmCorrectiveActionOverride.create({
      data: {
        id: randomUUID(),
        companyId: body.companyId,
        projectId: body.projectId,
        actionId: body.actionId,
        ruleType: body.ruleType,
        ruleKey: body.ruleKey,
        reason: body.reason,
        expiresAt: new Date(body.expiresAt),
        approvedById: actorId,
      },
    });
  }

  // ---------- Escalation / verification (delegate) ----------

  runEscalationSweep(projectId: number) {
    return this.capa.runEscalations(projectId);
  }

  assign(
    actionId: string,
    data: {
      userId?: number;
      workerId?: number;
      role?: 'primary' | 'secondary';
    },
    actorId?: number,
  ) {
    return this.capa.assign(actionId, data, actorId);
  }

  verify(
    actionId: string,
    input: { outcome: 'approve' | 'reject'; role: string; notes?: string },
    verifierUserId: number,
  ) {
    return this.capa.verify(actionId, input, verifierUserId);
  }

  async closeDeficiencyOnVerify(actionId: string) {
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: actionId },
      include: { moduleLinks: true },
    });
    if (!action || action.status !== 'verified') return;

    const inspLink = action.moduleLinks.find(
      (l) => l.linkType === 'inspection',
    );
    if (inspLink && action.deficiencyId) {
      await this.prisma.pmInspectionDeficiency.update({
        where: { id: action.deficiencyId },
        data: { status: 'closed', closedAt: new Date() },
      });
    }
  }

  // ---------- Offline ----------

  async buildOfflineBundle(filters: { companyId: number; projectId?: number }) {
    const actions = await this.capa.list({
      companyId: filters.companyId,
      projectId: filters.projectId,
    });

    const cacheKey = filters.projectId
      ? `project:${filters.projectId}:capa_bundle`
      : `company:${filters.companyId}:capa_bundle`;

    const bundle = {
      syncedAt: new Date().toISOString(),
      actions,
      hazardControl: this.hazardControl
        ? await this.hazardControl.buildOfflineBundle({
            companyId: filters.companyId,
            projectId: filters.projectId,
          })
        : null,
    };

    await this.prisma.pmCorrectiveActionOfflineCache.upsert({
      where: { cacheKey },
      create: {
        id: randomUUID(),
        companyId: filters.companyId,
        projectId: filters.projectId,
        cacheKey,
        payload: bundle as Prisma.InputJsonValue,
        syncedAt: new Date(),
      },
      update: {
        payload: bundle as Prisma.InputJsonValue,
        cacheVersion: { increment: 1 },
        syncedAt: new Date(),
      },
    });

    return bundle;
  }

  async getAnalytics(filters: { companyId: number; projectId?: number }) {
    const dashboard = await this.getDashboard(filters);
    if (filters.projectId) {
      const projectAnalytics = await this.capa.analytics(filters.projectId);
      return { ...dashboard, projectAnalytics };
    }
    return dashboard;
  }
}
