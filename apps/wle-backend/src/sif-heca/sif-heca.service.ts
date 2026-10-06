import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  Prisma,
  SifHecaEventStatus,
  SifHecaSourceType,
  SifPotentialCategory,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifScoringEngine } from './sif-scoring.engine';
import { HecaClassificationEngine } from './heca-classification.engine';
import { ControlEffectivenessEngine } from './control-effectiveness.engine';
import { CsraHecaEngine } from './csra-heca.engine';
import { SifHecaCailService } from './sif-heca-cail.service';
import {
  SifHecaScopeAnalysisService,
  type SifHecaScopeInput,
} from './sif-heca-scope-analysis.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import {
  HECA_CATEGORIES,
  SIF_ENERGY_WHEEL,
  SIF_INDICATORS,
} from './sif-heca.constants';

@Injectable()
export class SifHecaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sifEngine: SifScoringEngine,
    private readonly hecaEngine: HecaClassificationEngine,
    private readonly controlEngine: ControlEffectivenessEngine,
    private readonly csraEngine: CsraHecaEngine,
    private readonly cail: SifHecaCailService,
    private readonly scopeAnalysis: SifHecaScopeAnalysisService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
  ) {}

  private async audit(
    eventId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.sifHecaAuditLog.create({
      data: {
        eventId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async ensureLibraries(companyId: number, projectId?: number) {
    for (const ind of SIF_INDICATORS) {
      const exists = await this.prisma.sifIndicatorLibrary.findFirst({
        where: { companyId, code: ind.code, projectId: projectId ?? null },
      });
      if (!exists) {
        await this.prisma.sifIndicatorLibrary.create({
          data: {
            companyId,
            projectId,
            code: ind.code,
            label: ind.label,
            weight: ind.weight,
          },
        });
      }
    }
    for (const cat of HECA_CATEGORIES) {
      const exists = await this.prisma.hecaCategoryLibrary.findFirst({
        where: { companyId, code: cat.code, projectId: projectId ?? null },
      });
      if (!exists) {
        await this.prisma.hecaCategoryLibrary.create({
          data: {
            companyId,
            projectId,
            code: cat.code,
            label: cat.label,
            keywordPatterns: cat.keywords as Prisma.InputJsonValue,
            energyTypes: cat.energyTypes as Prisma.InputJsonValue,
          },
        });
      }
    }
  }

  async evaluateDryRun(input: {
    title: string;
    description?: string;
    companyId: number;
    projectId: number;
    scoringInput: {
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate: boolean | null;
        effectivenessScore: number | null;
        verified: boolean;
        ppeRequired: boolean;
      }>;
    };
  }) {
    await this.ensureLibraries(input.companyId, input.projectId);
    const hazardRisk =
      input.scoringInput.hazardSeverity * input.scoringInput.hazardLikelihood;
    const controlEval = this.controlEngine.evaluate(
      hazardRisk,
      input.scoringInput.controls ?? [],
    );
    const sifOut = this.sifEngine.score({
      hazardSeverity: input.scoringInput.hazardSeverity,
      hazardLikelihood: input.scoringInput.hazardLikelihood,
      energyTypes: input.scoringInput.energyTypes,
      controlStrength: controlEval.controlStrength,
      workerCompetencyGap: false,
      equipmentConditionPoor: false,
      environmentRisk: false,
      historicalIncidents12mo: 0,
      missingControls: controlEval.missingControls,
      weakControls: controlEval.weakControls,
    });
    const hecaOut = this.hecaEngine.classify({
      description: input.description ?? input.title,
      energyTypes: input.scoringInput.energyTypes,
      categories: HECA_CATEGORIES.map((c) => ({
        code: c.code,
        label: c.label,
        keywordPatterns: [...c.keywords],
        energyTypes: [...c.energyTypes],
        severityDefault: 3,
      })),
    });
    const csra = this.csraEngine.assess({
      title: input.title,
      description: input.description,
      energyTypes: input.scoringInput.energyTypes,
      exposureLevel: Math.min(
        5,
        Math.max(1, input.scoringInput.hazardLikelihood),
      ) as 1 | 2 | 3 | 4 | 5,
      controls: (input.scoringInput.controls ?? []).map((c) => ({
        controlType: c.controlType,
        adequate: c.adequate,
        effectivenessScore: c.effectivenessScore,
        verified: c.verified,
        energyTypes: input.scoringInput.energyTypes,
      })),
      sifHint: {
        score: sifOut.sifScore,
        category: sifOut.sifCategory,
      },
    });
    return {
      sif_score: sifOut.sifScore,
      sif_category: sifOut.sifCategory,
      heca_category: hecaOut.hecaCategoryCode,
      heca_category_label: hecaOut.hecaCategoryLabel,
      heca_risk_score: hecaOut.hecaRiskScore,
      high_energy_flag: hecaOut.highEnergyFlag || csra.highEnergySources.some((e) => e.highEnergy),
      requires_supervisor_review:
        sifOut.requiresSupervisorReview ||
        csra.sifPotential.requiresSupervisorReview,
      required_controls: [
        ...sifOut.requiredControls,
        ...hecaOut.requiredControls,
        ...csra.recommendations
          .filter((r) => r.controlClass === 'direct')
          .map((r) => r.description),
      ],
      required_corrective_actions: [
        ...sifOut.requiredActions,
        ...hecaOut.requiredCorrective,
      ],
      explainability: {
        sif: sifOut.explainability,
        heca: hecaOut.explainability,
        csra: csra.controls.findings.map((detail) => ({
          rule: 'csra',
          detail,
        })),
      },
      control_findings: [
        ...controlEval.findings,
        ...csra.controls.findings,
      ],
      csra,
    };
  }

  /** Full CSRA HECA assessment + document (standalone or with declared inputs). */
  async assessCsra(input: {
    companyId: number;
    projectId: number;
    title: string;
    description?: string;
    workScope?: string;
    locationNote?: string;
    environmentNote?: string;
    equipmentNote?: string;
    energyTypes?: string[];
    exposureLevel?: 1 | 2 | 3 | 4 | 5;
    proximity?: 'contact' | 'near' | 'zone' | 'remote';
    controls?: Array<{
      description?: string;
      controlType: string;
      adequate?: boolean | null;
      effectivenessScore?: number | null;
      verified?: boolean;
      energyTypes?: string[];
    }>;
  }) {
    await this.ensureLibraries(input.companyId, input.projectId);
    const csra = this.csraEngine.assess({
      title: input.title,
      description: input.description,
      workScope: input.workScope,
      locationNote: input.locationNote,
      environmentNote: input.environmentNote,
      equipmentNote: input.equipmentNote,
      energyTypes: input.energyTypes,
      exposureLevel: input.exposureLevel,
      proximity: input.proximity,
      controls: input.controls,
    });
    return csra;
  }

  /** AI + catalog reverse-engineering of hazards/controls from job scope, then SIF/HECA/CSRA scoring */
  async analyzeScope(input: SifHecaScopeInput) {
    const analysis = await this.scopeAnalysis.analyze(input);
    const controls = analysis.inferred_controls.map((c) => ({
      controlType: c.control_type,
      adequate: true,
      effectivenessScore: 4,
      verified: false,
      ppeRequired: c.control_type === 'ppe',
    }));
    const evaluation = await this.evaluateDryRun({
      companyId: input.companyId,
      projectId: input.projectId,
      title: input.title,
      description: [
        input.jobDescription,
        input.workScope,
        input.locationNote,
        input.environmentNote,
      ]
        .filter(Boolean)
        .join(' — '),
      scoringInput: {
        hazardSeverity: analysis.max_severity,
        hazardLikelihood: analysis.max_likelihood,
        energyTypes: analysis.energy_types,
        controls,
      },
    });

    // Enrich CSRA with full scope context for the assessment document
    const csra = this.csraEngine.assess({
      title: input.title,
      description: input.jobDescription,
      workScope: input.workScope,
      locationNote: input.locationNote,
      environmentNote: input.environmentNote,
      equipmentNote: input.equipmentNote,
      energyTypes: analysis.energy_types,
      exposureLevel: Math.min(
        5,
        Math.max(1, analysis.max_likelihood),
      ) as 1 | 2 | 3 | 4 | 5,
      controls: analysis.inferred_controls.map((c) => ({
        description: c.description,
        controlType: c.control_type,
        adequate: true,
        effectivenessScore: 4,
        verified: false,
        energyTypes: analysis.energy_types,
      })),
      sifHint: {
        score: evaluation.sif_score,
        category: evaluation.sif_category,
        indicators: analysis.sif_protocol.indicators,
      },
    });

    return {
      analysis,
      evaluation: { ...evaluation, csra },
      csra,
    };
  }

  async ingest(input: {
    companyId: number;
    projectId: number;
    siteId?: number;
    workerId?: number;
    equipmentId?: number;
    sourceType: SifHecaSourceType;
    sourceId: string;
    sourceItemId?: string;
    title: string;
    description?: string;
    rawPayload?: Record<string, unknown>;
    scoringInput: {
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate: boolean | null;
        effectivenessScore: number | null;
        verified: boolean;
        ppeRequired: boolean;
      }>;
    };
    actorId?: number;
  }) {
    await this.ensureLibraries(input.companyId, input.projectId);

    const sourceItemId = input.sourceItemId ?? '';
    let event = await this.prisma.sifHecaEvent.findUnique({
      where: {
        sourceType_sourceId_sourceItemId: {
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          sourceItemId,
        },
      },
    });

    if (!event) {
      event = await this.prisma.sifHecaEvent.create({
        data: {
          companyId: input.companyId,
          projectId: input.projectId,
          siteId: input.siteId,
          workerId: input.workerId,
          equipmentId: input.equipmentId,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          sourceItemId,
          title: input.title,
          description: input.description,
          rawPayload: (input.rawPayload ?? {}) as Prisma.InputJsonValue,
        },
      });
      await this.audit(event.id, 'ingested', input.actorId);
    }

    return this.scoreEvent(event.id, input.scoringInput, input.actorId);
  }

  async scoreEvent(
    eventId: string,
    scoringInput: {
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate: boolean | null;
        effectivenessScore: number | null;
        verified: boolean;
        ppeRequired: boolean;
      }>;
    },
    actorId?: number,
  ) {
    const event = await this.getEvent(eventId);
    const hazardRisk =
      scoringInput.hazardSeverity * scoringInput.hazardLikelihood;

    const controlEval = this.controlEngine.evaluate(
      hazardRisk,
      scoringInput.controls ?? [],
    );

    const incidentCount = event.workerId
      ? await this.prisma.incident.count({
          where: {
            workerId: event.workerId,
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
        })
      : 0;

    const env = (
      event.rawPayload as { environmentalJson?: Record<string, unknown> }
    )?.environmentalJson;
    const environmentRisk =
      !!env &&
      ['ice', 'storm', 'extreme', 'wind'].some((w) =>
        String(env.weather ?? '')
          .toLowerCase()
          .includes(w),
      );

    const sifOut = this.sifEngine.score({
      hazardSeverity: scoringInput.hazardSeverity,
      hazardLikelihood: scoringInput.hazardLikelihood,
      energyTypes: scoringInput.energyTypes,
      controlStrength: controlEval.controlStrength,
      workerCompetencyGap: false,
      equipmentConditionPoor: false,
      environmentRisk,
      historicalIncidents12mo: incidentCount,
      missingControls: controlEval.missingControls,
      weakControls: controlEval.weakControls,
    });

    const hecaCats = await this.prisma.hecaCategoryLibrary.findMany({
      where: {
        active: true,
        OR: [
          { companyId: event.companyId, projectId: null },
          { companyId: event.companyId, projectId: event.projectId },
        ],
      },
    });

    const hecaOut = this.hecaEngine.classify({
      description: event.description ?? event.title,
      energyTypes: scoringInput.energyTypes,
      categories: hecaCats.map((c) => ({
        code: c.code,
        label: c.label,
        keywordPatterns: c.keywordPatterns as string[],
        energyTypes: c.energyTypes as string[],
        severityDefault: c.severityDefault,
      })),
    });

    await this.prisma.sifScore.upsert({
      where: { eventId },
      create: {
        eventId,
        sifScore: sifOut.sifScore,
        sifCategory: sifOut.sifCategory as SifPotentialCategory,
        severityComponent: sifOut.severityComponent,
        likelihoodComponent: sifOut.likelihoodComponent,
        energyComponent: sifOut.energyComponent,
        controlComponent: sifOut.controlComponent,
        competencyComponent: sifOut.competencyComponent,
        equipmentComponent: sifOut.equipmentComponent,
        environmentComponent: sifOut.environmentComponent,
        historyComponent: sifOut.historyComponent,
        requiresSupervisorReview: sifOut.requiresSupervisorReview,
        requiredControls: sifOut.requiredControls as Prisma.InputJsonValue,
        requiredActions: sifOut.requiredActions as Prisma.InputJsonValue,
        explainability: sifOut.explainability as Prisma.InputJsonValue,
      },
      update: {
        version: { increment: 1 },
        sifScore: sifOut.sifScore,
        sifCategory: sifOut.sifCategory as SifPotentialCategory,
        severityComponent: sifOut.severityComponent,
        likelihoodComponent: sifOut.likelihoodComponent,
        energyComponent: sifOut.energyComponent,
        controlComponent: sifOut.controlComponent,
        competencyComponent: sifOut.competencyComponent,
        equipmentComponent: sifOut.equipmentComponent,
        environmentComponent: sifOut.environmentComponent,
        historyComponent: sifOut.historyComponent,
        requiresSupervisorReview: sifOut.requiresSupervisorReview,
        requiredControls: sifOut.requiredControls as Prisma.InputJsonValue,
        requiredActions: sifOut.requiredActions as Prisma.InputJsonValue,
        explainability: sifOut.explainability as Prisma.InputJsonValue,
        computedAt: new Date(),
      },
    });

    await this.prisma.hecaScore.upsert({
      where: { eventId },
      create: {
        eventId,
        hecaCategoryCode: hecaOut.hecaCategoryCode,
        hecaCategoryLabel: hecaOut.hecaCategoryLabel,
        severity: hecaOut.severity,
        likelihood: hecaOut.likelihood,
        hecaRiskScore: hecaOut.hecaRiskScore,
        highEnergyFlag: hecaOut.highEnergyFlag,
        requiredControls: hecaOut.requiredControls as Prisma.InputJsonValue,
        requiredCorrective: hecaOut.requiredCorrective as Prisma.InputJsonValue,
        explainability: hecaOut.explainability as Prisma.InputJsonValue,
      },
      update: {
        version: { increment: 1 },
        hecaCategoryCode: hecaOut.hecaCategoryCode,
        hecaCategoryLabel: hecaOut.hecaCategoryLabel,
        severity: hecaOut.severity,
        likelihood: hecaOut.likelihood,
        hecaRiskScore: hecaOut.hecaRiskScore,
        highEnergyFlag: hecaOut.highEnergyFlag,
        requiredControls: hecaOut.requiredControls as Prisma.InputJsonValue,
        requiredCorrective: hecaOut.requiredCorrective as Prisma.InputJsonValue,
        explainability: hecaOut.explainability as Prisma.InputJsonValue,
        computedAt: new Date(),
      },
    });

    const status: SifHecaEventStatus = sifOut.requiresSupervisorReview
      ? 'review_required'
      : 'scored';

    await this.prisma.sifHecaEvent.update({
      where: { id: eventId },
      data: { status },
    });

    if (
      sifOut.sifCategory === 'high' ||
      sifOut.sifCategory === 'critical' ||
      controlEval.missingControls > 0
    ) {
      const full = await this.getEvent(eventId);
      let pmCapaId: string | undefined;
      if (
        this.capaAuto &&
        (sifOut.sifCategory === 'high' || sifOut.sifCategory === 'critical')
      ) {
        const capa = await this.capaAuto.fromSifHecaEvent(
          eventId,
          actorId ?? 0,
        );
        pmCapaId = capa?.id;
      }
      await this.generateCorrectiveActions(
        full,
        sifOut,
        hecaOut,
        actorId,
        pmCapaId,
      );
    }

    await this.audit(eventId, 'scored', actorId, {
      sifScore: sifOut.sifScore,
      hecaCategory: hecaOut.hecaCategoryCode,
    });

    return this.getEvent(eventId);
  }

  async getEvent(id: string) {
    const event = await this.prisma.sifHecaEvent.findFirst({
      where: { id, deletedAt: null },
      include: {
        sifScore: true,
        hecaScore: true,
        correctiveActions: true,
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!event) throw new NotFoundException('SIF/HECA event not found');
    return event;
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: SifHecaEventStatus;
    workerId?: number;
  }) {
    return this.prisma.sifHecaEvent.findMany({
      where: {
        deletedAt: null,
        projectId: filters.projectId,
        companyId: filters.companyId,
        status: filters.status,
        workerId: filters.workerId,
      },
      include: { sifScore: true, hecaScore: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async supervisorReview(
    eventId: string,
    action: 'approve' | 'reject' | 'request_changes',
    actorId?: number,
    notes?: string,
  ) {
    const event = await this.getEvent(eventId);
    if (event.status !== 'review_required' && event.status !== 'scored') {
      throw new BadRequestException('Event not in review state');
    }

    const status: SifHecaEventStatus =
      action === 'approve'
        ? 'approved'
        : action === 'reject'
        ? 'rejected'
        : 'ingested';

    await this.prisma.sifHecaEvent.update({
      where: { id: eventId },
      data: { status },
    });
    await this.audit(eventId, `review_${action}`, actorId, { notes });
    return this.getEvent(eventId);
  }

  async workerAccessCheck(workerId: number, projectId: number) {
    const openCritical = await this.prisma.sifHecaEvent.count({
      where: {
        workerId,
        projectId,
        status: { in: ['review_required', 'scored'] },
        sifScore: { sifCategory: { in: ['high', 'critical'] } },
      },
    });
    const openCapa = await this.prisma.sifHecaCorrectiveAction.count({
      where: {
        event: { workerId, projectId },
        status: 'open',
      },
    });
    return {
      allowed: openCritical === 0 && openCapa === 0,
      openCriticalEvents: openCritical,
      openCorrectiveActions: openCapa,
    };
  }

  async listIndicators(companyId: number, projectId?: number) {
    await this.ensureLibraries(companyId, projectId);
    return this.prisma.sifIndicatorLibrary.findMany({
      where: {
        active: true,
        OR: [
          { companyId, projectId: null },
          { companyId, projectId: projectId ?? undefined },
        ],
      },
    });
  }

  getEnergyWheel() {
    return { segments: SIF_ENERGY_WHEEL };
  }

  async listHecaCategories(companyId: number, projectId?: number) {
    await this.ensureLibraries(companyId, projectId);
    return this.prisma.hecaCategoryLibrary.findMany({
      where: {
        active: true,
        OR: [
          { companyId, projectId: null },
          { companyId, projectId: projectId ?? undefined },
        ],
      },
    });
  }

  async projectAnalytics(projectId: number) {
    const since90 = new Date(Date.now() - 90 * 86400000);
    const events = await this.prisma.sifHecaEvent.findMany({
      where: { projectId, deletedAt: null },
      include: { sifScore: true, hecaScore: true },
      take: 500,
    });
    const recent = events.filter((e) => e.createdAt >= since90);

    const byCategory: Record<string, number> = {};
    let sifHigh = 0;
    let highEnergy = 0;
    for (const e of events) {
      if (
        e.sifScore?.sifCategory === 'high' ||
        e.sifScore?.sifCategory === 'critical'
      ) {
        sifHigh++;
      }
      if (e.hecaScore?.highEnergyFlag) highEnergy++;
      const code = e.hecaScore?.hecaCategoryCode ?? 'unknown';
      byCategory[code] = (byCategory[code] ?? 0) + 1;
    }

    const avgSif =
      events.length > 0
        ? Math.round(
            events.reduce((s, e) => s + (e.sifScore?.sifScore ?? 0), 0) /
              events.length,
          )
        : 0;

    const bySource: Record<string, number> = {};
    for (const e of events) {
      bySource[e.sourceType] = (bySource[e.sourceType] ?? 0) + 1;
    }

    return {
      projectId,
      totalEvents: events.length,
      events90d: recent.length,
      sifHighCount: sifHigh,
      highEnergyCount: highEnergy,
      averageSifScore: avgSif,
      hecaDistribution: byCategory,
      sourceDistribution: bySource,
      projectSifScore: Math.min(100, avgSif + sifHigh * 5),
      leadingIndicators: {
        sifRatePct:
          events.length > 0 ? Math.round((sifHigh / events.length) * 100) : 0,
        highEnergyRatePct:
          events.length > 0
            ? Math.round((highEnergy / events.length) * 100)
            : 0,
        events90d: recent.length,
      },
      laggingIndicators: {
        reviewRequired: events.filter((e) => e.status === 'review_required')
          .length,
        openCorrective: await this.prisma.sifHecaCorrectiveAction.count({
          where: { event: { projectId }, status: 'open' },
        }),
      },
    };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    companyId: number;
    projectId: number;
    siteId?: number;
    workerId?: number;
    assessmentKind?: 'SIF' | 'HECA';
    sourceType?: SifHecaSourceType;
    sourceId?: string;
    sourceItemId?: string;
    title: string;
    description?: string;
    jobDescription?: string;
    workScope?: string;
    locationNote?: string;
    environmentNote?: string;
    equipmentNote?: string;
    hazards?: Array<{
      description: string;
      severity?: number;
      likelihood?: number;
      energyTypes?: string[];
    }>;
    controls?: Array<{
      description?: string;
      controlType?: string;
      adequate?: boolean;
      effectivenessScore?: number;
    }>;
    energyTypes?: string[];
    scoringInput?: {
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate?: boolean;
        effectivenessScore?: number;
        verified?: boolean;
        ppeRequired?: boolean;
      }>;
    };
    submit?: boolean;
    actorId?: number;
  }) {
    const hazards = payload.hazards ?? [];
    const hazardSeverity =
      payload.scoringInput?.hazardSeverity ??
      (hazards.length ? Math.max(...hazards.map((h) => h.severity ?? 3)) : 3);
    const hazardLikelihood =
      payload.scoringInput?.hazardLikelihood ??
      (hazards.length ? Math.max(...hazards.map((h) => h.likelihood ?? 3)) : 3);
    const energyFromHazards = hazards.flatMap((h) => h.energyTypes ?? []);
    const energyTypes =
      payload.scoringInput?.energyTypes ??
      (payload.energyTypes?.length
        ? payload.energyTypes
        : energyFromHazards.length
        ? [...new Set(energyFromHazards)]
        : ['mechanical']);

    const description =
      payload.description ??
      [
        payload.jobDescription,
        payload.workScope,
        payload.locationNote,
        payload.environmentNote,
        payload.equipmentNote,
      ]
        .filter(Boolean)
        .join(' — ');

    const mappedControls = (
      payload.scoringInput?.controls ??
      (payload.controls ?? []).map((c) => ({
        controlType: c.controlType ?? 'engineering',
        adequate: c.adequate ?? true,
        effectivenessScore: c.effectivenessScore ?? 4,
        verified: false,
        ppeRequired: (c.controlType ?? '').toLowerCase() === 'ppe',
      }))
    ).map((c) => ({
      controlType: c.controlType,
      adequate: c.adequate ?? true,
      effectivenessScore: c.effectivenessScore ?? 4,
      verified: c.verified ?? false,
      ppeRequired: c.ppeRequired ?? false,
    }));

    const rawPayload = {
      clientSyncId: payload.clientSyncId,
      assessmentKind: payload.assessmentKind,
      jobDescription: payload.jobDescription,
      workScope: payload.workScope,
      locationNote: payload.locationNote,
      environmentNote: payload.environmentNote,
      equipmentNote: payload.equipmentNote,
      hazards: payload.hazards,
      controls: payload.controls,
      energyTypes,
      source: 'field_offline',
    };

    return this.ingest({
      companyId: payload.companyId,
      projectId: payload.projectId,
      siteId: payload.siteId,
      workerId: payload.workerId,
      sourceType: payload.sourceType ?? 'general',
      sourceId: payload.sourceId ?? payload.clientSyncId,
      sourceItemId: payload.sourceItemId ?? payload.clientSyncId,
      title: payload.title,
      description: description || payload.title,
      rawPayload,
      scoringInput: {
        hazardSeverity,
        hazardLikelihood,
        energyTypes,
        controls: mappedControls,
      },
      actorId: payload.actorId,
    });
  }

  private async generateCorrectiveActions(
    event: {
      id: string;
      projectId: number;
      companyId: number;
      siteId: number | null;
      workerId: number | null;
    },
    sifOut: { requiredActions: string[]; sifCategory: string },
    hecaOut: { requiredCorrective: string[] },
    actorId?: number,
    pmCorrectiveActionId?: string,
  ) {
    const titles = [...sifOut.requiredActions, ...hecaOut.requiredCorrective];
    if (!titles.length) return;

    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { companyId: true },
    });
    const ownerCompanyId = project?.companyId ?? event.companyId;

    const cailEntries = await this.cail.emitCorrectiveActions(
      event.id,
      event.projectId,
      ownerCompanyId,
      titles.map((t) => ({
        title: t,
        severity:
          sifOut.sifCategory === 'critical'
            ? ('critical' as const)
            : ('high' as const),
      })),
      actorId,
      event.siteId ?? undefined,
      event.workerId ?? undefined,
    );

    for (let i = 0; i < titles.length; i++) {
      await this.prisma.sifHecaCorrectiveAction.create({
        data: {
          eventId: event.id,
          title: titles[i]!.slice(0, 120),
          description: titles[i],
          cailEntryId: cailEntries[i]?.id,
          correctiveActionId: i === 0 ? pmCorrectiveActionId : undefined,
          status: 'open',
          dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    }
  }
}
