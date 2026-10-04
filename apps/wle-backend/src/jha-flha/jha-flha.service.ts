import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import {
  JhaEnergyType,
  JhaFlhaKind,
  JhaFlhaSignatureRole,
  JhaFlhaStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JhaScoringService } from './jha-scoring.service';
import { JhaCailBridgeService } from './jha-cail-bridge.service';
import { JhaLibraryService } from './jha-library.service';
import { CONTROL_CLASS_LOOKUP } from './jha-flha.constants';
import { SifHecaIngestionService } from '../sif-heca/sif-heca-ingestion.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmUnifiedCorrectiveActionService } from '../pm-unified-corrective-action/pm-unified-corrective-action.service';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../modules/adoption-analytics/adoption-analytics.constants';

const EDITABLE: JhaFlhaStatus[] = ['DRAFT', 'REJECTED'];

@Injectable()
export class JhaFlhaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: JhaScoringService,
    private readonly cail: JhaCailBridgeService,
    private readonly library: JhaLibraryService,
    @Optional()
    @Inject(forwardRef(() => SifHecaIngestionService))
    private readonly sifIngestion?: SifHecaIngestionService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
    @Optional() private readonly unifiedCapa?: PmUnifiedCorrectiveActionService,
    @Optional() private readonly adoption?: AdoptionEventService,
  ) {}

  private async audit(
    jhaFlhaId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.jhaFlhaAuditLog.create({
      data: {
        jhaFlhaId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private fullInclude() {
    return {
      hazards: { orderBy: { sortOrder: 'asc' as const } },
      controls: true,
      energySources: true,
      workers: {
        include: {
          worker: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      equipmentLinks: {
        include: {
          equipment: { select: { id: true, name: true, assetTag: true } },
        },
      },
      signatures: true,
      attachments: true,
      correctiveActions: true,
      project: { select: { id: true, name: true, companyId: true } },
    };
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: JhaFlhaStatus;
    kind?: JhaFlhaKind;
  }) {
    return this.prisma.jhaFlha.findMany({
      where: {
        deletedAt: null,
        projectId: filters.projectId,
        companyId: filters.companyId,
        status: filters.status,
        kind: filters.kind,
      },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { hazards: true, workers: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async getById(id: string) {
    const row = await this.prisma.jhaFlha.findFirst({
      where: { id, deletedAt: null },
      include: this.fullInclude(),
    });
    if (!row) throw new NotFoundException('JHA/FLHA not found');
    return row;
  }

  async getScore(id: string) {
    return this.evaluate(id);
  }

  async getProjectAnalytics(projectId: number) {
    const since90 = new Date(Date.now() - 90 * 86400000);
    const rows = await this.prisma.jhaFlha.findMany({
      where: { projectId, deletedAt: null, createdAt: { gte: since90 } },
      include: {
        _count: { select: { hazards: true, controls: true, workers: true } },
        workers: { select: { signedAt: true } },
      },
    });

    const total = rows.length;
    const approved = rows.filter(
      (r) => r.status === 'APPROVED' || r.status === 'LOCKED',
    ).length;
    const sifFlagged = rows.filter((r) => r.sifPotential).length;
    const qualityScores = rows
      .map((r) => r.qualityScore ?? 0)
      .filter((s) => s > 0);
    const avgQuality =
      qualityScores.length > 0
        ? Math.round(
            qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length,
          )
        : null;

    const hazardCount = rows.reduce((s, r) => s + r._count.hazards, 0);
    const controlCount = rows.reduce((s, r) => s + r._count.controls, 0);
    const hazardCoverage =
      total > 0
        ? Math.round(
            (rows.filter((r) => r._count.hazards > 0).length / total) * 100,
          )
        : 100;
    const controlEffectiveness =
      hazardCount > 0
        ? Math.min(100, Math.round((controlCount / hazardCount) * 50))
        : 0;

    let signedWorkers = 0;
    let totalWorkers = 0;
    for (const r of rows) {
      totalWorkers += r.workers.length;
      signedWorkers += r.workers.filter((w) => w.signedAt).length;
    }
    const workerParticipation =
      totalWorkers > 0 ? Math.round((signedWorkers / totalWorkers) * 100) : 100;

    const projectRiskContribution = rows.reduce(
      (s, r) => s + (r.taskRiskScore ?? 0),
      0,
    );

    return {
      projectId,
      windowDays: 90,
      totals: { jhas: total, approved, sifFlagged },
      scores: {
        jhaQualityScore: avgQuality,
        hazardCoverageScore: hazardCoverage,
        controlEffectivenessScore: controlEffectiveness,
        workerParticipationScore: workerParticipation,
        projectRiskContribution: Math.min(
          100,
          Math.round(projectRiskContribution / Math.max(1, total)),
        ),
      },
      trends: {
        sifRatePct: total > 0 ? Math.round((sifFlagged / total) * 100) : 0,
        approvalRatePct: total > 0 ? Math.round((approved / total) * 100) : 0,
      },
      leadingIndicators: {
        avgHazardsPerJha:
          total > 0 ? Math.round((hazardCount / total) * 10) / 10 : 0,
        avgControlsPerJha:
          total > 0 ? Math.round((controlCount / total) * 10) / 10 : 0,
        underReview: rows.filter(
          (r) => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED',
        ).length,
      },
      laggingIndicators: {
        rejected: rows.filter((r) => r.status === 'REJECTED').length,
        draftOpen: rows.filter((r) => r.status === 'DRAFT').length,
      },
    };
  }

  async create(input: {
    kind?: JhaFlhaKind;
    companyId: number;
    projectId: number;
    siteId?: number;
    workPackageId?: string;
    taskId?: string;
    taskLibraryId?: string;
    taskDescription: string;
    workScope?: string;
    locationNote?: string;
    environmentalJson?: Record<string, unknown>;
    createdByUserId?: number;
    clientSyncId?: string;
  }) {
    if (input.clientSyncId) {
      const existing = await this.prisma.jhaFlha.findUnique({
        where: { clientSyncId: input.clientSyncId },
      });
      if (existing) return this.getById(existing.id);
    }

    const row = await this.prisma.jhaFlha.create({
      data: {
        kind: input.kind ?? 'FLHA',
        companyId: input.companyId,
        projectId: input.projectId,
        siteId: input.siteId,
        workPackageId: input.workPackageId,
        taskId: input.taskId,
        taskLibraryId: input.taskLibraryId,
        taskDescription: input.taskDescription,
        workScope: input.workScope,
        locationNote: input.locationNote,
        environmentalJson: (input.environmentalJson ??
          {}) as Prisma.InputJsonValue,
        createdByUserId: input.createdByUserId,
        clientSyncId: input.clientSyncId,
      },
    });
    await this.audit(row.id, 'created', input.createdByUserId);
    if (this.adoption) {
      const kind = input.kind ?? 'FLHA';
      this.adoption.track({
        companyId: input.companyId,
        userId: input.createdByUserId,
        event:
          kind === 'JHA'
            ? ADOPTION_EVENT_TYPES.JHA_CREATED
            : ADOPTION_EVENT_TYPES.FLHA_CREATED,
        metadata: { jhaFlhaId: row.id },
      });
    }
    return this.getById(row.id);
  }

  async updateDraft(
    id: string,
    data: Partial<{
      taskDescription: string;
      workScope: string;
      locationNote: string;
      environmentalJson: Record<string, unknown>;
    }>,
    actorId?: number,
  ) {
    const row = await this.getById(id);
    if (!EDITABLE.includes(row.status)) {
      throw new BadRequestException(
        'Only draft or rejected records can be edited',
      );
    }
    await this.prisma.jhaFlha.update({
      where: { id },
      data: {
        taskDescription: data.taskDescription,
        workScope: data.workScope,
        locationNote: data.locationNote,
        environmentalJson: data.environmentalJson as
          | Prisma.InputJsonValue
          | undefined,
        clientVersion: { increment: 1 },
      },
    });
    await this.audit(id, 'draft_updated', actorId);
    return this.getById(id);
  }

  async addHazard(
    jhaFlhaId: string,
    data: {
      libraryEntryId?: string;
      category?: string;
      subcategory?: string;
      description: string;
      severity?: number;
      likelihood?: number;
      energyTypes?: string[];
      sifIndicator?: boolean;
    },
    actorId?: number,
  ) {
    await this.assertEditable(jhaFlhaId);
    const severity = data.severity ?? 3;
    const likelihood = data.likelihood ?? 3;
    const riskScore = this.scoring.computeHazardRisk(severity, likelihood);
    const count = await this.prisma.jhaFlhaHazard.count({
      where: { jhaFlhaId },
    });
    const hazard = await this.prisma.jhaFlhaHazard.create({
      data: {
        jhaFlhaId,
        sortOrder: count,
        libraryEntryId: data.libraryEntryId,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        severity,
        likelihood,
        riskScore,
        energyTypes: (data.energyTypes ?? []) as Prisma.InputJsonValue,
        sifIndicator: data.sifIndicator ?? riskScore >= 20,
      },
    });
    await this.recomputeScores(jhaFlhaId);
    await this.syncEnergyFromHazards(jhaFlhaId, actorId);
    await this.audit(jhaFlhaId, 'hazard_added', actorId, {
      hazardId: hazard.id,
    });
    return hazard;
  }

  private async syncEnergyFromHazards(jhaFlhaId: string, actorId?: number) {
    const row = await this.getById(jhaFlhaId);
    const merged = new Map<JhaEnergyType, number>();
    for (const es of row.energySources) {
      merged.set(es.energyType, es.exposureLevel);
    }
    for (const h of row.hazards) {
      const types = (h.energyTypes as string[]) ?? [];
      for (const t of types) {
        const et = t as JhaEnergyType;
        if (!merged.has(et)) merged.set(et, 3);
      }
    }
    if (merged.size === 0) return row;
    const sources = Array.from(merged.entries()).map(
      ([energyType, exposureLevel]) => ({
        energyType,
        exposureLevel,
      }),
    );
    await this.setEnergySources(jhaFlhaId, sources, actorId);
  }

  async addControl(
    jhaFlhaId: string,
    data: {
      hazardId?: string;
      libraryEntryId?: string;
      controlType: string;
      description: string;
      adequate?: boolean;
      ppeRequired?: boolean;
    },
    actorId?: number,
  ) {
    await this.assertEditable(jhaFlhaId);
    const control = await this.prisma.jhaFlhaControl.create({
      data: {
        jhaFlhaId,
        hazardId: data.hazardId,
        libraryEntryId: data.libraryEntryId,
        controlType: data.controlType,
        description: data.description,
        adequate: data.adequate,
        ppeRequired: data.ppeRequired ?? false,
        effectivenessScore: data.adequate === false ? 2 : 4,
      },
    });
    await this.recomputeScores(jhaFlhaId);
    await this.audit(jhaFlhaId, 'control_added', actorId, {
      controlId: control.id,
    });
    return control;
  }

  async setEnergySources(
    jhaFlhaId: string,
    sources: Array<{
      energyType: JhaEnergyType;
      exposureLevel: number;
      controlsSummary?: string;
    }>,
    actorId?: number,
  ) {
    await this.assertEditable(jhaFlhaId);
    await this.prisma.jhaFlhaEnergySource.deleteMany({ where: { jhaFlhaId } });
    for (const s of sources) {
      await this.prisma.jhaFlhaEnergySource.create({
        data: {
          jhaFlhaId,
          energyType: s.energyType,
          exposureLevel: s.exposureLevel,
          controlsSummary: s.controlsSummary,
        },
      });
    }
    await this.recomputeScores(jhaFlhaId);
    await this.audit(jhaFlhaId, 'energy_updated', actorId);
    return this.getById(jhaFlhaId);
  }

  async setCrew(
    jhaFlhaId: string,
    workers: Array<{ workerId: number; role?: string }>,
    actorId?: number,
  ) {
    await this.assertEditable(jhaFlhaId);
    await this.prisma.jhaFlhaWorker.deleteMany({ where: { jhaFlhaId } });
    for (const w of workers) {
      await this.prisma.jhaFlhaWorker.create({
        data: { jhaFlhaId, workerId: w.workerId, role: w.role ?? 'crew' },
      });
    }
    await this.audit(jhaFlhaId, 'crew_updated', actorId);
    return this.getById(jhaFlhaId);
  }

  async setEquipment(
    jhaFlhaId: string,
    items: Array<{ equipmentId: number; authorized?: boolean }>,
    actorId?: number,
  ) {
    await this.assertEditable(jhaFlhaId);
    await this.prisma.jhaFlhaEquipment.deleteMany({ where: { jhaFlhaId } });
    for (const e of items) {
      await this.prisma.jhaFlhaEquipment.create({
        data: {
          jhaFlhaId,
          equipmentId: e.equipmentId,
          authorized: e.authorized ?? false,
        },
      });
    }
    await this.audit(jhaFlhaId, 'equipment_updated', actorId);
    return this.getById(jhaFlhaId);
  }

  async evaluate(id: string) {
    const row = await this.getById(id);
    const evaluation = await this.buildEvaluation(row);
    await this.prisma.jhaFlha.update({
      where: { id },
      data: {
        riskScore: evaluation.riskScore,
        taskRiskScore: evaluation.taskRiskScore,
        sifScore: evaluation.sifScore,
        sifPotential: evaluation.sifPotential,
        highEnergyFlag: evaluation.highEnergyFlag,
        qualityScore: evaluation.qualityScore,
        requiresSupervisorReview: evaluation.requiresSupervisorReview,
        controlsAdequate: evaluation.controlsAdequate,
        aiAnalysis: evaluation as unknown as Prisma.InputJsonValue,
      },
    });
    return { ...evaluation, jhaFlhaId: id };
  }

  async submit(id: string, actorId?: number) {
    const row = await this.getById(id);
    if (!EDITABLE.includes(row.status)) {
      throw new BadRequestException('Cannot submit in current status');
    }
    const evaluation = await this.buildEvaluation(row);
    if (evaluation.blockSubmission) {
      throw new BadRequestException({
        message: 'Submission blocked',
        reasons: evaluation.blockReasons,
        evaluation,
      });
    }

    const status: JhaFlhaStatus = evaluation.requiresSupervisorReview
      ? 'UNDER_REVIEW'
      : 'SUBMITTED';

    await this.snapshotVersion(id, actorId, 'submit');
    await this.prisma.jhaFlha.update({
      where: { id },
      data: {
        status,
        submittedAt: new Date(),
        riskScore: evaluation.riskScore,
        taskRiskScore: evaluation.taskRiskScore,
        sifScore: evaluation.sifScore,
        sifPotential: evaluation.sifPotential,
        highEnergyFlag: evaluation.highEnergyFlag,
        qualityScore: evaluation.qualityScore,
        requiresSupervisorReview: evaluation.requiresSupervisorReview,
        controlsAdequate: evaluation.controlsAdequate,
      },
    });

    if (!evaluation.controlsAdequate || evaluation.sifPotential) {
      await this.cail.emitFromEvaluation(
        id,
        row.projectId,
        row.companyId,
        row.kind,
        evaluation,
        actorId,
        row.siteId,
      );
    }

    if (this.sifIngestion) {
      await this.sifIngestion.ingestFromJhaFlha(id, actorId);
    }

    if (
      this.capaAuto &&
      (!evaluation.controlsAdequate || evaluation.sifPotential)
    ) {
      await this.capaAuto.fromJhaFlha(id, actorId ?? 0);
    }

    await this.audit(id, 'submitted', actorId, { status });
    return this.getById(id);
  }

  async supervisorReview(
    id: string,
    action: 'approve' | 'reject' | 'request_changes',
    actorId?: number,
    reviewNotes?: string,
  ) {
    const row = await this.getById(id);
    if (row.status !== 'UNDER_REVIEW' && row.status !== 'SUBMITTED') {
      throw new BadRequestException('Not awaiting supervisor review');
    }

    let status: JhaFlhaStatus;
    if (action === 'approve') {
      if (this.unifiedCapa) {
        const gate = await this.unifiedCapa.jhaApprovalGate(id);
        if (!gate.allowed) {
          throw new BadRequestException(gate.blockers.join('; '));
        }
      }
      const supSig = row.signatures.find((s) => s.role === 'SUPERVISOR');
      if (!supSig && row.requiresSupervisorReview) {
        throw new BadRequestException(
          'Supervisor signature required before approval',
        );
      }
      const crewSigned = row.workers.filter((w) => w.signedAt).length;
      if (row.workers.length > 0 && crewSigned < row.workers.length) {
        throw new BadRequestException(
          'All crew members must sign before approval',
        );
      }
      status = 'APPROVED';
      await this.prisma.jhaFlha.update({
        where: { id },
        data: { status, approvedAt: new Date(), reviewNotes, lockedAt: null },
      });
      await this.library.promoteFromApprovedJha(id);
    } else if (action === 'reject') {
      status = 'REJECTED';
      await this.prisma.jhaFlha.update({
        where: { id },
        data: { status, reviewNotes },
      });
    } else {
      status = 'DRAFT';
      await this.prisma.jhaFlha.update({
        where: { id },
        data: { status, reviewNotes },
      });
    }

    await this.snapshotVersion(id, actorId, action);
    await this.audit(id, `review_${action}`, actorId, { reviewNotes });
    return this.getById(id);
  }

  async lock(id: string, actorId?: number) {
    await this.prisma.jhaFlha.update({
      where: { id },
      data: { status: 'LOCKED', lockedAt: new Date() },
    });
    await this.audit(id, 'locked', actorId);
    return this.getById(id);
  }

  async sign(
    id: string,
    data: {
      role: JhaFlhaSignatureRole;
      signatureData: string;
      signerName?: string;
      signerUserId?: number;
      workerId?: number;
    },
  ) {
    const row = await this.getById(id);
    if (row.status === 'LOCKED') {
      throw new BadRequestException('Record is locked');
    }

    await this.prisma.jhaFlhaSignature.create({
      data: {
        jhaFlhaId: id,
        role: data.role,
        signatureData: data.signatureData,
        signerName: data.signerName,
        signerUserId: data.signerUserId,
      },
    });

    if (data.role === 'WORKER' && data.workerId) {
      await this.prisma.jhaFlhaWorker.updateMany({
        where: { jhaFlhaId: id, workerId: data.workerId },
        data: { signedAt: new Date(), hazardAcknowledged: true },
      });
    }

    await this.audit(id, 'signed', data.signerUserId, { role: data.role });
    return this.getById(id);
  }

  async addAttachment(
    id: string,
    data: {
      fileName: string;
      mimeType?: string;
      storageKey?: string;
      dataUrl?: string;
    },
  ) {
    await this.assertEditable(id);
    return this.prisma.jhaFlhaAttachment.create({
      data: { jhaFlhaId: id, ...data },
    });
  }

  async getSuggestions(id: string) {
    const row = await this.getById(id);
    const taskCode = row.taskLibraryId ?? undefined;
    const hazards = await this.library.listHazards(
      row.companyId,
      row.projectId,
      taskCode,
    );
    const controls = await this.library.listControls(
      row.companyId,
      row.projectId,
    );
    const env = (row.environmentalJson ?? {}) as Record<string, unknown>;
    const onHazards = (row.hazards ?? []) as Array<{
      description: string;
      category?: string | null;
    }>;
    const onControlsFull = (row.controls ?? []) as Array<{
      description: string;
      controlType: string;
      hazardId?: string | null;
    }>;
    const energySources = (row.energySources ?? []) as Array<{
      energyType: string;
    }>;

    const smart = await this.library.suggest(
      {
        taskDescription: row.taskDescription ?? undefined,
        locationNote: row.locationNote ?? undefined,
        weather: String(env.weather ?? ''),
        selectedHazardCategories: onHazards
          .map((h) => h.category)
          .filter(Boolean) as string[],
        selectedEnergyTypes: energySources.map((e) => e.energyType),
        existingHazardDescriptions: onHazards.map((h) => h.description),
        existingControlDescriptions: onControlsFull.map((c) => c.description),
        hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
        controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
        onFormControls: onControlsFull.map((c) => ({
          controlType: c.controlType,
          description: c.description,
          controlClass:
            CONTROL_CLASS_LOOKUP.get(c.description.toLowerCase().trim()) ??
            'alternative',
        })),
      },
      row.projectId,
    );

    return {
      hazards,
      controls,
      energyWheel: this.library.energyWheel(),
      suggestedHazards: smart.suggestedHazards,
      suggestedControls: smart.suggestedControls,
      warnings: smart.warnings,
      crewOftenAdds: smart.crewOftenAdds,
      missedHazards: smart.missedHazards,
      missedControls: smart.missedControls,
      requiredEnergyTypes: smart.requiredEnergyTypes,
      matchedTaskProfiles: smart.matchedTaskProfiles,
      gapWarnings: smart.gapWarnings,
      hecaNotes: smart.hecaNotes,
    };
  }

  async workerCompliance(workerId: number, projectId: number) {
    const approved = await this.prisma.jhaFlha.findFirst({
      where: {
        projectId,
        status: { in: ['APPROVED', 'LOCKED'] },
        workers: { some: { workerId } },
        approvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { approvedAt: 'desc' },
    });
    return {
      compliant: !!approved,
      jhaFlhaId: approved?.id ?? null,
      approvedAt: approved?.approvedAt?.toISOString() ?? null,
    };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    kind: JhaFlhaKind;
    companyId: number;
    projectId: number;
    siteId?: number;
    taskDescription: string;
    workScope?: string;
    locationNote?: string;
    environmentalJson?: Record<string, unknown>;
    hazards?: Array<{
      description: string;
      category?: string;
      severity?: number;
      likelihood?: number;
      energyTypes?: string[];
    }>;
    controls?: Array<{
      description: string;
      controlType?: string;
      hazardIndex?: number;
    }>;
    energySources?: Array<{ energyType: string; exposureLevel?: number }>;
    equipment?: Array<{ equipmentId: number; authorized?: boolean }>;
    workers?: Array<{ workerId: number; role?: string }>;
    signatures?: Array<{
      role: JhaFlhaSignatureRole;
      signatureData: string;
      signerName?: string;
      workerId?: number;
    }>;
    submit?: boolean;
    actorId?: number;
  }) {
    let row = await this.prisma.jhaFlha.findUnique({
      where: { clientSyncId: payload.clientSyncId },
    });
    if (!row) {
      const created = await this.create({
        ...payload,
        createdByUserId: payload.actorId,
      });
      row = await this.prisma.jhaFlha.findUniqueOrThrow({
        where: { id: created.id },
      });
    }

    if (EDITABLE.includes(row.status)) {
      await this.updateDraft(
        row.id,
        {
          taskDescription: payload.taskDescription,
          workScope: payload.workScope,
          locationNote: payload.locationNote,
          environmentalJson: payload.environmentalJson,
        },
        payload.actorId,
      );

      if (payload.hazards?.length) {
        await this.prisma.jhaFlhaControl.deleteMany({
          where: { jhaFlhaId: row.id },
        });
        await this.prisma.jhaFlhaHazard.deleteMany({
          where: { jhaFlhaId: row.id },
        });
        const hazardIds: string[] = [];
        for (const h of payload.hazards) {
          const created = await this.addHazard(row.id, h, payload.actorId);
          hazardIds.push(created.id);
        }
        for (const c of payload.controls ?? []) {
          const hazardId =
            c.hazardIndex != null && hazardIds[c.hazardIndex]
              ? hazardIds[c.hazardIndex]
              : undefined;
          await this.addControl(
            row.id,
            {
              description: c.description,
              controlType: c.controlType ?? 'engineering',
              hazardId,
            },
            payload.actorId,
          );
        }
      }

      if (payload.energySources?.length) {
        await this.setEnergySources(
          row.id,
          payload.energySources.map((s) => ({
            energyType: s.energyType as JhaEnergyType,
            exposureLevel: s.exposureLevel ?? 3,
          })),
          payload.actorId,
        );
      }

      if (payload.equipment?.length) {
        await this.setEquipment(row.id, payload.equipment, payload.actorId);
      }

      if (payload.workers?.length) {
        await this.setCrew(row.id, payload.workers, payload.actorId);
      }
    }

    if (payload.signatures?.length) {
      for (const sig of payload.signatures) {
        await this.sign(row.id, {
          role: sig.role,
          signatureData: sig.signatureData,
          signerName: sig.signerName,
          signerUserId: payload.actorId,
          workerId: sig.workerId,
        });
      }
    }

    if (payload.submit) {
      return this.submit(row.id, payload.actorId);
    }
    return this.getById(row.id);
  }

  private async assertEditable(id: string) {
    const row = await this.prisma.jhaFlha.findUnique({ where: { id } });
    if (!row || !EDITABLE.includes(row.status)) {
      throw new BadRequestException('JHA/FLHA is not editable');
    }
  }

  private async buildEvaluation(row: Awaited<ReturnType<typeof this.getById>>) {
    const env = (row.environmentalJson ?? {}) as Record<string, unknown>;
    const workersSigned = row.workers.filter((w) => w.signedAt).length;
    const equipmentUnauthorized = row.equipmentLinks.filter(
      (e) => !e.authorized,
    ).length;

    return this.scoring.evaluate({
      hazards: row.hazards.map((h) => ({
        id: h.id,
        description: h.description,
        severity: h.severity,
        likelihood: h.likelihood,
        riskScore: h.riskScore,
        energyTypes: h.energyTypes,
        sifIndicator: h.sifIndicator,
        category: h.category,
      })),
      controls: row.controls.map((c) => ({
        id: c.id,
        hazardId: c.hazardId,
        controlType: c.controlType,
        adequate: c.adequate,
        effectivenessScore: c.effectivenessScore,
        ppeRequired: c.ppeRequired,
        verified: c.verified,
      })),
      energySources: row.energySources.map((e) => ({
        energyType: e.energyType,
        exposureLevel: e.exposureLevel,
      })),
      environmentalJson: env,
      workersCount: row.workers.length,
      workersSigned,
      newWorkerPresent: false,
      equipmentUnauthorized,
    });
  }

  private async recomputeScores(jhaFlhaId: string) {
    const row = await this.getById(jhaFlhaId);
    const evaluation = await this.buildEvaluation(row);
    await this.prisma.jhaFlha.update({
      where: { id: jhaFlhaId },
      data: {
        riskScore: evaluation.riskScore,
        taskRiskScore: evaluation.taskRiskScore,
        sifScore: evaluation.sifScore,
        sifPotential: evaluation.sifPotential,
        highEnergyFlag: evaluation.highEnergyFlag,
        qualityScore: evaluation.qualityScore,
        requiresSupervisorReview: evaluation.requiresSupervisorReview,
        controlsAdequate: evaluation.controlsAdequate,
      },
    });
  }

  private async snapshotVersion(
    jhaFlhaId: string,
    actorId?: number,
    changeReason?: string,
  ) {
    const row = await this.getById(jhaFlhaId);
    const versionNumber = row.currentVersion;
    await this.prisma.jhaFlhaVersion.create({
      data: {
        jhaFlhaId,
        versionNumber,
        snapshotJson: row as unknown as Prisma.InputJsonValue,
        changedByUserId: actorId,
        changeReason,
      },
    });
    await this.prisma.jhaFlha.update({
      where: { id: jhaFlhaId },
      data: { currentVersion: versionNumber + 1 },
    });
  }
}
