import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CailIntelEntityType,
  CailIntelInferenceMode,
  CailIntelPredictionType,
  CailIntelScoreType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TtlCache } from '../common/ttl-cache';
import { CailRuleBasedEngine } from './engines/rule-based.engine';
import { CailScoringEngine } from './engines/scoring.engine';
import { CailPredictiveEngine } from './engines/predictive.engine';
import { CailPatternRecognitionEngine } from './engines/pattern-recognition.engine';
import { CailCorrelationEngine } from './engines/correlation.engine';
import { CailRecommendationEngine } from './engines/recommendation.engine';
import { CailExplainabilityEngine } from './engines/explainability.engine';
import { CailSafetyGatingEngine } from './engines/safety-gating.engine';
import { CailDataIngestionEngine } from './engines/data-ingestion.engine';

const MODEL_KEY = 'deterministic_rules_v1';

@Injectable()
export class PmUnifiedSafetyIntelligenceService {
  private readonly rules = new CailRuleBasedEngine();
  private readonly scoring = new CailScoringEngine();
  private readonly predictive = new CailPredictiveEngine();
  private readonly patterns = new CailPatternRecognitionEngine();
  private readonly correlations = new CailCorrelationEngine();
  private readonly recommendations = new CailRecommendationEngine();
  private readonly explainability = new CailExplainabilityEngine();
  private readonly gating = new CailSafetyGatingEngine();
  private readonly ingestion = new CailDataIngestionEngine();
  private readonly dashboardCache = new TtlCache<Record<string, unknown>>(
    Number(process.env.VERA_CAIL_DASHBOARD_TTL_MS ?? 60_000),
    300,
  );
  private readonly signalsCache = new TtlCache<Record<string, unknown>>(
    Number(process.env.VERA_CAIL_SIGNALS_TTL_MS ?? 30_000),
    300,
  );

  constructor(private readonly prisma: PrismaService) {}

  private mapRecommendationType(
    type: string,
  ): import('@prisma/client').CailIntelRecommendationType {
    const map: Record<
      string,
      import('@prisma/client').CailIntelRecommendationType
    > = {
      control: 'control',
      training: 'training',
      corrective_action: 'corrective_action',
      equipment_maintenance: 'equipment_maintenance',
      jha_improvement: 'jha_improvement',
      inspection_focus: 'inspection_focus',
      emergency_plan: 'emergency_plan',
      sds_update: 'sds_update',
      worker_assignment: 'worker_assignment',
      equipment_assignment: 'equipment_assignment',
      pm_schedule_adjustment: 'pm_schedule_adjustment',
    };
    return map[type] ?? 'corrective_action';
  }

  private async logInference(
    companyId: number,
    projectId: number | undefined,
    mode: CailIntelInferenceMode,
    layer: string,
    summary: string,
    durationMs: number,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.cailInferenceLog.create({
      data: {
        companyId,
        projectId,
        inferenceMode: mode,
        engineLayer: layer,
        outputSummary: summary,
        durationMs,
        actorId,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  async ensureDefaultModel(companyId: number, actorId?: number) {
    const existing = await this.prisma.cailModel.findFirst({
      where: { companyId, modelKey: MODEL_KEY, deletedAt: null },
    });
    if (existing) return existing;

    const model = await this.prisma.cailModel.create({
      data: {
        companyId,
        modelKey: MODEL_KEY,
        name: 'Deterministic Safety Rules v1',
        description:
          'Rule-based + scoring engine with zero-hallucination outputs',
        status: 'deployed',
        activeVersion: 1,
      },
    });
    await this.prisma.cailModelVersion.create({
      data: {
        modelId: model.id,
        version: 1,
        algorithm: MODEL_KEY,
        deployedAt: new Date(),
      },
    });
    await this.prisma.cailModelAudit.create({
      data: {
        modelId: model.id,
        version: 1,
        eventType: 'deployed',
        actorId,
        payload: { reason: 'auto_provision' },
      },
    });
    return model;
  }

  async getDashboard(filters: { companyId: number; projectId?: number }) {
    const cacheKey = `dash:${filters.companyId}:${filters.projectId ?? 'all'}`;
    const cached = this.dashboardCache.get(cacheKey);
    if (cached) return cached;

    const start = Date.now();
    await this.ensureDefaultModel(filters.companyId);

    const projectWhere = filters.projectId
      ? {
          companyId: filters.companyId,
          projectId: filters.projectId,
          deletedAt: null,
        }
      : { companyId: filters.companyId, deletedAt: null };

    const [predictions, scores, recommendations, correlations, patterns] =
      await Promise.all([
        this.prisma.cailPrediction.count({
          where: {
            ...projectWhere,
            createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
          },
        }),
        this.prisma.cailScore.findMany({
          where: { ...projectWhere },
          orderBy: { computedAt: 'desc' },
          take: 20,
        }),
        this.prisma.cailRecommendation.count({
          where: { ...projectWhere, status: 'open' },
        }),
        this.prisma.cailCorrelation.count({ where: { ...projectWhere } }),
        this.prisma.cailInferenceLog.count({
          where: {
            companyId: filters.companyId,
            engineLayer: 'pattern',
            createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
          },
        }),
      ]);

    const companyScore = scores.find(
      (s) => s.scoreType === 'company_safety' && s.entityType === 'company',
    );
    const projectScore = filters.projectId
      ? scores.find(
          (s) =>
            s.scoreType === 'project_safety' &&
            s.entityType === 'project' &&
            s.entityId === String(filters.projectId),
        )
      : null;

    await this.logInference(
      filters.companyId,
      filters.projectId,
      'realtime',
      'dashboard',
      'dashboard_aggregate',
      Date.now() - start,
    );

    const result = {
      companyId: filters.companyId,
      projectId: filters.projectId ?? null,
      metrics: {
        predictions7d: predictions,
        openRecommendations: recommendations,
        correlations,
        patternRuns30d: patterns,
        companySafetyScore: companyScore?.score ?? null,
        projectSafetyScore: projectScore?.score ?? null,
      },
      modelKey: MODEL_KEY,
    };
    this.dashboardCache.set(cacheKey, result);
    return result;
  }

  async collectProjectSignals(projectId: number) {
    const cacheKey = `signals:${projectId}`;
    const cached = this.signalsCache.get(cacheKey);
    if (cached) return cached as Awaited<ReturnType<typeof this.collectProjectSignalsUncached>>;
    const signals = await this.collectProjectSignalsUncached(projectId);
    this.signalsCache.set(cacheKey, signals as unknown as Record<string, unknown>);
    return signals;
  }

  private async collectProjectSignalsUncached(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const since30 = new Date(Date.now() - 30 * 86400000);
    const since90 = new Date(Date.now() - 90 * 86400000);
    const openStatuses = {
      notIn: ['verified', 'closed', 'cancelled'] as Array<
        'verified' | 'closed' | 'cancelled'
      >,
    };

    const [
      openCapa,
      overdueCapa,
      criticalHazards,
      weakControls,
      expiredTraining,
      accessDenials,
      openIncidents,
      equipmentFailures,
      emergencyActive,
    ] = await Promise.all([
      this.prisma.pmCorrectiveAction.count({
        where: { projectId, deletedAt: null, status: openStatuses },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          deletedAt: null,
          status: openStatuses,
          dueAt: { lt: new Date() },
        },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: {
          projectId,
          deletedAt: null,
          severity: { gte: 4 },
          status: 'published',
        },
      }),
      this.prisma.pmUnifiedControl.count({
        where: {
          projectId,
          deletedAt: null,
          OR: [{ controlStrength: { lt: 3 } }, { hazardLinks: { none: {} } }],
        },
      }),
      this.prisma.pmWorkerSafetyTraining.count({
        where: {
          OR: [
            { status: { in: ['expired', 'missing', 'invalid'] } },
            { expiresAt: { lt: new Date() } },
          ],
          worker: {
            projectAssignments: { some: { projectId, status: 'ACTIVE' } },
          },
        },
      }),
      this.prisma.pmAccessAttempt.count({
        where: {
          projectId,
          decision: { in: ['denied', 'denied_with_reason'] },
          createdAt: { gte: since30 },
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          projectId,
          status: { notIn: ['closed', 'approved', 'locked'] },
        },
      }),
      this.prisma.pmEquipmentFailure.count({
        where: { projectId, status: { notIn: ['closed', 'verified'] } },
      }),
      this.prisma.pmSiteEmergencyLock.findFirst({
        where: { projectId, active: true },
      }),
    ]);

    return {
      companyId: project.companyId,
      projectId,
      openCapa,
      overdueCapa,
      criticalHazards,
      weakControls,
      expiredTraining,
      accessDenials30d: accessDenials,
      openIncidents,
      equipmentFailures,
      emergencyActive: !!emergencyActive,
      since30,
      since90,
    };
  }

  async runBatchInference(
    companyId: number,
    projectId: number,
    actorId?: number,
  ) {
    const start = Date.now();
    const signals = await this.collectProjectSignals(projectId);
    await this.ensureDefaultModel(companyId, actorId);

    const violations = this.rules.evaluate({
      openCapa: signals.openCapa,
      overdueCapa: signals.overdueCapa,
      criticalHazards: signals.criticalHazards,
      weakControls: signals.weakControls,
      expiredTraining: signals.expiredTraining,
      accessDenials30d: signals.accessDenials30d,
      openIncidents: signals.openIncidents,
      equipmentFailures: signals.equipmentFailures,
      emergencyActive: signals.emergencyActive,
    });

    const projectScoreResult = this.scoring.projectSafetyScore({
      openCapa: signals.openCapa,
      overdueCapa: signals.overdueCapa,
      criticalHazards: signals.criticalHazards,
      openIncidents: signals.openIncidents,
      closureRate:
        signals.openCapa > 0
          ? Math.max(0, 100 - signals.overdueCapa * 10)
          : 100,
    });

    await this.persistScore(
      companyId,
      projectId,
      'project',
      String(projectId),
      'project_safety',
      projectScoreResult.score,
      projectScoreResult.components,
      'batch',
    );

    const projectRisk = this.predictive.projectRisk({
      projectScore: projectScoreResult.score,
      overdueCapa: signals.overdueCapa,
      emergencyActive: signals.emergencyActive,
    });
    await this.persistPrediction(
      companyId,
      projectId,
      'project',
      String(projectId),
      'project_risk',
      projectRisk,
      'batch',
    );

    const capaOverdue = this.predictive.capaOverdueRisk({
      openCount: signals.openCapa,
      overdueCount: signals.overdueCapa,
      avgDaysToDue: 7,
      escalationMax: 3,
    });
    await this.persistPrediction(
      companyId,
      projectId,
      'project',
      String(projectId),
      'capa_overdue',
      capaOverdue,
      'batch',
    );

    const repeatInsp = await this.prisma.pmCorrectiveAction.groupBy({
      by: ['sourceId'],
      where: { projectId, sourceModule: 'inspection', deletedAt: null },
      _count: true,
    });
    const driftPattern = this.patterns.projectSafetyDrift([
      projectScoreResult.score,
      projectScoreResult.score - 5,
    ]);
    const detectedPatterns = [
      ...this.patterns.repeatDeficiencies(
        repeatInsp
          .filter((r) => r._count >= 2)
          .map((r) => ({ sourceId: r.sourceId, count: r._count })),
      ),
      ...(driftPattern ? [driftPattern] : []),
    ].filter(Boolean);

    const recs = [
      ...this.recommendations.fromViolations(violations),
      ...this.recommendations.fromPatterns(detectedPatterns),
    ];
    for (const rec of recs.slice(0, 15)) {
      await this.persistRecommendation(companyId, projectId, rec);
    }

    const explain = this.explainability.forPrediction(
      'project_risk',
      projectRisk.probability,
      projectRisk.factors,
      ['corrective_actions', 'hazards', 'incidents', 'training', 'access_logs'],
    );
    await this.persistExplainability(
      companyId,
      projectId,
      explain,
      projectRisk.probability,
    );

    await this.ingestProjectData(companyId, projectId);

    await this.logInference(
      companyId,
      projectId,
      'batch',
      'orchestrator',
      `batch_complete violations=${violations.length} recs=${recs.length}`,
      Date.now() - start,
      actorId,
      { violations: violations.length, patterns: detectedPatterns.length },
    );

    return {
      projectId,
      violations,
      projectScore: projectScoreResult.score,
      predictions: [projectRisk, capaOverdue],
      recommendationsCreated: recs.length,
      patterns: detectedPatterns,
    };
  }

  async runRealtimeInference(body: {
    companyId: number;
    projectId: number;
    workerId?: number;
    equipmentId?: number;
    zoneCode?: string;
  }) {
    const start = Date.now();
    const signals = await this.collectProjectSignals(body.projectId);

    let workerScore = 100;
    let workerOverdue = 0;
    let workerCritical = 0;
    let sifExposures = 0;

    if (body.workerId) {
      const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
        where: { workerId: body.workerId },
      });
      workerScore = profile?.safetyScore ?? 75;
      const capa = await this.prisma.pmCorrectiveAction.findMany({
        where: {
          projectId: body.projectId,
          deletedAt: null,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
          OR: [
            { workerId: body.workerId },
            { assignees: { some: { workerId: body.workerId } } },
          ],
        },
      });
      workerOverdue = capa.filter(
        (c) => c.dueAt && c.dueAt < new Date(),
      ).length;
      workerCritical = capa.filter((c) => c.severityScore >= 75).length;
      sifExposures = await this.prisma.pmWorkerHazardExposure.count({
        where: { workerId: body.workerId, sifPotential: true },
      });

      const wScore = this.scoring.workerSafetyScore({
        profileScore: workerScore,
        overdueCapa: workerOverdue,
        denials30d: signals.accessDenials30d,
        sifExposures,
      });
      await this.persistScore(
        body.companyId,
        body.projectId,
        'worker',
        String(body.workerId),
        'worker_safety',
        wScore.score,
        wScore.components,
        'realtime',
      );

      const incidentPred = this.predictive.incidentLikelihood({
        workerScore: wScore.score,
        openCapa: workerOverdue + workerCritical,
        sifExposures,
        incidents90d: signals.openIncidents,
      });
      await this.persistPrediction(
        body.companyId,
        body.projectId,
        'worker',
        String(body.workerId),
        'incident_likelihood',
        incidentPred,
        'realtime',
      );
    }

    let equipmentScore = 100;
    let equipmentOpenCapa = 0;
    if (body.equipmentId) {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: body.equipmentId },
      });
      equipmentOpenCapa = await this.prisma.pmCorrectiveAction.count({
        where: {
          projectId: body.projectId,
          equipmentId: body.equipmentId,
          deletedAt: null,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      });
      const failures = await this.prisma.pmEquipmentFailure.count({
        where: {
          equipmentId: body.equipmentId,
          createdAt: { gte: signals.since90 },
        },
      });
      const eScore = this.scoring.equipmentSafetyScore({
        safetyStatus: eq?.safetyStatus ?? 'OK',
        lockoutStatus: eq?.lockoutStatus ?? 'CLEAR',
        openCapa: equipmentOpenCapa,
        failures90d: failures,
      });
      equipmentScore = eScore.score;
      await this.persistScore(
        body.companyId,
        body.projectId,
        'equipment',
        String(body.equipmentId),
        'equipment_safety',
        eScore.score,
        eScore.components,
        'realtime',
      );
    }

    const sifOpen = await this.prisma.pmUnifiedHazard.count({
      where: {
        projectId: body.projectId,
        sifPotential: true,
        status: 'published',
        deletedAt: null,
      },
    });

    const gate = this.gating.evaluate({
      workerScore,
      workerOverdueCapa: workerOverdue,
      workerCriticalCapa: workerCritical,
      equipmentScore,
      equipmentOpenCapa,
      projectCriticalCapa: signals.overdueCapa,
      emergencyActive: signals.emergencyActive,
      sifHazardOpen: sifOpen,
    });

    await this.logInference(
      body.companyId,
      body.projectId,
      'realtime',
      'realtime_gate',
      gate.allowed ? 'allowed' : gate.blockers.join(';'),
      Date.now() - start,
    );

    return { gate, workerScore, equipmentScore, modelKey: MODEL_KEY };
  }

  async evaluateSafetyGate(body: {
    companyId: number;
    projectId: number;
    workerId?: number;
    equipmentId?: number;
  }) {
    const rt = await this.runRealtimeInference(body);
    return rt.gate;
  }

  private async persistScore(
    companyId: number,
    projectId: number | undefined,
    entityType: CailIntelEntityType,
    entityId: string,
    scoreType: CailIntelScoreType,
    score: number,
    components: unknown,
    mode: CailIntelInferenceMode,
  ) {
    await this.prisma.cailScore.create({
      data: {
        companyId,
        projectId,
        entityType,
        entityId,
        scoreType,
        score,
        componentsJson: components as Prisma.InputJsonValue,
        modelKey: MODEL_KEY,
        inferenceMode: mode,
      },
    });
  }

  private async persistPrediction(
    companyId: number,
    projectId: number,
    entityType: CailIntelEntityType,
    entityId: string,
    predictionType: CailIntelPredictionType,
    pred: { probability: number; riskLevel: string; factors: string[] },
    mode: CailIntelInferenceMode,
  ) {
    await this.prisma.cailPrediction.create({
      data: {
        companyId,
        projectId,
        entityType,
        entityId,
        predictionType,
        probability: pred.probability,
        riskLevel: pred.riskLevel,
        factorsJson: pred.factors,
        modelKey: MODEL_KEY,
        inferenceMode: mode,
        validUntil: new Date(Date.now() + 7 * 86400000),
      },
    });
  }

  private async persistRecommendation(
    companyId: number,
    projectId: number,
    rec: {
      recommendationType: string;
      title: string;
      reason: string;
      evidence: string[];
      confidence: number;
      requiredActions: string[];
    },
  ) {
    await this.prisma.cailRecommendation.create({
      data: {
        companyId,
        projectId,
        recommendationType: this.mapRecommendationType(rec.recommendationType),
        title: rec.title,
        reason: rec.reason,
        evidenceJson: rec.evidence,
        confidence: rec.confidence,
        requiredActionsJson: rec.requiredActions,
      },
    });
  }

  private async persistExplainability(
    companyId: number,
    projectId: number,
    explain: ReturnType<CailExplainabilityEngine['forPrediction']>,
    confidence: number,
  ) {
    const built = this.explainability.build({ ...explain, confidence });
    await this.prisma.cailExplainability.create({
      data: {
        companyId,
        projectId,
        targetType: built.targetType,
        targetId: built.targetId,
        summary: built.summary,
        whyJson: built.why as Prisma.InputJsonValue,
        dataSourcesJson: built.dataSources,
        hazardFactorsJson: built.hazardFactors,
        controlFactorsJson: built.controlFactors,
        workerFactorsJson: built.workerFactors,
        equipmentFactorsJson: built.equipmentFactors,
        projectFactorsJson: built.projectFactors,
        confidence: built.confidence,
        recommendedActionsJson: built.recommendedActions,
      },
    });
  }

  async ingestProjectData(companyId: number, projectId: number) {
    const raw: Array<{
      module: string;
      id: string;
      payload: Record<string, unknown>;
    }> = [];

    const hazards = await this.prisma.pmUnifiedHazard.findMany({
      where: { projectId, deletedAt: null },
      take: 50,
    });
    for (const h of hazards) {
      raw.push({
        module: 'hazard',
        id: h.id,
        payload: {
          severity: h.severity,
          sifPotential: h.sifPotential,
          status: h.status,
        },
      });
    }

    const capas = await this.prisma.pmCorrectiveAction.findMany({
      where: { projectId, deletedAt: null },
      take: 50,
    });
    for (const c of capas) {
      raw.push({
        module: 'corrective_action',
        id: c.id,
        payload: {
          severityScore: c.severityScore,
          status: c.status,
          overdue: c.dueAt ? c.dueAt < new Date() : false,
        },
      });
    }

    const report = this.ingestion.normalize(raw);
    for (const rec of report.records) {
      await this.prisma.cailTrainingData.create({
        data: {
          companyId,
          projectId,
          sourceModule: rec.sourceModule,
          sourceId: rec.sourceId,
          featureJson: rec.featureJson as Prisma.InputJsonValue,
          labelJson: rec.labelJson as Prisma.InputJsonValue,
          qualityScore: rec.qualityScore,
        },
      });
    }
    return report;
  }

  async buildCorrelations(companyId: number, projectId: number) {
    const links: Awaited<ReturnType<CailCorrelationEngine['hazardToJha']>> = [];

    const hazards = await this.prisma.pmUnifiedHazard.findMany({
      where: { projectId, deletedAt: null },
      take: 20,
    });
    for (const h of hazards) {
      const jhas = await this.prisma.jhaFlha.findMany({
        where: {
          projectId,
          status: { in: ['APPROVED', 'SUBMITTED', 'UNDER_REVIEW'] },
        },
        take: 5,
        select: { id: true },
      });
      links.push(
        ...this.correlations.hazardToJha(
          h.id,
          jhas.map((j) => j.id),
        ),
      );

      const capas = await this.prisma.pmCorrectiveAction.findMany({
        where: { hazardId: h.id, deletedAt: null },
        take: 5,
        select: { id: true },
      });
      if (capas.length) {
        links.push(
          ...this.correlations.controlToCapa(
            h.id,
            capas.map((c) => c.id),
          ),
        );
      }
    }

    for (const link of links) {
      await this.prisma.cailCorrelation.create({
        data: {
          companyId,
          projectId,
          leftModule: link.leftModule,
          leftEntityId: link.leftEntityId,
          rightModule: link.rightModule,
          rightEntityId: link.rightEntityId,
          correlationType: link.correlationType,
          strength: link.strength,
          evidenceJson: link.evidence,
        },
      });
    }
    return { created: links.length };
  }

  async listPredictions(filters: {
    companyId: number;
    projectId?: number;
    limit?: number;
  }) {
    return this.prisma.cailPrediction.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 50,
    });
  }

  async listScores(filters: {
    companyId: number;
    projectId?: number;
    scoreType?: CailIntelScoreType;
    limit?: number;
  }) {
    return this.prisma.cailScore.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.scoreType ? { scoreType: filters.scoreType } : {}),
      },
      orderBy: { computedAt: 'desc' },
      take: filters.limit ?? 50,
    });
  }

  async listRecommendations(filters: {
    companyId: number;
    projectId?: number;
    status?: string;
  }) {
    return this.prisma.cailRecommendation.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        status: filters.status ?? 'open',
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async listCorrelations(filters: { companyId: number; projectId?: number }) {
    return this.prisma.cailCorrelation.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { computedAt: 'desc' },
      take: 100,
    });
  }

  async getExplainability(id: string) {
    const row = await this.prisma.cailExplainability.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('Explainability record not found');
    const built = this.explainability.build({
      targetType: row.targetType,
      targetId: row.targetId,
      summary: row.summary,
      why: row.whyJson as Record<string, unknown>,
      dataSources: row.dataSourcesJson as string[],
      hazardFactors: row.hazardFactorsJson as string[],
      controlFactors: row.controlFactorsJson as string[],
      workerFactors: row.workerFactorsJson as string[],
      equipmentFactors: row.equipmentFactorsJson as string[],
      projectFactors: row.projectFactorsJson as string[],
      confidence: row.confidence,
      recommendedActions: row.recommendedActionsJson as string[],
    });
    return { ...row, humanReadable: built.humanReadable };
  }

  async buildOfflineBundle(filters: { companyId: number; projectId?: number }) {
    const cacheKey = `cail_offline_${filters.companyId}_${
      filters.projectId ?? 'all'
    }`;
    const [predictions, scores, recommendations, models] = await Promise.all([
      this.listPredictions({ ...filters, limit: 100 }),
      this.listScores({ ...filters, limit: 100 }),
      this.listRecommendations({ ...filters }),
      this.prisma.cailModel.findMany({
        where: {
          OR: [{ companyId: filters.companyId }, { companyId: null }],
          deletedAt: null,
        },
      }),
    ]);

    const payload = {
      predictions,
      scores,
      recommendations,
      modelKey: MODEL_KEY,
      builtAt: new Date().toISOString(),
    };

    await this.prisma.cailOfflineCache.upsert({
      where: { cacheKey },
      create: {
        companyId: filters.companyId,
        projectId: filters.projectId,
        cacheKey,
        payload: payload as Prisma.InputJsonValue,
        modelVersionsJson: { [MODEL_KEY]: 1 },
      },
      update: {
        payload: payload as Prisma.InputJsonValue,
        syncedAt: new Date(),
        cacheVersion: { increment: 1 },
      },
    });

    return payload;
  }

  async getAnalyticsTrends(filters: { companyId: number; projectId?: number }) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const where = {
      companyId: filters.companyId,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    const [predictions, scores, recommendations, inferences] =
      await Promise.all([
        this.prisma.cailPrediction.count({
          where: { ...where, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.cailScore.count({
          where: { ...where, computedAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.cailRecommendation.count({
          where: { ...where, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.cailInferenceLog.count({
          where: { ...where, createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    const highRiskPreds = await this.prisma.cailPrediction.count({
      where: {
        ...where,
        riskLevel: { in: ['high', 'critical'] },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      leadingIndicators: {
        predictions30d: predictions,
        highRiskPredictions: highRiskPreds,
        recommendations30d: recommendations,
        inferenceRuns30d: inferences,
      },
      laggingIndicators: {
        scoresComputed30d: scores,
      },
      sifHecaTrend: highRiskPreds,
    };
  }

  async listModels(companyId: number) {
    return this.prisma.cailModel.findMany({
      where: { OR: [{ companyId }, { companyId: null }], deletedAt: null },
      include: { versions: { orderBy: { version: 'desc' }, take: 5 } },
    });
  }

  async deployModel(modelId: string, version: number, actorId?: number) {
    const model = await this.prisma.cailModel.update({
      where: { id: modelId },
      data: { status: 'deployed', activeVersion: version },
    });
    await this.prisma.cailModelVersion.updateMany({
      where: { modelId },
      data: { deployedAt: null },
    });
    await this.prisma.cailModelVersion.update({
      where: { modelId_version: { modelId, version } },
      data: { deployedAt: new Date() },
    });
    await this.prisma.cailModelAudit.create({
      data: { modelId, version, eventType: 'deployed', actorId },
    });
    return model;
  }

  async rollbackModel(modelId: string, toVersion: number, actorId?: number) {
    const model = await this.prisma.cailModel.update({
      where: { id: modelId },
      data: { status: 'rolled_back', activeVersion: toVersion },
    });
    await this.prisma.cailModelAudit.create({
      data: {
        modelId,
        version: toVersion,
        eventType: 'rolled_back',
        actorId,
        payload: { toVersion },
      },
    });
    return model;
  }

  async getModel(modelId: string) {
    const model = await this.prisma.cailModel.findFirst({
      where: { id: modelId, deletedAt: null },
      include: {
        versions: { orderBy: { version: 'desc' } },
        audits: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!model) throw new NotFoundException('CAIL model not found');
    return model;
  }

  /** Spec: POST /cail/predict */
  async predict(input: {
    companyId: number;
    projectId: number;
    workerId?: number;
    equipmentId?: number;
    predictionType?: CailIntelPredictionType;
  }) {
    const signals = await this.collectProjectSignals(input.projectId);
    await this.ensureDefaultModel(input.companyId);
    const predictions: Array<Record<string, unknown>> = [];

    const projectRisk = this.predictive.projectRisk({
      projectScore: this.scoring.projectSafetyScore({
        openCapa: signals.openCapa,
        overdueCapa: signals.overdueCapa,
        criticalHazards: signals.criticalHazards,
        openIncidents: signals.openIncidents,
        closureRate:
          signals.openCapa > 0
            ? Math.max(0, 100 - signals.overdueCapa * 10)
            : 100,
      }).score,
      overdueCapa: signals.overdueCapa,
      emergencyActive: signals.emergencyActive,
    });
    if (!input.predictionType || input.predictionType === 'project_risk') {
      await this.persistPrediction(
        input.companyId,
        input.projectId,
        'project',
        String(input.projectId),
        'project_risk',
        projectRisk,
        'realtime',
      );
      predictions.push({ type: 'project_risk', ...projectRisk });
    }

    const capaOverdue = this.predictive.capaOverdueRisk({
      openCount: signals.openCapa,
      overdueCount: signals.overdueCapa,
      avgDaysToDue: 7,
      escalationMax: 3,
    });
    if (!input.predictionType || input.predictionType === 'capa_overdue') {
      await this.persistPrediction(
        input.companyId,
        input.projectId,
        'project',
        String(input.projectId),
        'capa_overdue',
        capaOverdue,
        'realtime',
      );
      predictions.push({ type: 'capa_overdue', ...capaOverdue });
    }

    if (
      input.workerId &&
      (!input.predictionType || input.predictionType === 'incident_likelihood')
    ) {
      const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
        where: { workerId: input.workerId },
      });
      const incidentPred = this.predictive.incidentLikelihood({
        workerScore: profile?.safetyScore ?? 75,
        openCapa: signals.openCapa,
        sifExposures: await this.prisma.pmWorkerHazardExposure.count({
          where: { workerId: input.workerId, sifPotential: true },
        }),
        incidents90d: signals.openIncidents,
      });
      await this.persistPrediction(
        input.companyId,
        input.projectId,
        'worker',
        String(input.workerId),
        'incident_likelihood',
        incidentPred,
        'realtime',
      );
      predictions.push({ type: 'incident_likelihood', ...incidentPred });
    }

    if (
      input.equipmentId &&
      (!input.predictionType || input.predictionType === 'equipment_failure')
    ) {
      const failures = await this.prisma.pmEquipmentFailure.count({
        where: {
          equipmentId: input.equipmentId,
          createdAt: { gte: signals.since90 },
        },
      });
      const eqPred = this.predictive.equipmentFailure({
        failures90d: failures,
        openCapa: await this.prisma.pmCorrectiveAction.count({
          where: {
            projectId: input.projectId,
            equipmentId: input.equipmentId,
            deletedAt: null,
            status: { notIn: ['verified', 'closed', 'cancelled'] },
          },
        }),
        inspectionFailures: 0,
      });
      await this.persistPrediction(
        input.companyId,
        input.projectId,
        'equipment',
        String(input.equipmentId),
        'equipment_failure',
        eqPred,
        'realtime',
      );
      predictions.push({ type: 'equipment_failure', ...eqPred });
    }

    return { predictions, modelKey: MODEL_KEY };
  }

  /** Spec: POST /cail/score */
  async score(input: {
    companyId: number;
    projectId: number;
    workerId?: number;
    equipmentId?: number;
    scoreType?: CailIntelScoreType;
  }) {
    const signals = await this.collectProjectSignals(input.projectId);
    const scores: Array<{
      scoreType: string;
      score: number;
      components: unknown;
    }> = [];

    if (!input.scoreType || input.scoreType === 'project_safety') {
      const ps = this.scoring.projectSafetyScore({
        openCapa: signals.openCapa,
        overdueCapa: signals.overdueCapa,
        criticalHazards: signals.criticalHazards,
        openIncidents: signals.openIncidents,
        closureRate:
          signals.openCapa > 0
            ? Math.max(0, 100 - signals.overdueCapa * 10)
            : 100,
      });
      await this.persistScore(
        input.companyId,
        input.projectId,
        'project',
        String(input.projectId),
        'project_safety',
        ps.score,
        ps.components,
        'realtime',
      );
      scores.push({
        scoreType: 'project_safety',
        score: ps.score,
        components: ps.components,
      });
    }

    if (
      input.workerId &&
      (!input.scoreType || input.scoreType === 'worker_safety')
    ) {
      const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
        where: { workerId: input.workerId },
      });
      const ws = this.scoring.workerSafetyScore({
        profileScore: profile?.safetyScore ?? 75,
        overdueCapa: signals.overdueCapa,
        denials30d: signals.accessDenials30d,
        sifExposures: await this.prisma.pmWorkerHazardExposure.count({
          where: { workerId: input.workerId, sifPotential: true },
        }),
      });
      await this.persistScore(
        input.companyId,
        input.projectId,
        'worker',
        String(input.workerId),
        'worker_safety',
        ws.score,
        ws.components,
        'realtime',
      );
      scores.push({
        scoreType: 'worker_safety',
        score: ws.score,
        components: ws.components,
      });
    }

    if (
      input.equipmentId &&
      (!input.scoreType || input.scoreType === 'equipment_safety')
    ) {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: input.equipmentId },
      });
      const es = this.scoring.equipmentSafetyScore({
        safetyStatus: eq?.safetyStatus ?? 'OK',
        lockoutStatus: eq?.lockoutStatus ?? 'CLEAR',
        openCapa: await this.prisma.pmCorrectiveAction.count({
          where: {
            projectId: input.projectId,
            equipmentId: input.equipmentId,
            deletedAt: null,
            status: { notIn: ['verified', 'closed', 'cancelled'] },
          },
        }),
        failures90d: await this.prisma.pmEquipmentFailure.count({
          where: {
            equipmentId: input.equipmentId,
            createdAt: { gte: signals.since90 },
          },
        }),
      });
      await this.persistScore(
        input.companyId,
        input.projectId,
        'equipment',
        String(input.equipmentId),
        'equipment_safety',
        es.score,
        es.components,
        'realtime',
      );
      scores.push({
        scoreType: 'equipment_safety',
        score: es.score,
        components: es.components,
      });
    }

    const companyScore = this.scoring.companySafetyScore(
      scores
        .filter((s) => s.scoreType === 'project_safety')
        .map((s) => s.score),
    );
    if (!input.scoreType || input.scoreType === 'company_safety') {
      await this.persistScore(
        input.companyId,
        undefined,
        'company',
        String(input.companyId),
        'company_safety',
        companyScore.score,
        companyScore.components,
        'realtime',
      );
      scores.push({
        scoreType: 'company_safety',
        score: companyScore.score,
        components: companyScore.components,
      });
    }

    return { scores, modelKey: MODEL_KEY };
  }

  /** Spec: POST /cail/recommend */
  async recommend(input: { companyId: number; projectId: number }) {
    const signals = await this.collectProjectSignals(input.projectId);
    const violations = this.rules.evaluate({
      openCapa: signals.openCapa,
      overdueCapa: signals.overdueCapa,
      criticalHazards: signals.criticalHazards,
      weakControls: signals.weakControls,
      expiredTraining: signals.expiredTraining,
      accessDenials30d: signals.accessDenials30d,
      openIncidents: signals.openIncidents,
      equipmentFailures: signals.equipmentFailures,
      emergencyActive: signals.emergencyActive,
    });
    const recs = this.recommendations.fromViolations(violations);
    for (const rec of recs.slice(0, 20)) {
      await this.persistRecommendation(input.companyId, input.projectId, rec);
    }
    return { recommendations: recs, created: recs.length };
  }

  /** Spec: POST /cail/correlate */
  correlate(input: { companyId: number; projectId: number }) {
    return this.buildCorrelations(input.companyId, input.projectId);
  }

  /** Spec: POST /cail/explain */
  async explain(input: {
    companyId: number;
    projectId?: number;
    explainabilityId?: string;
    predictionType?: string;
    entityType?: string;
    entityId?: string;
  }) {
    if (input.explainabilityId) {
      return this.getExplainability(input.explainabilityId);
    }
    const latest = await this.prisma.cailExplainability.findFirst({
      where: {
        companyId: input.companyId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ...(input.entityId ? { targetId: input.entityId } : {}),
        ...(input.predictionType ? { targetType: input.predictionType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) return this.getExplainability(latest.id);

    if (!input.projectId) {
      throw new NotFoundException(
        'projectId required to generate explainability',
      );
    }
    const signals = await this.collectProjectSignals(input.projectId);
    const explain = this.explainability.forPrediction(
      input.predictionType ?? 'project_risk',
      0.5,
      ['open_capa', 'overdue_capa', 'critical_hazards'].filter(
        (f) =>
          (f === 'open_capa' && signals.openCapa > 0) ||
          (f === 'overdue_capa' && signals.overdueCapa > 0) ||
          (f === 'critical_hazards' && signals.criticalHazards > 0),
      ),
      ['corrective_actions', 'hazards', 'incidents'],
    );
    await this.persistExplainability(
      input.companyId,
      input.projectId ?? 0,
      explain,
      0.75,
    );
    const row = await this.prisma.cailExplainability.findFirst({
      where: { companyId: input.companyId },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.getExplainability(row.id) : explain;
  }

  /** Spec: POST /cail/model/train */
  async trainModel(
    input: { companyId: number; projectId: number; modelId?: string },
    actorId?: number,
  ) {
    const model = input.modelId
      ? await this.getModel(input.modelId)
      : await this.ensureDefaultModel(input.companyId, actorId);
    const report = await this.ingestProjectData(
      input.companyId,
      input.projectId,
    );
    const nextVersion = model.activeVersion + 1;
    await this.prisma.cailModelVersion.create({
      data: {
        modelId: model.id,
        version: nextVersion,
        algorithm: MODEL_KEY,
        metricsJson: {
          trainingRecords: report.records.length,
          qualityScore:
            report.records.length > 0
              ? report.records.reduce((s, r) => s + r.qualityScore, 0) /
                report.records.length
              : 1,
        } as Prisma.InputJsonValue,
      },
    });
    await this.prisma.cailModelAudit.create({
      data: {
        modelId: model.id,
        version: nextVersion,
        eventType: 'trained',
        actorId,
        payload: { records: report.records.length },
      },
    });
    return {
      modelId: model.id,
      version: nextVersion,
      trainingRecords: report.records.length,
      report,
    };
  }

  /** Spec: POST /cail/offline/infer */
  async offlineInfer(
    input: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      localScores?: Array<Record<string, unknown>>;
      localPredictions?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    if (input.localScores?.length || input.localPredictions?.length) {
      await this.applyOfflineSync(
        input.companyId,
        input.projectId,
        {
          scores: input.localScores,
          predictions: input.localPredictions,
        },
        actorId,
      );
    }
    const inference = await this.runRealtimeInference({
      companyId: input.companyId,
      projectId: input.projectId,
      workerId: input.workerId,
      equipmentId: input.equipmentId,
    });
    return {
      ...inference,
      serverState: await this.buildOfflineBundle({
        companyId: input.companyId,
        projectId: input.projectId,
      }),
    };
  }

  async applyOfflineSync(
    companyId: number,
    projectId: number,
    payload: {
      predictions?: Array<Record<string, unknown>>;
      scores?: Array<Record<string, unknown>>;
      recommendations?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    let applied = 0;
    for (const p of payload.predictions ?? []) {
      if (!p.predictionType || !p.entityId) continue;
      await this.persistPrediction(
        companyId,
        projectId,
        (p.entityType as CailIntelEntityType) ?? 'project',
        String(p.entityId),
        p.predictionType as CailIntelPredictionType,
        {
          probability: Number(p.probability ?? p.predictionValue ?? 0.5),
          riskLevel: String(p.riskLevel ?? 'medium'),
          factors: Array.isArray(p.factors) ? (p.factors as string[]) : [],
        },
        'offline',
      );
      applied++;
    }
    for (const s of payload.scores ?? []) {
      if (!s.scoreType || !s.entityId) continue;
      await this.persistScore(
        companyId,
        projectId,
        (s.entityType as CailIntelEntityType) ?? 'project',
        String(s.entityId),
        s.scoreType as CailIntelScoreType,
        Number(s.score ?? s.scoreValue ?? 0),
        s.contributingFactors ?? s.components ?? {},
        'offline',
      );
      applied++;
    }
    for (const r of payload.recommendations ?? []) {
      if (!r.title) continue;
      await this.persistRecommendation(companyId, projectId, {
        recommendationType: String(r.recommendationType ?? 'corrective_action'),
        title: String(r.title),
        reason: String(r.reason ?? r.recommendationText ?? ''),
        evidence: Array.isArray(r.evidence) ? (r.evidence as string[]) : [],
        confidence: Number(r.confidence ?? 0.7),
        requiredActions: Array.isArray(r.requiredActions)
          ? (r.requiredActions as string[])
          : [],
      });
      applied++;
    }
    await this.logInference(
      companyId,
      projectId,
      'offline',
      'offline_sync',
      `applied=${applied}`,
      0,
      actorId,
    );
    return {
      ok: true,
      applied,
      serverState: await this.buildOfflineBundle({ companyId, projectId }),
    };
  }
}
