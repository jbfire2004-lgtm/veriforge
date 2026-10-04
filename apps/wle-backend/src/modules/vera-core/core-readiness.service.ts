import { Injectable, NotFoundException } from '@nestjs/common';

import { VeraAssessmentEngine } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { VerificationService } from '../../verification/verification.service';

import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';

import { ReportingCoreService } from '../reporting-core/reporting-core.service';

import { TrainingAssessmentRunnerService } from '../assessment-engines/training-assessment-runner.service';

import { AssessmentEnginesService } from '../assessment-engines/assessment-engines.service';

import { SafetyKnowledgeService } from '../safety-knowledge/safety-knowledge.service';

import { FitTestService } from '../fit-test/fit-test.service';

import { AcpAccessService } from '../../acp/acp-access.service';

import { evaluateFitTest } from '../fit-test/fit-test.engine';

import {
  assessmentStatusToVisualState,
  complianceRateToVisualState,
  competencyRollupToVisualState,
  fitTestRateToVisualState,
  predictiveRiskToVisualState,
  type ReadinessDimensionPayload,
  type ReadinessVisualState,
  scoreToVisualState,
  trainingExpiryScore,
  trainingExpiryToVisualState,
} from './readiness-scoring';

type AssessmentRollup = {
  evaluated: number;

  missing: number;

  passing: number;

  atRisk: number;

  failing: number;

  averageScore: number;

  complianceRate: number;

  state: ReadinessVisualState;
};

@Injectable()
export class CoreReadinessService {
  constructor(
    private readonly reporting: ReportingCoreService,

    private readonly widgets: DashboardWidgetsService,

    private readonly verification: VerificationService,

    private readonly prisma: PrismaService,

    private readonly trainingAssessment: TrainingAssessmentRunnerService,

    private readonly assessmentEngines: AssessmentEnginesService,

    private readonly safetyKnowledge: SafetyKnowledgeService,

    private readonly fitTests: FitTestService,

    private readonly acpAccess: AcpAccessService,
  ) {}

  async summary(companyId?: number, userId?: number) {
    const [overview, bundle] = await Promise.all([
      this.reporting.overview(companyId),

      this.widgets.getBundle({
        companyId,

        includeWorkerCompliance: true,

        includeEquipmentCompliance: true,

        includeTrainingExpiry: true,

        includeProjectReadiness: true,
      }),
    ]);

    const worker = bundle.workerCompliance;

    const equipment = bundle.equipmentCompliance;

    const training = bundle.trainingExpiry ?? null;

    let companyAssessments: {
      spce: {
        overallScore: number;

        overallStatus: string;

        evaluatedAt: string;

        state: ReadinessVisualState;
      } | null;

      smartGap: {
        overallScore: number;

        overallStatus: string;

        evaluatedAt: string;

        state: ReadinessVisualState;
      } | null;
    } | null = null;

    let fitTests: {
      totalWorkers: number;

      current: number;

      expired: number;

      expiring30: number;

      missing: number;

      failed: number;

      complianceRate: number;

      state: ReadinessVisualState;
    } | null = null;

    let workerAssessments: {
      trainingAssessment: AssessmentRollup | null;

      safetyKnowledge: AssessmentRollup | null;
    } | null = null;

    let competency: {
      worker: {
        total: number;

        current: number;

        expired: number;

        failed: number;

        missing: number;

        complianceRate: number;

        state: ReadinessVisualState;
      };

      equipment: {
        total: number;

        compliant: number;

        nonCompliant: number;

        overdueInspection: number;

        complianceRate: number;

        state: ReadinessVisualState;
      };
    } | null = null;

    let predictiveSafety: {
      tierAllowed: boolean;

      overallRiskIndex: number | null;

      overallRiskLevel: string | null;

      highRiskWorkers: number;

      highRiskTasks: number;

      weekStart: string | null;

      state: ReadinessVisualState | null;
    } | null = null;

    if (companyId) {
      const [
        spce,

        sga,

        fitSummary,

        taeRollup,

        skeRollup,

        competencySummary,

        predictiveAllowed,
      ] = await Promise.all([
        this.assessmentEngines.getLatestByEngine(
          VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,

          { companyId },
        ),

        this.assessmentEngines.getLatestByEngine(
          VeraAssessmentEngine.SMART_GAP_ANALYSIS,

          { companyId },
        ),

        this.fitTests.companySummary(companyId),

        this.rollupWorkerAssessmentEngine(
          companyId,
          VeraAssessmentEngine.TRAINING_ASSESSMENT,
        ),

        this.rollupWorkerAssessmentEngine(
          companyId,
          VeraAssessmentEngine.SAFETY_KNOWLEDGE,
        ),

        this.companyCompetencySummary(companyId),

        userId ? this.isPredictiveTierAllowed(userId) : Promise.resolve(false),
      ]);

      companyAssessments = {
        spce: spce
          ? {
              overallScore: spce.overallScore,

              overallStatus: spce.overallStatus,

              evaluatedAt: spce.evaluatedAt.toISOString(),

              state: assessmentStatusToVisualState(
                spce.overallStatus,
                spce.overallScore,
              ),
            }
          : null,

        smartGap: sga
          ? {
              overallScore: sga.overallScore,

              overallStatus: sga.overallStatus,

              evaluatedAt: sga.evaluatedAt.toISOString(),

              state: assessmentStatusToVisualState(
                sga.overallStatus,
                sga.overallScore,
              ),
            }
          : null,
      };

      fitTests = {
        ...fitSummary,

        state: fitTestRateToVisualState(fitSummary),
      };

      workerAssessments = {
        trainingAssessment: taeRollup,

        safetyKnowledge: skeRollup,
      };

      competency = competencySummary;

      if (predictiveAllowed) {
        predictiveSafety = await this.predictiveSafetySummary(companyId);
      } else {
        predictiveSafety = {
          tierAllowed: false,

          overallRiskIndex: null,

          overallRiskLevel: null,

          highRiskWorkers: 0,

          highRiskTasks: 0,

          weekStart: null,

          state: null,
        };
      }
    }

    const workerState = complianceRateToVisualState(
      worker?.complianceRate ?? overview.workers?.summary?.complianceRate ?? 0,

      worker?.nonCompliant ?? 0,
    );

    const equipmentState = complianceRateToVisualState(
      equipment?.complianceRate ?? 0,

      equipment?.nonCompliant ?? 0,

      equipment?.lockedOut ?? 0,
    );

    const trainingScore = training ? trainingExpiryScore(training) : null;

    const trainingState = training
      ? trainingExpiryToVisualState(training)
      : null;

    const dimensions: ReadinessDimensionPayload[] = this.buildCompanyDimensions(
      {
        workers: {
          score:
            worker?.complianceRate ??
            overview.workers?.summary?.complianceRate ??
            0,

          state: workerState,

          metrics: {
            total: worker?.totalWorkers ?? 0,

            compliant: worker?.compliant ?? 0,

            nonCompliant: worker?.nonCompliant ?? 0,

            expiringSoon: worker?.expiringSoon ?? 0,
          },
        },

        equipment: {
          score: equipment?.complianceRate ?? 0,

          state: equipmentState,

          metrics: {
            total: equipment?.total ?? 0,

            compliant: equipment?.compliant ?? 0,

            nonCompliant: equipment?.nonCompliant ?? 0,

            overdueInspection: equipment?.overdueInspection ?? 0,
          },
        },

        training: training
          ? {
              score: trainingScore!,

              state: trainingState!,

              metrics: {
                expired: training.expired,

                expiring30: training.expiring30,

                highRisk: training.highRisk,

                gaps: training.gaps,
              },
            }
          : null,

        fitTests,

        workerAssessments,

        companyAssessments,

        competency,

        predictiveSafety,
      },
    );

    return {
      generatedAt: new Date().toISOString(),

      companyId: companyId ?? null,

      dimensions,

      companyAssessments,

      workerAssessments,

      competency,

      predictiveSafety,

      fitTests,

      workers: {
        totalWorkers:
          worker?.totalWorkers ?? overview.workers?.summary?.totalWorkers ?? 0,

        compliant: worker?.compliant ?? 0,

        nonCompliant: worker?.nonCompliant ?? 0,

        expiringSoon: worker?.expiringSoon ?? 0,

        complianceRate:
          worker?.complianceRate ??
          overview.workers?.summary?.complianceRate ??
          0,

        topIssues: worker?.topIssues ?? [],

        score: worker?.complianceRate ?? 0,

        state: workerState,
      },

      equipment: {
        total: equipment?.total ?? overview.equipment?.summary?.total ?? 0,

        compliant: equipment?.compliant ?? 0,

        nonCompliant: equipment?.nonCompliant ?? 0,

        overdueInspection: equipment?.overdueInspection ?? 0,

        complianceRate: equipment?.complianceRate ?? 0,

        score: equipment?.complianceRate ?? 0,

        state: equipmentState,
      },

      training: training
        ? { ...training, score: trainingScore, state: trainingState }
        : null,

      projects: bundle.projectReadiness ?? null,

      overview,
    };
  }

  async workerScore(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },

      select: { id: true, firstName: true, lastName: true, companyId: true },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const compliance = await this.verification.evaluateWorkerCompliance(
      workerId,
    );

    const now = new Date();

    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [records, latestTae, latestSk, latestFit, competencyRows] =
      await Promise.all([
        this.prisma.trainingRecord.findMany({
          where: { workerId },

          include: { certification: true },

          orderBy: { expiresAt: 'asc' },
        }),

        this.trainingAssessment.getLatest(workerId),

        this.safetyKnowledge.getLatest(workerId),

        this.prisma.fitTestRun.findFirst({
          where: { workerId },

          orderBy: { performedAt: 'desc' },
        }),

        this.prisma.competencyEvaluation.findMany({
          where: { workerId },

          orderBy: { evaluationDate: 'desc' },

          take: 50,
        }),
      ]);

    const expired = records.filter(
      (r) => r.expiresAt && r.expiresAt <= now,
    ).length;

    const expiring30 = records.filter(
      (r) => r.expiresAt && r.expiresAt > now && r.expiresAt <= d30,
    ).length;

    const blocking = compliance.issues.filter(
      (i) =>
        i.type === 'MISSING' ||
        i.type === 'EXPIRED' ||
        i.type === 'NO_DOCUMENT',
    ).length;

    const score = Math.min(
      100,

      compliance.isCompliant
        ? Math.max(70, 100 - compliance.issues.length * 5)
        : Math.max(0, 60 - blocking * 15 - compliance.issues.length * 5),
    );

    const trainingState = trainingExpiryToVisualState({
      expired,

      highRisk: expired,

      gaps: blocking,
    });

    let trainingAssessmentSummary: {
      runId: string;

      overallScore: number;

      overallStatus: string;

      evaluatedAt: string;

      state: ReadinessVisualState;
    } | null = null;

    if (latestTae) {
      trainingAssessmentSummary = {
        runId: latestTae.id,

        overallScore: latestTae.overallScore,

        overallStatus: latestTae.overallStatus,

        evaluatedAt: latestTae.evaluatedAt.toISOString(),

        state: assessmentStatusToVisualState(
          latestTae.overallStatus,

          latestTae.overallScore,
        ),
      };
    }

    let safetyKnowledgeSummary: {
      overallScore: number;

      overallStatus: string;

      evaluatedAt: string;

      state: ReadinessVisualState;
    } | null = null;

    if (latestSk) {
      safetyKnowledgeSummary = {
        overallScore: latestSk.overallScore,

        overallStatus: latestSk.overallStatus,

        evaluatedAt: latestSk.evaluatedAt.toISOString(),

        state: assessmentStatusToVisualState(
          latestSk.overallStatus,

          latestSk.overallScore,
        ),
      };
    }

    let fitTestSummary: {
      pass: boolean;

      statusLabel: string;

      result: string;

      performedAt: string;

      expiresAt: string | null;

      expired: boolean;

      expiringSoon: boolean;

      state: ReadinessVisualState;
    } | null = null;

    if (latestFit) {
      const ev = evaluateFitTest({
        result: latestFit.result,

        performedAt: latestFit.performedAt,

        expiresAt: latestFit.expiresAt,
      });

      const state: ReadinessVisualState = ev.pass
        ? ev.expiringSoon
          ? 'AT_RISK'
          : 'OK'
        : ev.statusLabel === 'FAIL'
        ? 'NON_COMPLIANT'
        : 'AT_RISK';

      fitTestSummary = {
        pass: ev.pass,

        statusLabel: ev.statusLabel,

        result: latestFit.result,

        performedAt: latestFit.performedAt.toISOString(),

        expiresAt: ev.expiresAt?.toISOString() ?? null,

        expired: ev.expired,

        expiringSoon: ev.expiringSoon,

        state,
      };
    }

    const latestCompetencyByEquipment = new Map<
      number,
      (typeof competencyRows)[0]
    >();

    for (const row of competencyRows) {
      if (!latestCompetencyByEquipment.has(row.equipmentId)) {
        latestCompetencyByEquipment.set(row.equipmentId, row);
      }
    }

    const competencyEvals = [...latestCompetencyByEquipment.values()];

    const competencyCurrent = competencyEvals.filter(
      (row) => row.passed && (!row.expiresAt || row.expiresAt > now),
    ).length;

    const competencyExpired = competencyEvals.filter(
      (row) => row.passed && row.expiresAt && row.expiresAt <= now,
    ).length;

    const competencyFailed = competencyEvals.filter(
      (row) => !row.passed,
    ).length;

    const competencyTotal = competencyEvals.length;

    const competencyRate =
      competencyTotal > 0
        ? Math.round((competencyCurrent / competencyTotal) * 100)
        : 0;

    const competencySummary = {
      total: competencyTotal,

      current: competencyCurrent,

      expired: competencyExpired,

      failed: competencyFailed,

      complianceRate: competencyRate,

      state: competencyRollupToVisualState({
        total: competencyTotal,

        current: competencyCurrent,

        expired: competencyExpired,

        failed: competencyFailed,

        missing: 0,
      }),
    };

    const dimensions: ReadinessDimensionPayload[] = [
      {
        key: 'compliance',

        label: 'Verification compliance',

        score,

        state: scoreToVisualState(score, { criticalCount: blocking }),

        metrics: { issues: compliance.issues.length, blocking },
      },

      {
        key: 'training',

        label: 'Training records',

        score: trainingExpiryScore({
          expired,

          expiring30,

          highRisk: expired,

          gaps: blocking,
        }),

        state: trainingState,

        metrics: { total: records.length, expired, expiring30 },
      },
    ];

    if (trainingAssessmentSummary) {
      dimensions.push({
        key: 'tae',

        label: 'Training Assessment (TAE)',

        score: trainingAssessmentSummary.overallScore,

        state: trainingAssessmentSummary.state,

        metrics: {},

        evaluatedAt: trainingAssessmentSummary.evaluatedAt,
      });
    }

    if (safetyKnowledgeSummary) {
      dimensions.push({
        key: 'ske',

        label: 'Safety Knowledge (SKE)',

        score: safetyKnowledgeSummary.overallScore,

        state: safetyKnowledgeSummary.state,

        metrics: {},

        evaluatedAt: safetyKnowledgeSummary.evaluatedAt,
      });
    }

    if (fitTestSummary) {
      dimensions.push({
        key: 'fit_test',

        label: 'Fit test',

        score: fitTestSummary.pass
          ? fitTestSummary.expiringSoon
            ? 75
            : 100
          : 0,

        state: fitTestSummary.state,

        metrics: {},

        evaluatedAt: fitTestSummary.performedAt,
      });
    }

    if (competencyTotal > 0) {
      dimensions.push({
        key: 'competency',

        label: 'Equipment competency',

        score: competencyRate,

        state: competencySummary.state,

        metrics: {
          current: competencyCurrent,

          expired: competencyExpired,

          failed: competencyFailed,
        },
      });
    }

    return {
      workerId,

      worker,

      isCompliant: compliance.isCompliant,

      score,

      state: scoreToVisualState(score, { criticalCount: blocking }),

      issues: compliance.issues,

      dimensions,

      trainingAssessment: trainingAssessmentSummary,

      safetyKnowledge: safetyKnowledgeSummary,

      fitTest: fitTestSummary,

      competency: competencySummary,

      training: {
        total: records.length,

        expired,

        expiring30,

        state: trainingState,

        records: records.slice(0, 25).map((r) => ({
          id: r.id,

          certification: r.certification?.name ?? r.certificationId,

          issuedAt: r.issuedAt?.toISOString() ?? null,

          expiresAt: r.expiresAt?.toISOString() ?? null,

          status: r.expiresAt && r.expiresAt <= now ? 'EXPIRED' : 'ACTIVE',
        })),
      },
    };
  }

  async equipmentScore(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },

      include: {
        equipmentLinks: {
          where: { active: true },
          orderBy: { startDate: 'desc' },
        },

        inspections: { orderBy: { completedAt: 'desc' }, take: 10 },

        trainingRequirements: { include: { certification: true } },
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');

    const link = equipment.equipmentLinks[0];

    const status = link?.complianceStatus ?? 'UNKNOWN';

    const scoreMap: Record<string, number> = {
      COMPLIANT: 100,

      AT_RISK: 65,

      NON_COMPLIANT: 25,

      LOCKED_OUT: 0,
    };

    const score = scoreMap[status] ?? 50;

    const state: ReadinessVisualState =
      status === 'COMPLIANT'
        ? 'OK'
        : status === 'NEEDS_ATTENTION'
        ? 'AT_RISK'
        : 'NON_COMPLIANT';

    const now = new Date();

    const overdueInspection = equipment.inspections.filter(
      (i) =>
        i.nextInspectionDate && i.nextInspectionDate < now && !i.completedAt,
    ).length;

    return {
      equipmentId,

      equipment: {
        id: equipment.id,

        name: equipment.name,

        serialNumber: equipment.serialNumber,

        assetTag: equipment.assetTag,
      },

      complianceStatus: status,

      score,

      state,

      overdueInspection,

      inspections: equipment.inspections.map((i) => ({
        id: i.id,

        status: i.status,

        completedAt: i.completedAt?.toISOString() ?? null,

        nextInspectionDate: i.nextInspectionDate?.toISOString() ?? null,
      })),

      trainingRequirements: equipment.trainingRequirements.map((t) => ({
        certification: t.certification?.name ?? t.certificationId,

        certificationId: t.certificationId,
      })),
    };
  }

  private async companyWorkerIds(companyId: number): Promise<number[]> {
    const links = await this.prisma.companyLink.findMany({
      where: { companyId, active: true },

      select: { workerId: true },
    });

    return links.map((l) => l.workerId);
  }

  private async rollupWorkerAssessmentEngine(
    companyId: number,

    engine: VeraAssessmentEngine,
  ): Promise<AssessmentRollup | null> {
    const workerIds = await this.companyWorkerIds(companyId);

    if (!workerIds.length) return null;

    const runs = await this.prisma.veraAssessmentRun.findMany({
      where: { workerId: { in: workerIds }, engine },

      orderBy: { evaluatedAt: 'desc' },
    });

    const latestByWorker = new Map<number, (typeof runs)[0]>();

    for (const run of runs) {
      if (run.workerId != null && !latestByWorker.has(run.workerId)) {
        latestByWorker.set(run.workerId, run);
      }
    }

    const evaluated = latestByWorker.size;

    const missing = workerIds.length - evaluated;

    let passing = 0;

    let atRisk = 0;

    let failing = 0;

    let scoreSum = 0;

    for (const run of latestByWorker.values()) {
      scoreSum += run.overallScore;

      const state = assessmentStatusToVisualState(
        run.overallStatus,
        run.overallScore,
      );

      if (state === 'OK') passing += 1;
      else if (state === 'AT_RISK') atRisk += 1;
      else failing += 1;
    }

    const averageScore = evaluated > 0 ? Math.round(scoreSum / evaluated) : 0;

    const complianceRate =
      workerIds.length > 0 ? Math.round((passing / workerIds.length) * 100) : 0;

    return {
      evaluated,

      missing,

      passing,

      atRisk,

      failing,

      averageScore,

      complianceRate,

      state: scoreToVisualState(averageScore, {
        missingCount: missing,

        criticalCount: failing,
      }),
    };
  }

  private async companyCompetencySummary(companyId: number) {
    const workerIds = await this.companyWorkerIds(companyId);

    const now = new Date();

    const evals = workerIds.length
      ? await this.prisma.competencyEvaluation.findMany({
          where: { workerId: { in: workerIds } },

          orderBy: { evaluationDate: 'desc' },
        })
      : [];

    const latestByPair = new Map<string, (typeof evals)[0]>();

    for (const row of evals) {
      const key = `${row.workerId}:${row.equipmentId}`;

      if (!latestByPair.has(key)) latestByPair.set(key, row);
    }

    const latest = [...latestByPair.values()];

    let current = 0;

    let expired = 0;

    let failed = 0;

    for (const row of latest) {
      if (!row.passed) failed += 1;
      else if (row.expiresAt && row.expiresAt <= now) expired += 1;
      else current += 1;
    }

    const total = latest.length;

    const workerRate = total > 0 ? Math.round((current / total) * 100) : 0;

    const equipmentReport = await this.reporting.equipmentCompliance(companyId);

    const eq = equipmentReport.summary;

    return {
      worker: {
        total,

        current,

        expired,

        failed,

        missing: 0,

        complianceRate: workerRate,

        state: competencyRollupToVisualState({
          total,

          current,

          expired,

          failed,

          missing: 0,
        }),
      },

      equipment: {
        total: eq.total,

        compliant: eq.compliant,

        nonCompliant: eq.nonCompliant,

        overdueInspection: eq.overdueInspection,

        complianceRate: eq.complianceRate,

        state: complianceRateToVisualState(
          eq.complianceRate,
          eq.nonCompliant,
          eq.lockedOut,
        ),
      },
    };
  }

  private async isPredictiveTierAllowed(userId: number): Promise<boolean> {
    const result = await this.acpAccess.check({
      userId,

      feature: 'pm.predictive',

      minTier: 'predictive',
    });

    return Boolean(result.allowed);
  }

  private async predictiveSafetySummary(companyId: number) {
    const weekStart = this.startOfWeek(new Date());

    const forecast = await this.prisma.pmPredictiveSafetyForecast.findFirst({
      where: { companyId, projectId: null, weekStart },

      orderBy: { createdAt: 'desc' },
    });

    if (!forecast) {
      return {
        tierAllowed: true,

        overallRiskIndex: null,

        overallRiskLevel: null,

        highRiskWorkers: 0,

        highRiskTasks: 0,

        weekStart: null,

        state: 'AT_RISK' as ReadinessVisualState,
      };
    }

    const json = (forecast.forecastJson ?? {}) as Record<string, unknown>;

    const highRiskWorkers = Number(json.highRiskWorkers ?? 0);

    const highRiskTasks = Number(json.highRiskTasks ?? 0);

    return {
      tierAllowed: true,

      overallRiskIndex: forecast.riskIndex,

      overallRiskLevel: forecast.riskLevel,

      highRiskWorkers,

      highRiskTasks,

      weekStart: forecast.weekStart.toISOString(),

      state: predictiveRiskToVisualState(
        forecast.riskLevel,
        forecast.riskIndex,
      ),
    };
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);

    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);

    d.setHours(0, 0, 0, 0);

    return d;
  }

  private buildCompanyDimensions(input: {
    workers: {
      score: number;
      state: ReadinessVisualState;
      metrics: Record<string, number>;
    };

    equipment: {
      score: number;
      state: ReadinessVisualState;
      metrics: Record<string, number>;
    };

    training: {
      score: number;

      state: ReadinessVisualState;

      metrics: Record<string, number>;
    } | null;

    fitTests: { complianceRate: number; state: ReadinessVisualState } | null;

    workerAssessments: {
      trainingAssessment: AssessmentRollup | null;

      safetyKnowledge: AssessmentRollup | null;
    } | null;

    companyAssessments: {
      spce: {
        overallScore: number;
        state: ReadinessVisualState;
        evaluatedAt: string;
      } | null;

      smartGap: {
        overallScore: number;
        state: ReadinessVisualState;
        evaluatedAt: string;
      } | null;
    } | null;

    competency: {
      worker: { complianceRate: number; state: ReadinessVisualState };

      equipment: { complianceRate: number; state: ReadinessVisualState };
    } | null;

    predictiveSafety: {
      tierAllowed: boolean;

      overallRiskIndex: number | null;

      state: ReadinessVisualState | null;

      highRiskWorkers: number;
    } | null;
  }): ReadinessDimensionPayload[] {
    const rows: ReadinessDimensionPayload[] = [
      {
        key: 'workers',

        label: 'Worker compliance',

        score: input.workers.score,

        state: input.workers.state,

        metrics: input.workers.metrics,
      },

      {
        key: 'equipment',

        label: 'Equipment compliance',

        score: input.equipment.score,

        state: input.equipment.state,

        metrics: input.equipment.metrics,
      },
    ];

    if (input.training) {
      rows.push({
        key: 'training_expiry',

        label: 'Training expiry',

        score: input.training.score,

        state: input.training.state,

        metrics: input.training.metrics,
      });
    }

    if (input.workerAssessments?.trainingAssessment) {
      const tae = input.workerAssessments.trainingAssessment;

      rows.push({
        key: 'tae',

        label: 'Training Assessment (TAE)',

        score: tae.averageScore,

        state: tae.state,

        metrics: {
          evaluated: tae.evaluated,

          passing: tae.passing,

          atRisk: tae.atRisk,

          failing: tae.failing,

          missing: tae.missing,
        },
      });
    }

    if (input.workerAssessments?.safetyKnowledge) {
      const ske = input.workerAssessments.safetyKnowledge;

      rows.push({
        key: 'ske',

        label: 'Safety Knowledge (SKE)',

        score: ske.averageScore,

        state: ske.state,

        metrics: {
          evaluated: ske.evaluated,

          passing: ske.passing,

          atRisk: ske.atRisk,

          failing: ske.failing,

          missing: ske.missing,
        },
      });
    }

    if (input.fitTests) {
      rows.push({
        key: 'fit_test',

        label: 'Fit test',

        score: input.fitTests.complianceRate,

        state: input.fitTests.state,

        metrics: {},
      });
    }

    if (input.companyAssessments?.spce) {
      rows.push({
        key: 'spce',

        label: 'SPCE',

        score: input.companyAssessments.spce.overallScore,

        state: input.companyAssessments.spce.state,

        metrics: {},

        evaluatedAt: input.companyAssessments.spce.evaluatedAt,
      });
    }

    if (input.companyAssessments?.smartGap) {
      rows.push({
        key: 'sga',

        label: 'Smart Gap Analysis',

        score: input.companyAssessments.smartGap.overallScore,

        state: input.companyAssessments.smartGap.state,

        metrics: {},

        evaluatedAt: input.companyAssessments.smartGap.evaluatedAt,
      });
    }

    if (input.competency) {
      rows.push({
        key: 'worker_competency',

        label: 'Worker competency',

        score: input.competency.worker.complianceRate,

        state: input.competency.worker.state,

        metrics: {},
      });

      rows.push({
        key: 'equipment_competency',

        label: 'Equipment competency',

        score: input.competency.equipment.complianceRate,

        state: input.competency.equipment.state,

        metrics: {},
      });
    }

    if (input.predictiveSafety?.tierAllowed && input.predictiveSafety.state) {
      rows.push({
        key: 'predictive_safety',

        label: 'Predictive safety',

        score: Math.max(
          0,
          100 - (input.predictiveSafety.overallRiskIndex ?? 0),
        ),

        state: input.predictiveSafety.state,

        metrics: { highRiskWorkers: input.predictiveSafety.highRiskWorkers },
      });
    }

    return rows;
  }
}
